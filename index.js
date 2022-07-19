const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const port = 4000

const noteRoutes = require('./notes/routes')
const userRoutes = require('./users/routes')

mongoose.connect('mongodb://localhost/notetaking') //this is the mongodb address.
//connect to this when you first open mongodb compass 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/notes', noteRoutes)
app.use('/users', userRoutes)

app.get('/', (req, res, next)=>{
  res.send('hello')
})

app.listen(port, ()=>{
  console.log(`app is running on http://localhost:${port}`)
})