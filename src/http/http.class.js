const express = require('express');
const router = require('./routes/chatwoot-hook');

class ServerHttp {
  port = process.env.PORT ?? 3001;
  app;
  wsProvider;

  constructor(wsProvider) {
    this.wsProvider = wsProvider
  }


  buildApp = () => {
    return this.app = express()
      .use(express.json())
      .use((req, res, next) => {
        req.wsProvider = this.wsProvider
        next()
      })
      .use(router)
      .listen(this.port, () => console.log(`Listo por http://localhost:${this.port}`))
  }

  start() {
    this.buildApp()
  }
}

module.exports = ServerHttp;