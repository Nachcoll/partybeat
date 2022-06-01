'use strict'

// const Express = require('express')
// const cors = require('cors')
// const router = require('./router/router')
import Express from 'express'
import cors from 'cors'
import router from './router/router.js'

const PORT = 8000



const app = new Express();

app.use(cors())
app.use(Express.json())
app.use(router)

app.listen(PORT, () => {
  console.log(`connected to http://localhost:${PORT}`)
})








