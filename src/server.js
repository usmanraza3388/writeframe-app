// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const supabase = require("./supabaseClient"); // direct import

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

// Optional test route
app.get("/api", (req, res) => {
  res.json({ message: "API is working" });
});

// Optional SPA / static files
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Export the app for serverless deployment
module.exports = app;
