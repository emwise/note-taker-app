const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const port = process.env.PORT || 4000

const noteRoutes = require('./notes/routes')
const userRoutes = require('./users/routes')

const { username, password } = process.env //accesses certain variables in my computer that this application can access
//these are added via powershell like: $Env: username = 'username'
//then run npm start as usual

mongoose.connect(`mongodb+srv://${username}:${password}@maindatabase.zp5uc0f.mongodb.net/test`) //this is the mongodb address.
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