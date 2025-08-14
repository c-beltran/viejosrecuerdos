const supabase = require('../utils/supabaseClient');

class InstallmentServiceSupabase {
  // Create a new installment plan
  async createInstallmentPlan(planData) {
    try {
      console.log('Creating installment plan with data:', planData);
      console.log('createdBy field:', planData.createdBy);
      console.log('createdBy type:', typeof planData.createdBy);
      
      const { data, error } = await supabase
        .from('installment_plans')
        .insert([planData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase error details:', error);
      throw new Error(`Failed to create installment plan: ${error.message}`);
    }
  }

  // Get all installment plans
  async getAllInstallmentPlans() {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .select(`
          *,
          sales (
            "saleId",
            "saleDate",
            "totalAmount",
            "status",
            clients (
              "clientId",
              "name",
              "email",
              "phone"
            )
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get installment plans: ${error.message}`);
    }
  }

  // Get installment plan by ID
  async getInstallmentPlanById(planId) {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .select(`
          *,
          sales (
            "saleId",
            "saleDate",
            "totalAmount",
            "status",
            clients (
              "clientId",
              "name",
              "email",
              "phone"
            )
          ),
          installment_payments (
            "paymentId",
            "paymentNumber",
            "amount",
            "paymentDate",
            "paymentMethod",
            "status",
            "notes",
            "createdAt"
          )
        `)
        .eq('planId', planId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get installment plan: ${error.message}`);
    }
  }

  // Get installment plan summary using the database function
  async getInstallmentPlanSummary(planId) {
    try {
      const { data, error } = await supabase
        .rpc('get_installment_plan_summary', { plan_uuid: planId });

      if (error) throw error;
      return data[0]; // Return the first (and only) result
    } catch (error) {
      throw new Error(`Failed to get installment plan summary: ${error.message}`);
    }
  }

  // Update installment plan
  async updateInstallmentPlan(planId, updateData) {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .update(updateData)
        .eq('planId', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update installment plan: ${error.message}`);
    }
  }

  // Delete installment plan
  async deleteInstallmentPlan(planId) {
    try {
      const { error } = await supabase
        .from('installment_plans')
        .delete()
        .eq('planId', planId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete installment plan: ${error.message}`);
    }
  }

  // Create a payment for an installment plan
  async createPayment(paymentData) {
    try {
      const { data, error } = await supabase
        .from('installment_payments')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  // Get all payments for an installment plan
  async getPaymentsByPlanId(planId) {
    try {
      const { data, error } = await supabase
        .from('installment_payments')
        .select('*')
        .eq('planId', planId)
        .order('paymentNumber', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get payments: ${error.message}`);
    }
  }

  // Update payment
  async updatePayment(paymentId, updateData) {
    try {
      const { data, error } = await supabase
        .from('installment_payments')
        .update(updateData)
        .eq('paymentId', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  }

  // Delete payment
  async deletePayment(paymentId) {
    try {
      const { error } = await supabase
        .from('installment_payments')
        .delete()
        .eq('paymentId', paymentId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete payment: ${error.message}`);
    }
  }

  // Get overdue installment plans
  async getOverdueInstallmentPlans() {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .select(`
          *,
          sales (
            "saleId",
            "saleDate",
            "totalAmount",
            "status",
            clients (
              "clientId",
              "name",
              "email",
              "phone"
            )
          )
        `)
        .lt('dueDate', new Date().toISOString().split('T')[0])
        .eq('status', 'Active')
        .order('dueDate', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get overdue installment plans: ${error.message}`);
    }
  }

  // Get installment plans by status
  async getInstallmentPlansByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .select(`
          *,
          sales (
            "saleId",
            "saleDate",
            "totalAmount",
            "status",
            clients (
              "clientId",
              "name",
              "email",
              "phone"
            )
          )
        `)
        .eq('status', status)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get installment plans by status: ${error.message}`);
    }
  }

  // Get all payments with filtering and pagination
  async getAllPayments(filters = {}) {
    try {
      let query = supabase
        .from('installment_payments')
        .select(`
          *,
          installment_plans!inner (
            planId,
            totalAmount,
            sales (
              saleId,
              saleDate,
              totalAmount,
              status,
              clients (
                clientId,
                name,
                email,
                phone
              )
            )
          )
        `)
        .order('paymentDate', { ascending: false });

      // Apply filters
      if (filters.planId) {
        query = query.eq('planId', filters.planId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('paymentDate', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('paymentDate', filters.endDate);
      }

      // Apply pagination
      const offset = (filters.page - 1) * filters.limit;
      query = query.range(offset, offset + filters.limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / filters.limit);

      return {
        payments: data || [],
        total,
        page: filters.page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to get all payments: ${error.message}`);
    }
  }

  // Get overdue payments
  async getOverduePayments(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('installment_payments')
        .select(`
          *,
          installment_plans!inner (
            planId,
            totalAmount,
            dueDate,
            sales (
              saleId,
              saleDate,
              totalAmount,
              status,
              clients (
                clientId,
                name,
                email,
                phone
              )
            )
          )
        `)
        .lt('installment_plans.dueDate', new Date().toISOString().split('T')[0])
        .eq('installment_plans.status', 'Active')
        .order('installment_plans.dueDate', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        payments: data || [],
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to get overdue payments: ${error.message}`);
    }
  }

  // Get payments by status
  async getPaymentsByStatus(status, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('installment_payments')
        .select(`
          *,
          installment_plans!inner (
            planId,
            totalAmount,
            sales (
              saleId,
              saleDate,
              totalAmount,
              status,
              clients (
                clientId,
                name,
                email,
                phone
              )
            )
          )
        `)
        .eq('status', status)
        .order('paymentDate', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        payments: data || [],
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to get payments by status: ${error.message}`);
    }
  }

  // Get installment plans by sale ID
  async getInstallmentPlansBySale(saleId) {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .select(`
          *,
          sales (
            saleId,
            saleDate,
            totalAmount,
            status,
            clients (
              clientId,
              name,
              email,
              phone
            )
          ),
          installment_payments (
            paymentId,
            paymentNumber,
            amount,
            paymentDate,
            paymentMethod,
            status,
            notes,
            createdAt
          )
        `)
        .eq('saleId', saleId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get installment plans by sale: ${error.message}`);
    }
  }

  // Get installment plans by client ID
  async getInstallmentPlansByClient(clientId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('installment_plans')
        .select(`
          *,
          sales!inner (
            saleId,
            saleDate,
            totalAmount,
            status,
            clients!inner (
              clientId,
              name,
              email,
              phone
            )
          ),
          installment_payments (
            paymentId,
            paymentNumber,
            amount,
            paymentDate,
            paymentMethod,
            status,
            notes,
            createdAt
          )
        `)
        .eq('sales.clientId', clientId)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        plans: data || [],
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw new Error(`Failed to get installment plans by client: ${error.message}`);
    }
  }
}

module.exports = new InstallmentServiceSupabase(); 