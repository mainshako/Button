const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "button-legacy-compatibility",
    paymentProvider: "disabled",
    canonicalBackend: "https://button-backend-c6f2.onrender.com"
  });
});

// Legacy compatibility endpoints are deliberately fail-closed.
// The real marketplace/payment flow lives in mainshako/backend and never
// reports a payment as successful without provider verification.
app.post("/create-payment", (_req, res) => {
  res.status(503).json({
    error: "Electronic payments are not enabled on this legacy service.",
    code: "PAYMENT_PROVIDER_DISABLED",
    paid: false
  });
});

app.get("/verify-payment", (_req, res) => {
  res.status(503).json({
    valid: false,
    paid: false,
    error: "Payment verification is unavailable on this legacy service.",
    code: "PAYMENT_PROVIDER_DISABLED"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Button legacy compatibility server running on port " + PORT);
  console.log("Electronic payments are disabled here; use the canonical Button backend.");
});
