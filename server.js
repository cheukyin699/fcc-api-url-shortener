// server.js
// where your node app starts

// init project
const express = require('express')
const dns = require('dns')
const url = require('url')
const app = express()

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

var counter = 0
var Addresses = []

function isInvalidURL(u) {
  return u.hash || !u.protocol.includes("http") || u.port || u.password ||
    u.search || u.username
}

function newUrl(req, resp) {
  let possibleURL = new url.URL(req.body.url)
  
  dns.lookup(possibleURL.hostname, (err, addr, family) => {
    if (err || isInvalidURL(possibleURL)) {
      resp.send({error: "invalid URL"})
    } else {
      let ind = Addresses.indexOf(possibleURL.href)
      let j = {
        original_url: possibleURL.href,
        short_url: ind === -1 ? counter++ : ind
      }
      
      if (ind === -1) {
        // Push only if it doesn't exist
        Addresses.push(possibleURL.href)
      }
      
      resp.send(j)
    }
  })
}

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

app.post("/api/shorturl/new", newUrl)

app.get("/api/shorturl/:id", (req, resp) => {
  let ind = parseInt(req.params["id"])
  if (ind >= Addresses.length) {
    resp.send({error: "no such URL"})
  } else {
    resp.redirect(Addresses[ind])
  }
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
