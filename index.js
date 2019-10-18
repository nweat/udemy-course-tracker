const express = require("express")
const bodyParser = require("body-parser")
const request = require("request")
const app = express()

const { udemyUpdates } = require("./helpers/tracker")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN

app.get("/webhook", function(req, res) {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    res.send(req.query["hub.challenge"])
  }
  res.send("Wrong token!")
})

app.post("/webhook", function(req, res) {
  let body = req.body

  body.entry.forEach(function(entry) {
    // Gets the message. entry.messaging is an array, but
    // will only ever contain one message, so we get index 0
    let webhook_event = entry.messaging[0]
    let sender_psid = webhook_event.sender.id

    if (webhook_event.message && webhook_event.message.text) {
      let text = webhook_event.message.text.toLowerCase()
      console.log("Sender PSID: " + sender_psid + " sent msg " + text)
      if (text === "udemy") {
        ;(async () => {
          const message = await udemyUpdates()
          console.log("message: " + message)
          sendTextMessage(sender_psid, message)
        })()
      } else {
        sendTextMessage(sender_psid, "Bare with me Nik.. I only know about udemy :/")
      }
    }
  })
  // Returns a '200 OK' response to all requests
  res.status(200).send("EVENT_RECEIVED")
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
      if (error) {
        console.log("Error:", error)
      } else if (response.body.error) {
        console.log("Error: ", response.body.error)
      }
    }
  )
}

app.listen(process.env.PORT || 8000, () => console.log("webhook is listening"))
