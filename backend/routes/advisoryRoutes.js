// backend/routes/advisoryRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/advisory', async (req, res) => {
  console.log(">>> backend received /api/advisory request:", req.body);
  try {
    const { soil, waterAvailability, season, landSize, language, location } = req.body;
    
    if (!soil || !waterAvailability || !season || !landSize || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not set');
      return res.status(500).json({ error: 'N8N_WEBHOOK_URL not configured' });
    }

    console.log('Forwarding to n8n webhook:', webhookUrl);
    const n8nResp = await axios.post(webhookUrl, req.body, { timeout: 30000 });
    console.log('n8n responded:', n8nResp.status, n8nResp.data);
    
    // n8n returns an array, so extract first item
    let responseData = n8nResp.data;
    if (Array.isArray(responseData) && responseData.length > 0) {
      responseData = responseData[0];
    }
    
    // Transform n8n response to match frontend expectations
    const advisory = responseData?.advisory || responseData?.message || 'No advisory available';
    
    console.log('Extracted advisory:', advisory);
    
    return res.json({ 
      message: advisory,
      language: responseData?.language || language,
      status: responseData?.status || 'success'
    });
  } catch (err) {
    console.error('Error in advisory route:', err?.message || err);
    if (err.response) {
      console.error('n8n error details:', err.response.data);
      return res.status(502).json({ 
        error: 'n8n workflow error', 
        details: err.response.data 
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;