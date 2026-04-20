const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const Data = require("./models/Data");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/dashboard")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  res.send("File uploaded successfully");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
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