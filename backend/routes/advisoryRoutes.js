const express = require("express");
const axios = require("axios");

const router = express.Router();

// POST -> /api/advisory
router.post("/advisory", async (req, res) => {
    try {
        const {
            soil,//1
            waterAvailability,//2
            season,//3
            landSize,//4
            language,//5
            location//6
        } = req.body;

        // Validate required fields
        if (!soil || !waterAvailability || !season || !landSize || !language || !location) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Forward to n8n webhook
        const n8nResponse = await axios.post(process.env.N8N_WEBHOOK_URL, {
            soil,
            waterAvailability,
            season,
            landSize,
            language,
            location: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        });

        res.json({ message: n8nResponse.data });
    } catch (error) {
        console.error("Advisory Error:", error);
        res.status(500).json({ error: "Failed to get crop advisory" });
    }
});

module.exports = router;
