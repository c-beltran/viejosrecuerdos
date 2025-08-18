const supabase = require('../utils/supabaseClient');
const QRCode = require('qrcode');

/**
 * Get all inventory items with optional filtering
 */
const getAllItems = async (filters = {}) => {
  try {
    let query = supabase
      .from('inventory')
      .select('*', { count: 'exact' })
      .order('createDate', { ascending: false });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.friendlyId) {
      query = query.eq('friendlyId', filters.friendlyId);
    }
    if (filters.search) {
      query = query.or(`itemName.ilike.%${filters.search}%,descripcionArticulo.ilike.%${filters.search}%,friendlyId.ilike.%${filters.search}%`);
    }

    // Apply pagination
    if (filters.limit && filters.limit > 0) {
      const start = filters.offset || 0;
      const end = start + filters.limit - 1;
      query = query.range(start, end);
    }

    const { data, error, count } = await query;


    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Generate QR code URLs if requested
    let items = data || [];
    if (filters.includeQR) {
      items = items.map((item) => {
        const qrCodeUrl = generateQRCodeUrl(item.itemId);
        return { ...item, qrCodeUrl };
      });
    }
    
    // Map database column names to frontend expected names for all items
    items = items.map((item) => {
      const mappedItem = {
        ...item,
        createdAt: item.createDate,
        updatedAt: item.updatedDate
      };
      
      // Debug logging for first item
      if (item === items[0]) {
        console.log('Backend - First item mapping:', {
          original: { createDate: item.createDate, updatedDate: item.updatedDate },
          mapped: { createdAt: mappedItem.createdAt, updatedAt: mappedItem.updatedAt }
        });
      }
      
      return mappedItem;
    });

    return {
      success: true,
      data: items,
      count: count || items.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate QR code URL for an item
 */
const generateQRCodeUrl = (itemId) => {
  return `${process.env.FRONTEND_URL || 'http://localhost:8000'}/api/qr/${itemId}`;
};

/**
 * Get a single inventory item by ID
 */
const getItemById = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('itemId', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Item not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    // Generate QR code URL on-demand
    const qrCodeUrl = generateQRCodeUrl(itemId);
    
    // Map database column names to frontend expected names
    const mappedItem = {
      ...data,
      qrCodeUrl,
      // Map database columns to frontend expected names
      createdAt: data.createDate,
      updatedAt: data.updatedDate
    };

    return {
      success: true,
      data: mappedItem
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a single inventory item by friendly ID
 */
const getItemByFriendlyId = async (friendlyId) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('friendlyId', friendlyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Item not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    // Generate QR code URL on-demand
    const qrCodeUrl = generateQRCodeUrl(data.itemId);
    
    // Map database column names to frontend expected names
    const mappedItem = {
      ...data,
      qrCodeUrl,
      // Map database columns to frontend expected names
      createdAt: data.createDate,
      updatedAt: data.updatedDate
    };

    return {
      success: true,
      data: mappedItem
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a new inventory item
 */
const createItem = async (itemData, userId) => {
  try {
    const newItem = {
      ...itemData,
      lastModifiedBy: userId,
      createDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([newItem])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Map database column names to frontend expected names
    const mappedItem = {
      ...data,
      createdAt: data.createDate,
      updatedAt: data.updatedDate
    };

    return {
      success: true,
      data: mappedItem
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update an inventory item
 */
const updateItem = async (itemId, updateData, userId) => {
  try {
    const updatePayload = {
      ...updateData,
      lastModifiedBy: userId,
      updatedDate: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('inventory')
      .update(updatePayload)
      .eq('itemId', itemId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Item not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    // Map database column names to frontend expected names
    const mappedItem = {
      ...data,
      createdAt: data.createDate,
      updatedAt: data.updatedDate
    };

    return {
      success: true,
      data: mappedItem
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete an inventory item
 */
const deleteItem = async (itemId) => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('itemId', itemId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Item not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      message: 'Item deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get inventory statistics
 */
const getInventoryStats = async () => {
  try {
    // Get total items
    const { count: totalItems, error: countError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(countError.message);

    // Get items by status
    const { data: statusData, error: statusError } = await supabase
      .from('inventory')
      .select('status');

    if (statusError) throw new Error(statusError.message);

    const availableCount = statusData.filter(item => item.status === 'Available').length;
    const soldOutCount = statusData.filter(item => item.status === 'Sold-Out').length;

    // Get items by category
    const { data: categoryData, error: categoryError } = await supabase
      .from('inventory')
      .select('category');

    if (categoryError) throw new Error(categoryError.message);

    const categoryCounts = categoryData.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        totalItems,
        availableCount,
        soldOutCount,
        categoryCounts
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
 * Get categories
 */
const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('category')
      .not('category', 'is', null);

    if (error) throw new Error(error.message);

    // Get unique categories
    const uniqueCategories = [...new Set(data.map(item => item.category))];

    return {
      success: true,
      data: uniqueCategories
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getAllItems,
  getItemById,
  getItemByFriendlyId,
  createItem,
  updateItem,
  deleteItem,
  getInventoryStats,
  getCategories
}; 