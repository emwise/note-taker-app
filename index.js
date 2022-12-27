const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path');
const hbs = require('hbs');
const { engine } = require ('express-handlebars');
var cookieParser = require('cookie-parser')
const app = express()
const port = process.env.PORT || 4000

const noteRoutes = require('./notes/routes')
const userRoutes = require('./users/routes')
const aboutRoutes = require('./about/routes')
const contactRoutes = require('./contact/routes')

const { username, password } = process.env //accesses certain variables in my computer that this application can access
//these are added via powershell like: $Env: username = 'username'
//then run npm start as usual

mongoose.connect(`mongodb+srv://${username}:${password}@maindatabase.zp5uc0f.mongodb.net/test`) //this is the mongodb address.
//connect to this when you first open mongodb compass 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

//setting up handlebars
app.engine('hbs', engine({defaultLayout: 'main'})) //this uses the main.handlebars file as a template and pastes in the body.
app.set('view engine', 'hbs')

app.use('/notes', noteRoutes)
app.use('/users', userRoutes)
app.use('/about', aboutRoutes)
app.use('/contact', contactRoutes)

//app.use(express.static(path.join(__dirname, 'frontend'))); //this allows index.js to be accessed from my main.handlebars file as if it were right next to it, instead its in a whole nother folder!


app.get('/', (req, res, next)=>{
  res.render('home');
})

app.get('/:token', (req, res, next)=>{
  res.render('home');
})

app.listen(port, ()=>{
  console.log(`app is running on http://localhost:${port}`)
})