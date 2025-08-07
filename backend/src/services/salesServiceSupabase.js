const supabase = require('../utils/supabaseClient');

/**
 * Create a new sale (single or multiple items)
 */
const createSale = async (saleData, userId) => {
  try {
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
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      status: 'Completed',
      notes: notes || null,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

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
        inventory:itemId (
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
          inventory:itemId (
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
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        client:clientId (
          clientId,
          name,
          email,
          phone,
          address
        ),
        items:sale_items (
          saleItemId,
          quantity,
          unitPrice,
          totalPrice,
          inventory:itemId (
            itemId,
            itemName,
            category,
            descripcionArticulo,
            imageUrls
          )
        )
      `)
      .eq('saleId', saleId)
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
          inventory:itemId (
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
  updateSaleStatus,
  getSalesStats,
  getSalesByClient
}; 