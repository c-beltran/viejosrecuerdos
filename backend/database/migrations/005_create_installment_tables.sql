-- Create installment_plans table to track installment agreements
CREATE TABLE IF NOT EXISTS installment_plans (
  "planId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "saleId" UUID NOT NULL REFERENCES sales("saleId") ON DELETE CASCADE,
  "totalAmount" DECIMAL(10,2) NOT NULL CHECK ("totalAmount" > 0),
  "downPayment" DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK ("downPayment" >= 0),
  "installmentAmount" DECIMAL(10,2) NOT NULL CHECK ("installmentAmount" > 0),
  "numberOfInstallments" INTEGER NOT NULL CHECK ("numberOfInstallments" > 0),
  "installmentFrequency" VARCHAR(20) NOT NULL DEFAULT 'Monthly' CHECK ("installmentFrequency" IN ('Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', "Other")),
  "startDate" DATE NOT NULL,
  "dueDate" DATE NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK ("status" IN ('Active', 'Completed', 'Defaulted', 'Cancelled')),
  "notes" TEXT,
  "createdBy" UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create installment_payments table to track individual payments
CREATE TABLE IF NOT EXISTS installment_payments (
  "paymentId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "planId" UUID NOT NULL REFERENCES installment_plans("planId") ON DELETE CASCADE,
  "paymentNumber" INTEGER NOT NULL CHECK ("paymentNumber" > 0),
  "amount" DECIMAL(10,2) NOT NULL CHECK ("amount" > 0),
  "paymentDate" DATE NOT NULL,
  "paymentMethod" VARCHAR(50) NOT NULL DEFAULT 'Cash' CHECK ("paymentMethod" IN ('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check')),
  "status" VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK ("status" IN ('Pending', 'Completed', 'Failed', 'Refunded')),
  "notes" TEXT,
  "receivedBy" UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_installment_plans_sale ON installment_plans("saleId");
CREATE INDEX IF NOT EXISTS idx_installment_plans_status ON installment_plans(status);
CREATE INDEX IF NOT EXISTS idx_installment_plans_due_date ON installment_plans("dueDate");
CREATE INDEX IF NOT EXISTS idx_installment_payments_plan ON installment_payments("planId");
CREATE INDEX IF NOT EXISTS idx_installment_payments_date ON installment_payments("paymentDate");
CREATE INDEX IF NOT EXISTS idx_installment_payments_status ON installment_payments(status);

-- Enable RLS
ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for installment_plans table
-- Policy for admins (full access)
CREATE POLICY "Admins have full access to installment_plans" ON installment_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for clerks (full access)
CREATE POLICY "Clerks have full access to installment_plans" ON installment_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clerk'
        )
    );

-- Policy for viewers (read-only access)
CREATE POLICY "Viewers can read installment_plans" ON installment_plans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'viewer'
        )
    );

-- Create RLS policies for installment_payments table
-- Policy for admins (full access)
CREATE POLICY "Admins have full access to installment_payments" ON installment_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for clerks (full access)
CREATE POLICY "Clerks have full access to installment_payments" ON installment_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'clerk'
        )
    );

-- Policy for viewers (read-only access)
CREATE POLICY "Viewers can read installment_payments" ON installment_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'viewer'
        )
    );

-- Create function to update installment plan status after payment
CREATE OR REPLACE FUNCTION update_installment_plan_status()
RETURNS TRIGGER AS $$
DECLARE
    total_paid DECIMAL(10,2);
    plan_total DECIMAL(10,2);
BEGIN
    -- Calculate total amount paid for this plan
    SELECT COALESCE(SUM(amount), 0) INTO total_paid
    FROM installment_payments 
    WHERE "planId" = NEW."planId" 
    AND status = 'Completed';
    
    -- Get the total amount for this plan
    SELECT "totalAmount" INTO plan_total
    FROM installment_plans 
    WHERE "planId" = NEW."planId";
    
    -- Update plan status based on payment completion
    IF total_paid >= plan_total THEN
        UPDATE installment_plans 
        SET 
            status = 'Completed',
            "updatedAt" = timezone('utc', now())
        WHERE "planId" = NEW."planId";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update installment plan status after payment
CREATE TRIGGER trigger_update_installment_plan_status
    AFTER INSERT OR UPDATE ON installment_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_installment_plan_status();

-- Create function to validate installment plan creation
CREATE OR REPLACE FUNCTION validate_installment_plan()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure down payment + (installment amount * number of installments) equals total amount
    IF (NEW."downPayment" + (NEW."installmentAmount" * NEW."numberOfInstallments")) != NEW."totalAmount" THEN
        RAISE EXCEPTION 'Installment plan amounts do not add up to total amount';
    END IF;
    
    -- Ensure due date is after start date
    IF NEW."dueDate" <= NEW."startDate" THEN
        RAISE EXCEPTION 'Due date must be after start date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate installment plan creation
CREATE TRIGGER trigger_validate_installment_plan
    BEFORE INSERT OR UPDATE ON installment_plans
    FOR EACH ROW
    EXECUTE FUNCTION validate_installment_plan();

-- Create function to get installment plan summary
CREATE OR REPLACE FUNCTION get_installment_plan_summary(plan_uuid UUID)
RETURNS TABLE (
    "planId" UUID,
    "totalAmount" DECIMAL(10,2),
    "downPayment" DECIMAL(10,2),
    "amountPaid" DECIMAL(10,2),
    "remainingBalance" DECIMAL(10,2),
    "installmentsPaid" INTEGER,
    "totalInstallments" INTEGER,
    "nextPaymentDue" DATE,
    "status" VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ip."planId",
        ip."totalAmount",
        ip."downPayment",
        COALESCE(SUM(imp.amount), 0) as "amountPaid",
        ip."totalAmount" - COALESCE(SUM(imp.amount), 0) as "remainingBalance",
        COUNT(imp."paymentId") as "installmentsPaid",
        ip."numberOfInstallments" as "totalInstallments",
        ip."dueDate" as "nextPaymentDue",
        ip.status
    FROM installment_plans ip
    LEFT JOIN installment_payments imp ON ip."planId" = imp."planId" AND imp.status = 'Completed'
    WHERE ip."planId" = plan_uuid
    GROUP BY ip."planId", ip."totalAmount", ip."downPayment", ip."numberOfInstallments", ip."dueDate", ip.status;
END;
$$ LANGUAGE plpgsql; 