const { EVENTS, addKeyword } = require('@bot-whatsapp/bot')


const mainFlow = addKeyword(EVENTS.WELCOME)
    .addAnswer('🙌 Hola bienvenido al AVC *Chatbot*')
    .addAnswer(
        '¿Cómo podemos ayudarte el día de hoy?',
        null,
        null,
        []
)


module.exports = mainFlow