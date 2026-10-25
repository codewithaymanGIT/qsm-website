-- Customer logos and steel mills share one table, told apart by kind.
CREATE TYPE "PartnerKind" AS ENUM ('CUSTOMER', 'MILL');

ALTER TABLE "PartnerLogo" ADD COLUMN "kind" "PartnerKind" NOT NULL DEFAULT 'CUSTOMER';
