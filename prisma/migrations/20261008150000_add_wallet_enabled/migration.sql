-- Steuert, ob die öffentliche Karte den Apple-Wallet-Button anbietet.
-- Neue Karten: an (DEFAULT true).
ALTER TABLE "cards" ADD COLUMN "wallet_enabled" BOOLEAN NOT NULL DEFAULT true;

-- Bestandskarten bewusst auf aus: deren Inhaber haben der Wallet-Funktion nie
-- zugestimmt und sollen sie aktiv einschalten. Der DEFAULT oben bleibt davon
-- unberührt und gilt weiterhin für alle neu angelegten Karten.
UPDATE "cards" SET "wallet_enabled" = false;
