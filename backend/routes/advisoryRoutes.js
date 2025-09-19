const express = require("express");
const { getAdvisory } = require("../controllers/advisoryController");

const router = express.Router();

// POST -> /api/advisory
router.post("/", getAdvisory);

module.exports = router;
