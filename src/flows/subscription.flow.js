const { addKeyword } = require("@bot-whatsapp/bot");

const { subscriptionKeywords } = require("../utils/subscription.keywords");

const subscriptionFlow = addKeyword(subscriptionKeywords)
  .addAnswer('Puedes ayudarme con tu correo electrónico o número solicitud')
  .addAnswer(
    'Perfecto, estamos buscando en nuestra base de datos'
  )

module.exports = subscriptionFlow;