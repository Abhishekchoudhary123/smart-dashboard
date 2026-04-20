const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Data = require("./models/Data");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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

app.post("/upload", upload.single("file"), async (req, res) => {
  res.send("File uploaded successfully");
});

// Add data
app.post("/add", async (req, res) => {
  const newData = new Data(req.body);
  await newData.save();
  res.send("Data saved");
});

// Get all data
app.get("/data", async (req, res) => {
  const data = await Data.find();
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});