-- Optional meeting-booking link (Outlook "Bei mir buchen", Bookings, Calendly, …).
-- Nullable, so existing cards are unaffected.
ALTER TABLE "cards" ADD COLUMN "booking_url" TEXT;
