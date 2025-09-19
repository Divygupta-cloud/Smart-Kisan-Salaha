const axios = require("axios");

const getAdvisory = async (req, res) => {
  const { soilType, season, language } = req.body;

  try {
    // Send request to n8n workflow
    const response = await axios.post(process.env.N8N_WEBHOOK_URL, {
      soilType,
      season,
      language,
    });

    const advisoryText = response.data.advisory || "No advice available.";

    res.json({ advisory: advisoryText });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch advisory" });
  }
};

module.exports = { getAdvisory };
