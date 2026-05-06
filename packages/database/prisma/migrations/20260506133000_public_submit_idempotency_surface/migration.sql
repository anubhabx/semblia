-- Scope public-submit idempotency by public surface so forms and
-- testimonials cannot replay or block each other's request ledgers.
ALTER TYPE "PublicSubmitSurface" ADD VALUE IF NOT EXISTS 'FORM';

DROP INDEX IF EXISTS "PublicSubmitIdempotency_projectId_idempotencyKey_key";
