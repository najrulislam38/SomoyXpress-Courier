import crypto from "crypto";

export default function generateTrackingId() {
  const trackingId = `TRK-${Date.now()}_${Math.floor(
    Math.random() * 1000
  )}-${crypto.randomBytes(8).toString("hex")}`;

  return trackingId;
}
