require("dotenv").config();
const express = require("express");
const cors = require("cors");
const advisoryRoutes = require("./routes/advisoryRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", advisoryRoutes);
app.get("/test", (req, res) => res.json({ ok: true }));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));
