// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const supabase = require("./supabaseClient"); // direct import

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Test route for backend API
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Health check route for Vercel
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server locally (for development)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for serverless deployment
module.exports = app;