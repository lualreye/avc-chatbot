const express = require('express')

const sendQr = require('../controllers/qr')
const chatWootHook = require('../controllers/chatwoot')

const router = express.Router()

router.post('/chatwoot-hook', chatWootHook);

router.get('/get-qr', sendQr);

module.exports = router