const express = require("express");
const db = require("./db");

const app = express();

app.get("/", (req, res) => {
  res.send("Server running and database connected");
});

app.listen(3000, () => {
  console.log("Server started");
});