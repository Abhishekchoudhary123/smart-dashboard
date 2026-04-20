const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Data = require("./models/Data");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Use environment variable for MongoDB URI (required for cloud deployment)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dashboard";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend running");
});

// Upload and parse a JSON file, then save all records to MongoDB
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Read the uploaded file from disk
    const fileContent = fs.readFileSync(req.file.path, "utf-8");

    let parsed;
    try {
      parsed = JSON.parse(fileContent);
    } catch (parseErr) {
      fs.unlinkSync(req.file.path); // clean up temp file
      return res.status(400).json({ error: "Invalid JSON file." });
    }

    // Support both a JSON array and a single JSON object
    const records = Array.isArray(parsed) ? parsed : [parsed];

    // Insert all records into MongoDB
    const inserted = await Data.insertMany(records);

    // Clean up the temp file
    fs.unlinkSync(req.file.path);

    res.json({ message: `Successfully uploaded ${inserted.length} record(s).`, data: inserted });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error during upload." });
  }
});

// Add a single record
app.post("/add", async (req, res) => {
  try {
    const newData = new Data(req.body);
    await newData.save();
    res.json({ message: "Data saved", data: newData });
  } catch (err) {
    res.status(500).json({ error: "Failed to save data." });
  }
});

// Get all data
app.get("/data", async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data." });
  }
});

// Delete all data
app.delete("/data", async (req, res) => {
  try {
    await Data.deleteMany({});
    res.json({ message: "All data cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear data." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});