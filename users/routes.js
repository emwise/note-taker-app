const router = require('express').Router();
const UserModel = require('./model');
var bcrypt = require('bcryptjs');
const Chance = require('chance');
const chance = new Chance();
const passport = require('../auth')

router.get('/login', (req, res, next)=>{
  res.render('loginPanel');
})

router.post('/login', 
  loginInputValidation, //TODO create error's on the login for each middleware
  findUser, 
  checkPassword, 
  giveAccess, 
  (req, res, next)=>{
    res.append("Set-Cookie", `Email=${req.userDocument.email}; Path=/; HttpOnly;` )
    res.append("Set-Cookie", `Authentication=${req.userDocument.accessToken}; Path=/; HttpOnly;` )
    res.redirect(303, `/notes`) //redirects to all notes page
})

router.get('/home', 
  isLoggedIn,
  (req, res, next)=>{
    res.redirect(303, `/notes/user`);
    //res.send(req.cookies['Email'])
})

router.get('/logout', 
  (req, res, next)=>{
    res.clearCookie("Authentication") //works
    res.clearCookie("Email")
    //res.clearCookie("<cookie>", {path:'/users'}) //works for path's other than default '/'
    res.render("logoutConfirmation")
})

router.get('/register',
  (req, res, next)=>{
    res.render('registerPanel')
  })

router.post('/register', 
  registerInputValidation, 
  isEmailAlreadyInUse,
  hashPassword,
  (req, res, next)=>{
    //console.log(req.body.password) //will print the hashed password to the console
    const newUser = new UserModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      email: req.body.email
      })

  newUser
    .save() //this will attempt to save the data in the db and will return a promise
    .then((document)=>{
      if(document){
        document.password = undefined
        res.append("Set-Cookie", `Email=${req.body.email}; Path=/; HttpOnly;` )
        res.redirect(303, `/users/login`) //redirects to login page
      }else{
        res.send('user did not save')
      }
    })
    .catch((err)=>{
      console.log(err)
      res.send('error happened.')
    })
})

router.get('/:id', (req, res, next)=>{
  // can also use this method UserModel.find({_id: req.params.id})
  UserModel
    .findById(req.params.id)
    .then((result)=>{
      if(!result){
        res
          .status(404)
          .send("user not found")
      }else{
        result.password = undefined //this removes the password from being sent to the client but does not remove it from the database
        res.json(result)
      }
    })
    .catch((err)=>{
      console.log(err)
      res.status(500).send("Error occured. ")
    })
})

function registerInputValidation(req, res, next){
  //make sure required field are there and if missing display error
  const {firstName, lastName, password, email} = req.body
  const missingFields = []

  if(!firstName){
    missingFields.push('First Name')
  }
  if(!lastName){
    missingFields.push('Last Name')
  }
  if(!email){
    missingFields.push('Email')
  }
  if(!password){
    missingFields.push('Password')
  }

  if(missingFields.length>0){
    res
      .status(400)
      .send(`The following fields are missing: ${missingFields.join(', ')}`)
  }else{
    next()
  }
}

function isEmailAlreadyInUse(req, res, next){
  UserModel.findOne({ email: req.body.email })
    .then((results)=>{
      if(results){
        res
          .status(400)
          .send(`${req.body.email} is already registered!`)
      }else{
        next()
      }
    })
    .catch((err)=>{
      console.log(err)
      res
        .status(500)
        .send("error occured")
    })
}

function hashPassword(req, res, next){
  const { password } = req.body
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        if(err){
          res.status(500).send("hashing error")
        }else{
          req.body.password = hash
          next()
        }
    });
  });
}

function loginInputValidation(req, res, next){
  const { email, password } = req.body
  const missingFields = []

  if(!email){
    missingFields.push('email')
  }
  if(!password){
    missingFields.push('password')
  }

  if(missingFields.length>0){
    res
      .status(400)
      .send(`The following fields are missing: ${missingFields.join(', ')}`)
    }else{
      next()
    }
}

function findUser(req, res, next){
  UserModel
    .findOne({ email: req.body.email})
    .then((userDocument)=>{
      if(!userDocument){
        res
          .status(404)
          .send(`${req.body.email} is not registered`)
      }else{
        req.userDocument = userDocument //this gives us access in all middlewares
        next()
      }
    })
    .catch((err)=>{
      console.log(err)
      res
        .status(500)
        .send('error finding user')
    })
}

function checkPassword(req, res, next){
  // Load hash from your password DB.
  const hashedPassword = req.userDocument.password
  const { password } = req.body
  bcrypt.compare(password, hashedPassword, function(err, isPasswordCorrect) {
    if(err){
      console.log(err)
      res.status(500).send("error checking password")
    }
    if(isPasswordCorrect){
      next()
    }else{
      res
        .status(400)
        .send("Password is incorrect")
    }
  });
}

function giveAccess(req, res, next){
  //identifies that the user is logged in.
  //Using Chancejs to generate a random unique id
  const accessToken = chance.guid();

  req.userDocument.accessToken = accessToken
  req.userDocument.save() //saves this to the database. userDocument is an instance of the mongoose model and comes with these methods.
    .then((result)=>{
      if(result){
        res.clearCookie("Authentication") 
        res.clearCookie("Email")
        next()
      }else{
        res.status(400).send('error with access token')
      }
    })
    .catch((err)=>{
      console.log(err)
      res.status(500).send('Error happened here.')
    })
}

function isLoggedIn(req, res, next){
  const userEmail = req.cookies['Email']
  if(userEmail === undefined){
    res.render('pleaseLogin')
  }else{
    next()
  }
}

module.exports = router