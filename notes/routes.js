const router = require('express').Router()
const NoteModel = require('./model') //constructors or model names should be capitalized
//const auth = require('../auth')
const UserModel = require('../users/model')


//this route will send json and inject it into a handlebars template. 
router.get('/',  
  (req, res, next)=>{
  NoteModel.find().lean()
    .then((results)=>{
      if(!results){
        res
          .status(404)
          .send('No Notes Found')
      }else{
        //res.json(results) //works
        //res.send(results) //works the same
        res.render("viewAllNotes", {json: results})
      }
    })
    .catch((err)=>{
      console.log(err)
      res
        .send(500)
        .send("Error happened")
    })//will catch any error not forseen
})

//get notes by user email
router.get('/user', 
  auth,
  (req, res, next)=>{
    NoteModel.find({ authorId: req.userDocument._id }).lean()
      .then((results)=>{
        if(!results){
          res
            .status(404)
            .send('No Notes Found')
        }else{
          res.render("loginLandingPage", {json: results})
        }
      })
      .catch((err)=>{
        console.log(err)
        res
          .send(500)
          .send("Error happened")
    })
})

router.get('/create', (req, res, next)=>{
  res.render('createNote');
})

//enter a new note
router.post('/create',
  auth,
  inputValidation, //this middleware will check data (validate) and then allow the
  //program to progress to the next middleware (creating and saving the note)
  (req, res, next)=>{
    const newNote = new NoteModel({
    title: req.body.title,
    body: req.body.body,
    authorId: req.userDocument._id //attaches the user id to this field which is known via the request object because they had to login
    })

  newNote
    .save() //this will attempt to save the data in the db and will return a promise
    .then((document)=>{
      if(document){
        //res.send(document)
        res.render("noteSavedLandingPage")
      }else{
        res.send('document did not save')
      }
    })
    .catch((err)=>{
      console.log(err)
      res.send('error happened.')
    })
  
})

//these api are example of rest api structure and should be retained. They only differ by the get, post, put, and delete calls and perform different funcions based on each. 
//get single note by id
router.get('/:id', (req, res, next)=>{
  NoteModel.findById(req.params.id).lean()
    .then((results)=>{
      if(!results){
        res
          .status(404)
          .send('No Note Found')
      }else{
        res.render("editNote", {json: results})
      }
    })
    .catch((err)=>{
      console.log(err)
      res
        .send(500)
        .send("Error happened")
    })
})

//update note
//.put() accepts the url path first and then chains together middleware so long as the first middleware successfully calls next()
router.put('/:id', 
  auth,
  //passport.authenticate('bearer', { session: false }),
  updateInputValidation, 
  findNote,
  isAuthor,
  (req, res, next)=>{
    NoteModel.findOneAndUpdate({_id: req.params.id}, req.updateObj, 
      {new: true}) //this method takes three parameters: finding the data by key, what to change, and whether or not to display the older version of the data or the newer version with the updates upon res.send()
      .then((results)=>{
        if(!results){
          res
            .status(404)
            .send('No Note Found')
        }else{
          res.json(results)
        }
      })
      .catch((err)=>{
        console.log(err)
        res
          .send(500)
          .send("Error happened")
      })
})

//delete a note
router.delete('/:id', 
  auth,
  findNote,
  isAuthor,
  (req, res, next)=>{
    NoteModel.findOneAndRemove({_id: req.params.id})
      .then((results)=>{
        if(!results){
          res
            .status(404)
            .send('No Note Found')
        }else{
          res.send(results)
        }
      })
      .catch((err)=>{
        console.log(err)
        res
          .send(500)
          .send("Error happened")
      })
})

//replaces passport.authenticate()
function auth(req, res, next){
  const accessToken = req.cookies['Authentication'];
  const userEmail = req.cookies['Email'];
  UserModel.findOne({ email: userEmail})
    .then((userDocument)=>{
      if(accessToken === userDocument.accessToken){
        req.userDocument = userDocument;
        next()
      }else{
        res.send('unauthorized');
      }
    })
}

function inputValidation(req, res, next){
  //make sure required field are there and if missing display error
  const {title, body} = req.body
  const missingFields = []

  if(!title){
    missingFields.push('title')
  }
  if(!body){
    missingFields.push('body')
  }

  if(missingFields.length>0){
    res
      .status(400)
      .send(`The following fields are missing: ${missingFields.join(', ')}`)
  }else{
    next()
  }
}

function updateInputValidation(req, res, next){
  const { title, body } = req.body
  const updateObj = {}

  if(title){
    updateObj.title = title
  }
  if(body){
    updateObj.body = body
  }

  req.updateObj = updateObj //this modifies the universal request object and allows the updateObj object to be accessible via any req in any of these other middleware. 

  next()
}

function findNote(req, res, next){
  NoteModel.findById(req.params.id)
    .then((noteDocument)=>{
      if(!noteDocument){
        res.status(404).send('note not found')
      }else{
        req.noteDocument = noteDocument
        next()
      }
    })
    .catch((err)=>{
      console.log(err)
      .status(500).send("error finding note")
    })
}

function isAuthor(req, res, next){
  if((req.userDocument._id).equals(req.noteDocument.authorId)){
    next()
  }else{
    res.status(401).send('You are not authorized to take this action')
  }
}

module.exports = router


//this is for exporting the two separate api and routes  
// module.exports = {
//   pageRoutes: 
//   apiRoutes: 
// }