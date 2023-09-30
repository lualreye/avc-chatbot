const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const goodbye = addKeyword(EVENTS.ACTION)
  .addAnswer('Si te puedo ayudar en algo más no dudes de escribirme')


const tryAgain = addKeyword(EVENTS.ACTION)
  .addAnswer([
    'Mejor empezamos de nuevo ¿Cómo puedo ayudar?',
    'Recuerda que estoy aquí para ayudarte con información y cancelación de suscripción'
  ])

module.exports = { goodbye, tryAgain }