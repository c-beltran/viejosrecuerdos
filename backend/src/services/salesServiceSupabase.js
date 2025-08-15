const supabase = require('../utils/supabaseClient');

/**
 * Create a new sale (single or multiple items)
 */
const createSale = async (saleData, userId) => {
  try {
    console.log('=== Backend createSale called ===')
    console.log('Received saleData:', saleData)
    console.log('Sale date from request:', saleData.saleDate)
    console.log('User ID:', userId)
    
    const { items, clientId, paymentMethod, notes } = saleData;

    // Validate items
    if (!items || items.length === 0) {
      throw new Error('At least one item is required for a sale');
    }

    // Validate each item and check availability
    for (const item of items) {
      if (!item.itemId || !item.quantity || item.quantity <= 0) {
        throw new Error('Invalid item data: itemId and quantity are required');
      }

      // Check if item exists and has sufficient quantity
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory')
        .select('itemId, itemName, currentQuantity, unitPrice, status')
        .eq('itemId', item.itemId)
        .single();

      if (inventoryError || !inventoryItem) {
        throw new Error(`Item not found: ${item.itemId}`);
      }

      if (inventoryItem.status === 'Sold-Out') {
        throw new Error(`Item is sold out: ${inventoryItem.itemName}`);
      }

      if (inventoryItem.currentQuantity < item.quantity) {
        throw new Error(`Insufficient quantity for ${inventoryItem.itemName}. Available: ${inventoryItem.currentQuantity}, Requested: ${item.quantity}`);
      }

      // Set unit price from inventory if not provided
      if (!item.unitPrice) {
        item.unitPrice = inventoryItem.unitPrice;
      }

      // Calculate total price for this item
      item.totalPrice = item.unitPrice * item.quantity;
    }

    // Calculate total sale amount
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // Create sale record
    const saleRecord = {
      clientId: clientId || null,
      saleDate: saleData.saleDate || new Date().toISOString(), // Use provided sale date or default to now
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      status: saleData.status || 'Pending', // Use status from request or default to 'Pending'
      notes: notes || null,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('=== Sale Record being sent to database ===')
    console.log('Sale record:', saleRecord)
    console.log('Sale date being sent:', saleRecord.saleDate)

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([saleRecord])
      .select()
      .single();

    if (saleError) {
      throw new Error(`Failed to create sale: ${saleError.message}`);
    }

    // Create sale items
    const saleItems = items.map(item => ({
      saleId: sale.saleId,
      itemId: item.itemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      createdAt: new Date().toISOString()
    }));

    const { data: createdSaleItems, error: saleItemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)
      .select(`
        *,
        inventoryItem:itemId (
          itemId,
          itemName,
          category,
          currentQuantity,
          status
        )
      `);

    if (saleItemsError) {
      // Rollback sale if sale items creation fails
      await supabase.from('sales').delete().eq('saleId', sale.saleId);
      throw new Error(`Failed to create sale items: ${saleItemsError.message}`);
    }

    // Get client information if provided
    let clientInfo = null;
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('clientId, name, email, phone')
        .eq('clientId', clientId)
        .single();
      clientInfo = client;
    }

    return {
      success: true,
      data: {
        sale: {
          ...sale,
          client: clientInfo
        },
        items: createdSaleItems
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all sales with optional filtering
 */
const getAllSales = async (filters = {}) => {
  try {
    let query = supabase
      .from('sales')
      .select(`
        *,
        client:clientId (
          clientId,
          name,
          email,
          phone
        ),
        items:sale_items (
          saleItemId,
          quantity,
          unitPrice,
          totalPrice,
          inventoryItem:itemId (
            itemId,
            itemName,
            category
          )
        )
      `)
      .order('saleDate', { ascending: false });

    // Apply filters
    if (filters.clientId) {
      query = query.eq('clientId', filters.clientId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.paymentMethod) {
      query = query.eq('paymentMethod', filters.paymentMethod);
    }
    if (filters.startDate) {
      query = query.gte('saleDate', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('saleDate', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a single sale by ID
 */
const getSaleById = async (saleId) => {
  try {
    
    // First, get the sale with basic info
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .select(`
        *,
        client:clientId (
          clientId,
          name,
          email,
          phone,
          address
        )
      `)
      .eq('saleId', saleId)
      .single();

    if (saleError) {
      console.error('Sale query error:', saleError);
      if (saleError.code === 'PGRST116') {
        throw new Error('Sale not found');
      }
      throw new Error(`Database error: ${saleError.message}`);
    }

    // Then, get the sale items with inventory details
    const { data: saleItems, error: itemsError } = await supabase
      .from('sale_items')
      .select(`
        saleItemId,
        quantity,
        unitPrice,
        totalPrice,
        itemId
      `)
      .eq('saleId', saleId);

    if (itemsError) {
      console.error('Sale items query error:', itemsError);
      throw new Error(`Failed to fetch sale items: ${itemsError.message}`);
    }

    // Get inventory details for all items
    const itemIds = saleItems.map(item => item.itemId);
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory')
      .select(`
        itemId,
        friendlyId,
        itemName,
        category,
        descripcionArticulo,
        imageUrls
      `)
      .in('itemId', itemIds);

    if (inventoryError) {
      console.error('Inventory query error:', inventoryError);
      throw new Error(`Failed to fetch inventory items: ${inventoryError.message}`);
    }

    // Combine the data
    const enrichedItems = saleItems.map(saleItem => {
      const inventoryItem = inventoryItems.find(inv => inv.itemId === saleItem.itemId);
      return {
        ...saleItem,
        inventoryItem: inventoryItem || null
      };
    });

    const result = {
      ...saleData,
      items: enrichedItems
    };

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Service error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update sale status
 */
const updateSaleStatus = async (saleId, status, userId) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .update({
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('saleId', saleId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Sale not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get sales statistics
 */
const getSalesStats = async (filters = {}) => {
  try {
    let query = supabase
      .from('sales')
      .select('totalAmount, saleDate, status, paymentMethod');

    // Apply date filters
    if (filters.startDate) {
      query = query.gte('saleDate', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('saleDate', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculate statistics
    const totalSales = data.length;
    const totalRevenue = data.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const completedSales = data.filter(sale => sale.status === 'Completed').length;
    const cancelledSales = data.filter(sale => sale.status === 'Cancelled').length;

    // Payment method breakdown
    const paymentMethods = data.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    // Monthly revenue (last 12 months)
    const monthlyRevenue = {};
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
      monthlyRevenue[monthKey] = 0;
    }

    data.forEach(sale => {
      const monthKey = sale.saleDate.slice(0, 7);
      if (monthlyRevenue.hasOwnProperty(monthKey)) {
        monthlyRevenue[monthKey] += parseFloat(sale.totalAmount);
      }
    });

    return {
      success: true,
      data: {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        completedSales,
        cancelledSales,
        averageSaleValue: totalSales > 0 ? Math.round((totalRevenue / totalSales) * 100) / 100 : 0,
        paymentMethods,
        monthlyRevenue
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update sale details
 */
const updateSale = async (saleId, updateData, userId) => {
  try {
    console.log('=== Backend updateSale called ===')
    console.log('Sale ID:', saleId)
    console.log('Update data:', updateData)
    console.log('User ID:', userId)
    
    // Validate required fields
    if (!saleId) {
      throw new Error('Sale ID is required')
    }
    
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    // Prepare update data (only allow certain fields to be updated)
    const allowedUpdates = {
      clientId: updateData.clientId,
      saleDate: updateData.saleDate,
      totalAmount: updateData.totalAmount,
      paymentMethod: updateData.paymentMethod,
      status: updateData.status,
      notes: updateData.notes,
      updatedAt: new Date().toISOString()
    }
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key]
      }
    })
    
    console.log('Allowed updates:', allowedUpdates)
    
    // Update the sale record
    const { data: updatedSale, error: updateError } = await supabase
      .from('sales')
      .update(allowedUpdates)
      .eq('saleId', saleId)
      .select()
      .single()
    
    if (updateError) {
      throw new Error(`Failed to update sale: ${updateError.message}`)
    }
    
    console.log('Sale updated successfully:', updatedSale)
    
    // If items were updated, we need to handle them separately
    if (updateData.items && Array.isArray(updateData.items)) {
      // Delete existing items
      const { error: deleteError } = await supabase
        .from('sale_items')
        .delete()
        .eq('saleId', saleId)
      
      if (deleteError) {
        throw new Error(`Failed to delete existing sale items: ${deleteError.message}`)
      }
      
      // Create new items
      const saleItems = updateData.items.map(item => ({
        saleId: saleId,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        createdAt: new Date().toISOString()
      }))
      
      const { data: createdItems, error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)
        .select()
      
      if (itemsError) {
        throw new Error(`Failed to create new sale items: ${itemsError.message}`)
      }
      
      console.log('Sale items updated successfully:', createdItems)
    }
    
    // Get the complete updated sale with items
    const { data: completeSale, error: fetchError } = await supabase
      .from('sales')
      .select(`
        *,
        client:clientId (
          clientId,
          name,
          email,
          phone
        ),
        items:sale_items (
          saleItemId,
          quantity,
          unitPrice,
          totalPrice,
          itemId
        )
      `)
      .eq('saleId', saleId)
      .single()
    
    if (fetchError) {
      throw new Error(`Failed to fetch updated sale: ${fetchError.message}`)
    }
    
    return {
      success: true,
      data: completeSale
    }
  } catch (error) {
    console.error('Error in updateSale:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get sales by client
 */
const getSalesByClient = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        items:sale_items (
          saleItemId,
          quantity,
          unitPrice,
          totalPrice,
          inventoryItem:itemId (
            itemId,
            itemName,
            category
          )
        )
      `)
      .eq('clientId', clientId)
      .order('saleDate', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  updateSaleStatus,
  getSalesStats,
  getSalesByClient
}; 