const installmentService = require('../services/installmentServiceSupabase');

class InstallmentController {
  // Create a new installment plan
  async createInstallmentPlan(req, res) {
    try {
      const planData = {
        ...req.body,
        createdBy: req.user.user_id
      };

      const plan = await installmentService.createInstallmentPlan(planData);
      res.status(201).json({
        success: true,
        data: plan,
        message: 'Installment plan created successfully'
      });
    } catch (error) {
      console.error('Error creating installment plan:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all installment plans
  async getAllInstallmentPlans(req, res) {
    try {
      const plans = await installmentService.getAllInstallmentPlans();
      res.status(200).json({
        success: true,
        data: plans,
        count: plans.length
      });
    } catch (error) {
      console.error('Error getting installment plans:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get installment plan by ID
  async getInstallmentPlanById(req, res) {
    try {
      const { planId } = req.params;
      const plan = await installmentService.getInstallmentPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Installment plan not found'
        });
      }

      res.status(200).json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error('Error getting installment plan:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get installment plan summary
  async getInstallmentPlanSummary(req, res) {
    try {
      const { planId } = req.params;
      const summary = await installmentService.getInstallmentPlanSummary(planId);
      
      if (!summary) {
        return res.status(404).json({
          success: false,
          error: 'Installment plan not found'
        });
      }

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error getting installment plan summary:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update installment plan
  async updateInstallmentPlan(req, res) {
    try {
      const { planId } = req.params;
      const updateData = req.body;

      const plan = await installmentService.updateInstallmentPlan(planId, updateData);
      
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: 'Installment plan not found'
        });
      }

      res.status(200).json({
        success: true,
        data: plan,
        message: 'Installment plan updated successfully'
      });
    } catch (error) {
      console.error('Error updating installment plan:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete installment plan
  async deleteInstallmentPlan(req, res) {
    try {
      const { planId } = req.params;
      const result = await installmentService.deleteInstallmentPlan(planId);
      
      res.status(200).json({
        success: true,
        message: 'Installment plan deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting installment plan:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Create a payment for an installment plan
  async createPayment(req, res) {
    try {
      const paymentData = {
        ...req.body,
        receivedBy: req.user.user_id
      };

      const payment = await installmentService.createPayment(paymentData);
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment recorded successfully'
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all payments for an installment plan
  async getPaymentsByPlanId(req, res) {
    try {
      const { planId } = req.params;
      const payments = await installmentService.getPaymentsByPlanId(planId);
      
      res.status(200).json({
        success: true,
        data: payments,
        count: payments.length
      });
    } catch (error) {
      console.error('Error getting payments:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update payment
  async updatePayment(req, res) {
    try {
      const { paymentId } = req.params;
      const updateData = req.body;

      const payment = await installmentService.updatePayment(paymentId, updateData);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: payment,
        message: 'Payment updated successfully'
      });
    } catch (error) {
      console.error('Error updating payment:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete payment
  async deletePayment(req, res) {
    try {
      const { paymentId } = req.params;
      const result = await installmentService.deletePayment(paymentId);
      
      res.status(200).json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get overdue installment plans
  async getOverdueInstallmentPlans(req, res) {
    try {
      const plans = await installmentService.getOverdueInstallmentPlans();
      res.status(200).json({
        success: true,
        data: plans,
        count: plans.length
      });
    } catch (error) {
      console.error('Error getting overdue installment plans:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get installment plans by status
  async getInstallmentPlansByStatus(req, res) {
    try {
      const { status } = req.params;
      const plans = await installmentService.getInstallmentPlansByStatus(status);
      
      res.status(200).json({
        success: true,
        data: plans,
        count: plans.length
      });
    } catch (error) {
      console.error('Error getting installment plans by status:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new InstallmentController(); 