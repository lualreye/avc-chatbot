
const { createReadStream } = require('fs')
const { join } = require('path');

const sendQr = async (_req, res) => {
  const YOUR_PATH_QR = join(process.cwd(), 'bot.qr.png');
  const fileStream = createReadStream(YOUR_PATH_QR);

  res.writeHead(200, { 'Content-type': 'image/png' })
  fileStream.pipe(res);
}

module.exports = sendQr