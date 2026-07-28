-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'HALF_DAY';

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'MIXED';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "gstApplied" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "employeeId" TEXT;

-- AlterTable
ALTER TABLE "FinancialTransaction" ADD COLUMN     "paymentMethod" "PaymentMethod";

-- CreateIndex
CREATE INDEX "InvoiceItem_employeeId_idx" ON "InvoiceItem"("employeeId");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
