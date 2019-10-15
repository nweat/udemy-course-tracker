const express = require("express")
const bodyParser = require("body-parser")
const request = require("request")
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN

app.get("/mybot", function(req, res) {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    res.send(req.query["hub.challenge"])
  }
  res.send("Wrong token!")
})

app.listen(process.env.PORT || 8000, () => console.log("webhook is listening"))
