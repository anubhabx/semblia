-- CreateEnum
CREATE TYPE "OutboundWebhookStatus" AS ENUM ('ACTIVE', 'DISABLED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'DELIVERING', 'SUCCEEDED', 'FAILED', 'EXHAUSTED');

-- CreateEnum
CREATE TYPE "ExportDestinationProvider" AS ENUM ('CSV', 'WEBHOOK', 'SLACK', 'NOTION', 'LINEAR', 'GITHUB');

-- CreateEnum
CREATE TYPE "ExportDestinationStatus" AS ENUM ('ACTIVE', 'DISABLED', 'REVOKED');

-- CreateTable
CREATE TABLE "OutboundWebhookEndpoint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(2000) NOT NULL,
    "signingSecretEncrypted" TEXT NOT NULL,
    "signingSecretHash" VARCHAR(128),
    "subscribedEvents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "OutboundWebhookStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundWebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundWebhookDelivery" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "eventType" VARCHAR(120) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "responseStatus" INTEGER,
    "responseBodySnippet" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundWebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportDestination" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" "ExportDestinationProvider" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "config" JSONB NOT NULL,
    "status" "ExportDestinationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportRule" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "eventTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "filter" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportDelivery" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "ruleId" TEXT,
    "eventType" VARCHAR(120) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "error" TEXT,
    "artifactContent" TEXT,
    "artifactContentType" VARCHAR(120),
    "artifactFilename" VARCHAR(255),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OutboundWebhookEndpoint_projectId_status_idx" ON "OutboundWebhookEndpoint"("projectId", "status");

-- CreateIndex
CREATE INDEX "OutboundWebhookEndpoint_projectId_createdAt_idx" ON "OutboundWebhookEndpoint"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "OutboundWebhookDelivery_endpointId_status_idx" ON "OutboundWebhookDelivery"("endpointId", "status");

-- CreateIndex
CREATE INDEX "OutboundWebhookDelivery_projectId_createdAt_idx" ON "OutboundWebhookDelivery"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "OutboundWebhookDelivery_projectId_status_createdAt_idx" ON "OutboundWebhookDelivery"("projectId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "OutboundWebhookDelivery_eventType_createdAt_idx" ON "OutboundWebhookDelivery"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "ExportDestination_projectId_provider_idx" ON "ExportDestination"("projectId", "provider");

-- CreateIndex
CREATE INDEX "ExportDestination_projectId_status_idx" ON "ExportDestination"("projectId", "status");

-- CreateIndex
CREATE INDEX "ExportRule_projectId_enabled_idx" ON "ExportRule"("projectId", "enabled");

-- CreateIndex
CREATE INDEX "ExportRule_destinationId_idx" ON "ExportRule"("destinationId");

-- CreateIndex
CREATE INDEX "ExportDelivery_projectId_createdAt_idx" ON "ExportDelivery"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ExportDelivery_projectId_status_createdAt_idx" ON "ExportDelivery"("projectId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ExportDelivery_destinationId_status_idx" ON "ExportDelivery"("destinationId", "status");

-- CreateIndex
CREATE INDEX "ExportDelivery_ruleId_idx" ON "ExportDelivery"("ruleId");

-- CreateIndex
CREATE INDEX "ExportDelivery_eventType_createdAt_idx" ON "ExportDelivery"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "OutboundWebhookEndpoint" ADD CONSTRAINT "OutboundWebhookEndpoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundWebhookDelivery" ADD CONSTRAINT "OutboundWebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "OutboundWebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundWebhookDelivery" ADD CONSTRAINT "OutboundWebhookDelivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportDestination" ADD CONSTRAINT "ExportDestination_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportRule" ADD CONSTRAINT "ExportRule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportRule" ADD CONSTRAINT "ExportRule_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "ExportDestination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportDelivery" ADD CONSTRAINT "ExportDelivery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportDelivery" ADD CONSTRAINT "ExportDelivery_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "ExportDestination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportDelivery" ADD CONSTRAINT "ExportDelivery_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ExportRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
