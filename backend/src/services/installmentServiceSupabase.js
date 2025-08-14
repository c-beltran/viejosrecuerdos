const supabase = require('../utils/supabaseClient');

class InstallmentServiceSupabase {
  // Create a new installment plan
  async createInstallmentPlan(planData) {
    try {
      const { data, error } = await supabase
        .from('installment_plans')
        .insert([planData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
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
}

module.exports = new InstallmentServiceSupabase(); 