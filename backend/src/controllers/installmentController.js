const installmentService = require('../services/installmentServiceSupabase');

/**
 * @swagger
 * components:
 *   schemas:
 *     InstallmentPlan:
 *       type: object
 *       required:
 *         - customerId
 *         - totalAmount
 *         - numberOfInstallments
 *         - installmentAmount
 *         - startDate
 *         - dueDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the installment plan
 *         customerId:
 *           type: string
 *           description: ID of the customer
 *         totalAmount:
 *           type: number
 *           description: Total amount of the installment plan
 *         numberOfInstallments:
 *           type: integer
 *           description: Number of installments
 *         installmentAmount:
 *           type: number
 *           description: Amount per installment
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of the installment plan
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date of the installment plan
 *         status:
 *           type: string
 *           enum: [active, completed, overdue, cancelled]
 *           description: Current status of the installment plan
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the plan
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     Payment:
 *       type: object
 *       required:
 *         - planId
 *         - amount
 *         - paymentDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the payment
 *         planId:
 *           type: string
 *           description: ID of the installment plan
 *         amount:
 *           type: number
 *           description: Payment amount
 *         paymentDate:
 *           type: string
 *           format: date
 *           description: Date when payment was made
 *         paymentMethod:
 *           type: string
 *           enum: [cash, bank_transfer, credit_card, debit_card]
 *           description: Method of payment
 *         receivedBy:
 *           type: string
 *           description: ID of the user who received the payment
 *         notes:
 *           type: string
 *           description: Additional notes about the payment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *     
 *     InstallmentPlanSummary:
 *       type: object
 *       properties:
 *         planId:
 *           type: string
 *           description: ID of the installment plan
 *         totalAmount:
 *           type: number
 *           description: Total amount of the plan
 *         paidAmount:
 *           type: number
 *           description: Total amount paid so far
 *         remainingAmount:
 *           type: number
 *           description: Remaining amount to be paid
 *         numberOfInstallments:
 *           type: integer
 *           description: Total number of installments
 *         paidInstallments:
 *           type: integer
 *           description: Number of installments paid
 *         remainingInstallments:
 *           type: integer
 *           description: Number of installments remaining
 *         nextDueDate:
 *           type: string
 *           format: date
 *           description: Next installment due date
 *         status:
 *           type: string
 *           description: Current status of the plan
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           description: Response data
 *         message:
 *           type: string
 *           description: Success message
 *         count:
 *           type: integer
 *           description: Number of items returned
 */

class InstallmentController {
  /**
   * @swagger
   * /api/installments:
   *   post:
   *     summary: Create a new installment plan
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - customerId
   *               - totalAmount
   *               - numberOfInstallments
   *               - installmentAmount
   *               - startDate
   *               - dueDate
   *             properties:
   *               customerId:
   *                 type: string
   *                 description: ID of the customer
   *               totalAmount:
   *                 type: number
   *                 description: Total amount of the installment plan
   *               numberOfInstallments:
   *                 type: integer
   *                 description: Number of installments
   *               installmentAmount:
   *                 type: number
   *                 description: Amount per installment
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: Start date of the installment plan
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 description: Due date of the installment plan
   *               status:
   *                 type: string
   *                 enum: [active, completed, overdue, cancelled]
   *                 default: active
   *                 description: Initial status of the installment plan
   *               notes:
   *                 type: string
   *                 description: Additional notes about the plan
   *     responses:
   *       201:
   *         description: Installment plan created successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/InstallmentPlan'
   *       400:
   *         description: Bad request - Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments:
   *   get:
   *     summary: Get all installment plans
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, completed, overdue, cancelled]
   *         description: Filter by status
   *       - in: query
   *         name: customerId
   *         schema:
   *           type: string
   *         description: Filter by customer ID
   *     responses:
   *       200:
   *         description: List of installment plans retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/InstallmentPlan'
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/{planId}:
   *   get:
   *     summary: Get installment plan by ID
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the installment plan
   *     responses:
   *       200:
   *         description: Installment plan retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/InstallmentPlan'
   *       404:
   *         description: Installment plan not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/{planId}/summary:
   *   get:
   *     summary: Get installment plan summary
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the installment plan
   *     responses:
   *       200:
   *         description: Installment plan summary retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/InstallmentPlanSummary'
   *       404:
   *         description: Installment plan not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/{planId}:
   *   put:
   *     summary: Update installment plan
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the installment plan
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               totalAmount:
   *                 type: number
   *                 description: Updated total amount
   *               numberOfInstallments:
   *                 type: integer
   *                 description: Updated number of installments
   *               installmentAmount:
   *                 type: number
   *                 description: Updated amount per installment
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: Updated start date
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 description: Updated due date
   *               status:
   *                 type: string
   *                 enum: [active, completed, overdue, cancelled]
   *                 description: Updated status
   *               notes:
   *                 type: string
   *                 description: Updated notes
   *     responses:
   *       200:
   *         description: Installment plan updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/InstallmentPlan'
   *       404:
   *         description: Installment plan not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request - Invalid input data
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/{planId}:
   *   delete:
   *     summary: Delete installment plan
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the installment plan
   *     responses:
   *       200:
   *         description: Installment plan deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Installment plan deleted successfully
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/{planId}/payments:
   *   post:
   *     summary: Create a payment for an installment plan
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the installment plan
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *               - paymentDate
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Payment amount
   *               paymentDate:
   *                 type: string
   *                 format: date
   *                 description: Date when payment was made
   *               paymentMethod:
   *                 type: string
   *                 enum: [cash, bank_transfer, credit_card, debit_card]
   *                 default: cash
   *                 description: Method of payment
   *               notes:
   *                 type: string
   *                 description: Additional notes about the payment
   *     responses:
   *       201:
   *         description: Payment recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Payment'
   *       400:
   *         description: Bad request - Invalid input data
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/{planId}/payments:
   *   get:
   *     summary: Get all payments for an installment plan
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: planId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the installment plan
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of payments retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Payment'
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/payments/{paymentId}:
   *   put:
   *     summary: Update payment
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: paymentId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the payment
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Updated payment amount
   *               paymentDate:
   *                 type: string
   *                 format: date
   *                 description: Updated payment date
   *               paymentMethod:
   *                 type: string
   *                 enum: [cash, bank_transfer, credit_card, debit_card]
   *                 description: Updated payment method
   *               notes:
   *                 type: string
   *                 description: Updated payment notes
   *     responses:
   *       200:
   *         description: Payment updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Payment'
   *       404:
   *         description: Payment not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       400:
   *         description: Bad request - Invalid input data
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/payments/{paymentId}:
   *   delete:
   *     summary: Delete payment
   *     tags: [Payments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: paymentId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the payment
   *     responses:
   *       200:
   *         description: Payment deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Payment deleted successfully
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/overdue:
   *   get:
   *     summary: Get overdue installment plans
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of overdue installment plans retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/InstallmentPlan'
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/installments/status/{status}:
   *   get:
   *     summary: Get installment plans by status
   *     tags: [Installments]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: status
   *         required: true
   *         schema:
   *           type: string
   *           enum: [active, completed, overdue, cancelled]
   *         description: Status to filter by
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: List of installment plans by status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/InstallmentPlan'
   *       400:
   *         description: Bad request - Invalid status
   *       401:
   *         description: Unauthorized - Authentication required
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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