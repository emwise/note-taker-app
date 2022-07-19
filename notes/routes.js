const router = require('express').Router()
const NoteModel = require('./model') //constructors or model names should be capitalized
const passport = require('../auth')
//get all
router.get('/',  
  (req, res, next)=>{
  NoteModel.find()
    .then((results)=>{
      if(!results){
        res
          .status(404)
          .send('No Notes Found')
      }else{
        res.json(results)
      }
    })
    .catch((err)=>{
      console.log(err)
      res
        .send(500)
        .send("Error happened")
    })//will catch any error not forseen
})

//get single note by id
router.get('/:id', (req, res, next)=>{
  NoteModel.findById(req.params.id)
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

//enter a new note
router.post('/', 
  passport.authenticate('bearer', { session: false }),
  inputValidation, //this middleware will check data (validate) and then allow the
  //program to progress to the next middleware (creating and saving the note)
  (req, res, next)=>{
    const newNote = new NoteModel({
    title: req.body.title,
    body: req.body.body,
    authorId: req.user._id //attaches the user id to this field which is known via the request object because they had to login
    })

  newNote
    .save() //this will attempt to save the data in the db and will return a promise
    .then((document)=>{
      if(document){
        res.json(document)
      }else{
        res.send('document did not save')
      }
    })
    .catch((err)=>{
      console.log(err)
      res.send('error happened.')
    })
  
})

//update note
//.put() accepts the url path firsth and then chains together middleware so long as the first middleware successfully calls next()
router.put('/:id', 
passport.authenticate('bearer', { session: false }),
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
  passport.authenticate('bearer', { session: false }),
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
          res.send("Successfully deleted!")
        }
      })
      .catch((err)=>{
        console.log(err)
        res
          .send(500)
          .send("Error happened")
      })
})

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

  req.updateObj = updateObj //this modifies the universal request object and allows the updateObj object to be accessible via any req in any of these other middlewares. 

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
  if((req.user._id).equals(req.noteDocument.authorId)){
    next()
  }else{
    res.status(401).send('You are not authorized to take this action')
  }
}

module.exports = router