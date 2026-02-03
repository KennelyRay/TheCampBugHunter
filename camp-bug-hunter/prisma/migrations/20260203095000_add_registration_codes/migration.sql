CREATE TABLE "registration_codes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "minecraftUsername" TEXT NOT NULL,
    "player_uuid" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "registration_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "registration_codes_code_hash_key" ON "registration_codes"("code_hash");

CREATE INDEX "registration_codes_minecraftUsername_idx" ON "registration_codes"("minecraftUsername");

CREATE INDEX "registration_codes_player_uuid_idx" ON "registration_codes"("player_uuid");

CREATE INDEX "registration_codes_expires_at_idx" ON "registration_codes"("expires_at");
