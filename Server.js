Ai-Based-PMS1 
const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const file = "data.json";

app.get("/Parking", (req, res) => {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    res.json(data);
});

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});