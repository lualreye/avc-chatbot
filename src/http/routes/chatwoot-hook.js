const express = require('express')
const { createReadStream } = require('fs')
const { join } = require('path');

const router = express.Router()


const chatWootHook = async (req, res) => {
  const wsProvider = this.wsProvider;
  const body = req.body;

  if (body?.private) {
    res.send(null);
    return;
  }

  const phone = body?.conversations?.meta?.sender?.phone_number.replace('+', '')

  await wsProvider.sendText(`${phone}@c.us`, body.content)
  console.log(phone)
  res.send(body)
}

router.post('/chatwoot-hook', chatWootHook);


router.get('/get-qr', async (_req, res) => {
  const YOUR_PATH_QR = join(process.cwd(), 'bot.qr.png');
  const fileStream = createReadStream(YOUR_PATH_QR);

  res.writeHead(200, { 'Content-type': 'image/png' })
  fileStream.pipe(res);
});

module.exports = router