require('dotenv').config();

const CHATWOOD_API = 'https://chatwoot-production-5454.up.railway.app/'

const sendMessageChatWoot = async (msg = '', message_type = '') => {
  var myHeaders = new Headers()
  myHeaders.append('api_access_token', process.env.CHATWOOT_KEY);
  myHeaders.append('Content-type', 'application/json')

  var raw = JSON.stringify({
    content: msg,
    message_type: message_type,
    private: true,
    content_type: 'input_email',
    content_attributes: {}
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  }

  const dataRaw = await fetch(
    `${CHATWOOD_API}/ api/v1/accounts/1/conversations/1/messages`,
    requestOptions
  )

  const data = await dataRaw.json()
  return data
}

module.exports = { sendMessageChatWoot }