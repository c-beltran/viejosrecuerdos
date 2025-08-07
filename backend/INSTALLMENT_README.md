# Installment Payment System

This document describes the installment payment system for Viejos Recuerdos, which allows customers to pay for purchases in installments rather than in full.

## Database Schema

### Installment Plans Table
Tracks the overall installment agreement for a sale.

**Fields:**
- `planId` (UUID, Primary Key) - Unique identifier for the installment plan
- `saleId` (UUID, Foreign Key) - Reference to the sale
- `totalAmount` (DECIMAL) - Total amount to be paid
- `downPayment` (DECIMAL) - Initial down payment amount
- `installmentAmount` (DECIMAL) - Amount per installment
- `numberOfInstallments` (INTEGER) - Total number of installments
- `installmentFrequency` (VARCHAR) - Payment frequency (Weekly, Bi-weekly, Monthly, Quarterly)
- `startDate` (DATE) - When the installment plan starts
- `dueDate` (DATE) - When the final payment is due
- `status` (VARCHAR) - Plan status (Active, Completed, Defaulted, Cancelled)
- `notes` (TEXT) - Additional notes
- `createdBy` (UUID) - User who created the plan
- `createdAt` (TIMESTAMP) - Creation timestamp
- `updatedAt` (TIMESTAMP) - Last update timestamp

### Installment Payments Table
Tracks individual payments made towards an installment plan.

**Fields:**
- `paymentId` (UUID, Primary Key) - Unique identifier for the payment
- `planId` (UUID, Foreign Key) - Reference to the installment plan
- `paymentNumber` (INTEGER) - Sequential payment number
- `amount` (DECIMAL) - Payment amount
- `paymentDate` (DATE) - Date payment was made
- `paymentMethod` (VARCHAR) - Method of payment
- `status` (VARCHAR) - Payment status (Pending, Completed, Failed, Refunded)
- `notes` (TEXT) - Additional notes
- `receivedBy` (UUID) - User who received the payment
- `createdAt` (TIMESTAMP) - Creation timestamp

## API Endpoints

### Installment Plans

#### Create Installment Plan
```
POST /api/installments/plans
```

**Request Body:**
```json
{
  "saleId": "uuid-of-sale",
  "totalAmount": 1000.00,
  "downPayment": 200.00,
  "installmentAmount": 200.00,
  "numberOfInstallments": 4,
  "installmentFrequency": "Monthly",
  "startDate": "2024-01-15",
  "dueDate": "2024-05-15",
  "notes": "Customer prefers monthly payments"
}
```

#### Get All Installment Plans
```
GET /api/installments/plans
```

#### Get Installment Plan by ID
```
GET /api/installments/plans/:planId
```

#### Get Installment Plan Summary
```
GET /api/installments/plans/:planId/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "planId": "uuid",
    "totalAmount": 1000.00,
    "downPayment": 200.00,
    "amountPaid": 600.00,
    "remainingBalance": 400.00,
    "installmentsPaid": 3,
    "totalInstallments": 4,
    "nextPaymentDue": "2024-04-15",
    "status": "Active"
  }
}
```

#### Update Installment Plan
```
PUT /api/installments/plans/:planId
```

#### Delete Installment Plan
```
DELETE /api/installments/plans/:planId
```

#### Get Overdue Installment Plans
```
GET /api/installments/plans/overdue
```

#### Get Installment Plans by Status
```
GET /api/installments/plans/status/:status
```

### Installment Payments

#### Create Payment
```
POST /api/installments/payments
```

**Request Body:**
```json
{
  "planId": "uuid-of-plan",
  "paymentNumber": 3,
  "amount": 200.00,
  "paymentDate": "2024-03-15",
  "paymentMethod": "Cash",
  "notes": "Monthly payment received"
}
```

#### Get Payments for a Plan
```
GET /api/installments/plans/:planId/payments
```

#### Update Payment
```
PUT /api/installments/payments/:paymentId
```

#### Delete Payment
```
DELETE /api/installments/payments/:paymentId
```

## Business Logic

### Automatic Status Updates
- When a payment is recorded, the system automatically calculates if the installment plan is complete
- If the total amount paid equals or exceeds the total amount, the plan status is updated to "Completed"

### Validation Rules
- Down payment + (installment amount × number of installments) must equal total amount
- Due date must be after start date
- Payment amounts must be positive
- Payment numbers must be sequential

### Database Functions

#### `get_installment_plan_summary(plan_uuid)`
Returns a summary of the installment plan including:
- Total amount and down payment
- Amount paid and remaining balance
- Number of installments paid vs total
- Next payment due date
- Current status

#### `update_installment_plan_status()`
Trigger function that automatically updates the plan status when payments are recorded.

#### `validate_installment_plan()`
Trigger function that validates installment plan data before insertion/update.

## Usage Examples

### Creating an Installment Plan for a Sale

1. First, create a sale as usual
2. Then create an installment plan linked to that sale:

```javascript
// Create installment plan
const planData = {
  saleId: "sale-uuid",
  totalAmount: 1500.00,
  downPayment: 300.00,
  installmentAmount: 300.00,
  numberOfInstallments: 4,
  installmentFrequency: "Monthly",
  startDate: "2024-01-15",
  dueDate: "2024-05-15",
  notes: "Customer will pay monthly"
};

const response = await fetch('/api/installments/plans', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(planData)
});
```

### Recording a Payment

```javascript
const paymentData = {
  planId: "plan-uuid",
  paymentNumber: 2,
  amount: 300.00,
  paymentDate: "2024-02-15",
  paymentMethod: "Cash",
  notes: "Second monthly payment"
};

const response = await fetch('/api/installments/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(paymentData)
});
```

### Getting Plan Summary

```javascript
const response = await fetch('/api/installments/plans/plan-uuid/summary', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const summary = await response.json();
console.log(`Remaining balance: $${summary.data.remainingBalance}`);
```

## Security

- All endpoints require authentication
- Row Level Security (RLS) is enabled on all tables
- Users can only access data based on their role (admin, clerk, viewer)
- All operations are logged with user information

## Migration

To set up the installment system, run the migration:

```sql
-- Run the migration file
\i backend/database/migrations/005_create_installment_tables.sql
```

This will create all necessary tables, indexes, triggers, and functions for the installment payment system. 