/*
  Warnings:

  - A unique constraint covering the columns `[validationId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `provider` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'SSLCOMMERZ');

-- DropIndex
DROP INDEX "payments_rentalOrderId_key";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "method" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL,
ADD COLUMN     "validationId" TEXT,
ALTER COLUMN "transactionId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_validationId_key" ON "payments"("validationId");
