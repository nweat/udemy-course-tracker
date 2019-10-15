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

app.post("/webhook/", function(req, res) {
  var messaging_events = req.body.entry[0].messaging
  for (var i = 0; i < messaging_events.length; i++) {
    var event = req.body.entry[0].messaging[i]
    var sender = event.sender.id
    if (event.message && event.message.text) {
      var text = event.message.text
      sendTextMessage(sender, text + "!")
    }
  }
  res.sendStatus(200)
})

function sendTextMessage(sender, text) {
  var messageData = {
    text: text
  }
  request(
    {
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: PAGE_ACCESS_TOKEN
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    },
    function(error, response, body) {
      if (!error) {
        console.log("message sent from fb messenger!")
        console.log(body)
      } else {
        console.error("Unable to send message:" + error)
      }
    }
  )
}

app.listen(process.env.PORT || 8000, () => console.log("webhook is listening"))
