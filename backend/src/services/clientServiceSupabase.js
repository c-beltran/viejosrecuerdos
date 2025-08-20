const supabase = require('../utils/supabaseClient');

/**
 * Get all clients with optional filtering
 */
const getAllClients = async (filters = {}) => {
  try {
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    if (filters.email) {
      query = query.eq('email', filters.email);
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

    return {
      success: true,
      data: data || [],
      count: count || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get a single client by ID
 */
const getClientById = async (clientId) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('clientId', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Client not found');
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
 * Create a new client
 */
const createClient = async (clientData, userId) => {
  try {
    const newClient = {
      ...clientData,
      lastModifiedBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('clients')
      .insert([newClient])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('A client with this email already exists');
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
 * Update a client
 */
const updateClient = async (clientId, updateData, userId) => {
  try {
    const updatePayload = {
      ...updateData,
      lastModifiedBy: userId,
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('clientId', clientId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Client not found');
      }
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('A client with this email already exists');
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
 * Delete a client
 */
const deleteClient = async (clientId) => {
  try {
    // Check if client has any associated sales (future feature)
    // For now, just delete the client
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('clientId', clientId);

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Client not found');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      message: 'Client deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get client statistics
 */
const getClientStats = async () => {
  try {
    // Get total clients
    const { count: totalClients, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error(countError.message);

    // Get clients by creation date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClients, error: recentError } = await supabase
      .from('clients')
      .select('createdAt')
      .gte('createdAt', thirtyDaysAgo.toISOString());

    if (recentError) throw new Error(recentError.message);

    return {
      success: true,
      data: {
        totalClients,
        newClientsLast30Days: recentClients.length,
        averageClientsPerDay: Math.round((recentClients.length / 30) * 100) / 100
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
}; 