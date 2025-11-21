// backend/controllers/advisoryController.js
const axios = require("axios");

const getAdvisory = async (req, res) => {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("N8N_WEBHOOK_URL not set");
      return res.status(500).json({ error: "Webhook URL not configured" });
    }

    console.log("Forwarding to n8n:", JSON.stringify(req.body, null, 2));

    // Forward full payload to n8n
    const response = await axios.post(webhookUrl, req.body, { timeout: 20000 });

    const advisoryText = response.data?.advisory || "No advice available.";
    res.json({ advisory: advisoryText });
  } catch (err) {
    console.error("Error in getAdvisory:", err?.message || err);
    if (err.response) {
      return res.status(502).json({ error: "n8n error", details: err.response.data });
    }
    res.status(500).json({ error: "Failed to fetch advisory" });
  }
};

module.exports = { getAdvisory };
