const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId, //mongoose provides this type
    ref: 'User', //references the user model
    required: true
  },
  createDate: {
    type: Date,
    required: true,
    default: new Date()
  },
})

const NoteModel = mongoose.model('Note', noteSchema); //'Note' is going to be changes to 'notes'
//by mongoose automatically and that is where data for this schema will be
//stored within the mongodb database. 

module.exports = NoteModel;