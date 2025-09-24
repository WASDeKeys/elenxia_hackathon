import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFrom = process.env.TWILIO_FROM || "";

const canSend = twilioSid && twilioToken && twilioFrom;
const client = canSend ? twilio(twilioSid, twilioToken) : null;

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/api/sms", async (req, res) => {
  try {
    const { to, body } = req.body || {};
    if (!to || !body) return res.status(400).json({ error: "Missing 'to' or 'body'" });
    if (!canSend) return res.status(500).json({ error: "Twilio not configured" });

    const msg = await client.messages.create({ to, from: twilioFrom, body });
    res.json({ id: msg.sid, status: msg.status });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`PillPall SMS server listening on :${port}`);
});


