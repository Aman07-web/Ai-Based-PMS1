const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Backend running")
})

app.get("/api/parking", (req, res) => {
    res.json({
        message: "Parking API working"
    })
})

const PORT = 5000

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})