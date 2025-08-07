const express = require('express');
const router = express.Router();
const installmentController = require('../controllers/installmentController');
const { verifySupabaseToken } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(verifySupabaseToken);

// Installment Plans routes
router.post('/plans', installmentController.createInstallmentPlan);
router.get('/plans', installmentController.getAllInstallmentPlans);
router.get('/plans/overdue', installmentController.getOverdueInstallmentPlans);
router.get('/plans/status/:status', installmentController.getInstallmentPlansByStatus);
router.get('/plans/:planId', installmentController.getInstallmentPlanById);
router.get('/plans/:planId/summary', installmentController.getInstallmentPlanSummary);
router.put('/plans/:planId', installmentController.updateInstallmentPlan);
router.delete('/plans/:planId', installmentController.deleteInstallmentPlan);

// Installment Payments routes
router.post('/payments', installmentController.createPayment);
router.get('/plans/:planId/payments', installmentController.getPaymentsByPlanId);
router.put('/payments/:paymentId', installmentController.updatePayment);
router.delete('/payments/:paymentId', installmentController.deletePayment);

module.exports = router; 