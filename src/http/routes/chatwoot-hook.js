const express = require('express')
const { createReadStream } = require('fs')
const { join } = require('path');

const router = express.Router()


const chatWootHook = async (req, res) => {
  const wsProvider = req.wsProvider;
  const body = req.body;

  console.log('provider', wsProvider)

  console.log('body', body)
  if (body?.private) {
    res.send(null);
    return;
  }

  const phone = body?.conversation?.meta?.sender?.phone_number.replace('+', '')

  console.log(phone)

  await wsProvider.sendText(`${phone}@c.us`, body.content)
  res.send(body)
}

router.post('/chatwoot-hook', chatWootHook);


router.get('/get-qr', async (_req, res) => {
  const YOUR_PATH_QR = join(process.cwd(), 'bot.qr.png');
  const fileStream = createReadStream(YOUR_PATH_QR);

  console.log(fileStream)
  res.writeHead(200, { 'Content-type': 'image/png' })
  fileStream.pipe(res);
});

module.exports = router