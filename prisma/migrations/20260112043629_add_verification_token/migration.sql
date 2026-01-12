/*
  Warnings:

  - A unique constraint covering the columns `[ubankTag]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ubankTag]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MeetingFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "InterestType" AS ENUM ('FLAT_RATE', 'REDUCING_BALANCE');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('QR_CODE', 'DIRECT_LINK', 'EMAIL_INVITE');

-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW_ONLY', 'REQUEST_JOIN', 'LIMITED_ACCESS', 'FULL_PREVIEW');

-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REJECTED';

-- DropIndex
DROP INDEX "Contribution_groupId_userId_month_year_key";

-- AlterTable
ALTER TABLE "Contribution" ADD COLUMN     "isLate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "penaltyApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewDate" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "contributionDeadlineType" "MeetingFrequency" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "contributionDueDay" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "lateContributionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lateMeetingFine" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "loanGracePeriodDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loanInterestType" "InterestType" NOT NULL DEFAULT 'FLAT_RATE',
ADD COLUMN     "meetingFrequency" "MeetingFrequency" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "missedMeetingFine" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "socialFundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ubankTag" TEXT;

-- AlterTable
ALTER TABLE "GroupMember" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "unpaidPenalties" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "disbursementAccountName" TEXT,
ADD COLUMN     "disbursementAccountNumber" TEXT,
ADD COLUMN     "disbursementBankName" TEXT,
ADD COLUMN     "disbursementMethod" "PaymentMethodType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "ubankTag" TEXT,
ADD COLUMN     "verificationToken" TEXT,
ALTER COLUMN "emailVerified" DROP DEFAULT;

-- CreateTable
CREATE TABLE "GroupShare" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "shareType" "ShareType" NOT NULL DEFAULT 'QR_CODE',
    "permissions" "SharePermission" NOT NULL DEFAULT 'REQUEST_JOIN',
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER DEFAULT 10,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "customMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QrAnalytics" (
    "id" TEXT NOT NULL,
    "groupShareId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "convertedToMember" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QrAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberBankDetail" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberBankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupShare_shareToken_key" ON "GroupShare"("shareToken");

-- CreateIndex
CREATE INDEX "GroupShare_shareToken_idx" ON "GroupShare"("shareToken");

-- CreateIndex
CREATE INDEX "GroupShare_groupId_idx" ON "GroupShare"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "MemberBankDetail_userId_idx" ON "MemberBankDetail"("userId");

-- CreateIndex
CREATE INDEX "Activity_userId_groupId_createdAt_idx" ON "Activity"("userId", "groupId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_groupId_createdAt_idx" ON "Activity"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "Contribution_groupId_userId_month_year_idx" ON "Contribution"("groupId", "userId", "month", "year");

-- CreateIndex
CREATE INDEX "Contribution_status_idx" ON "Contribution"("status");

-- CreateIndex
CREATE INDEX "Contribution_userId_status_idx" ON "Contribution"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Group_ubankTag_key" ON "Group"("ubankTag");

-- CreateIndex
CREATE INDEX "Loan_groupId_status_idx" ON "Loan"("groupId", "status");

-- CreateIndex
CREATE INDEX "Loan_userId_status_idx" ON "Loan"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_ubankTag_key" ON "User"("ubankTag");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- AddForeignKey
ALTER TABLE "GroupShare" ADD CONSTRAINT "GroupShare_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupShare" ADD CONSTRAINT "GroupShare_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QrAnalytics" ADD CONSTRAINT "QrAnalytics_groupShareId_fkey" FOREIGN KEY ("groupShareId") REFERENCES "GroupShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberBankDetail" ADD CONSTRAINT "MemberBankDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
