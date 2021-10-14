require('dotenv').config()
const express = require('express')
const handler = require('./index.js').handler

const app = express()
const port = 3000

app.get('/:campaign_id/:user_id', async (req, res) => {
  const data = (await handler(req.params)).body.replace(/[\s"]/g, '')
  const img = Buffer.from(data, 'base64')
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  })
  res.end(img)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
