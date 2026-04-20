const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  title: String,
  lat: Number,
  lng: Number,
  type: String,
});

module.exports = mongoose.model("Data", DataSchema);