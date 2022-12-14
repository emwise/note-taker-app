const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  accessToken: {
    type: String
  }
})

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;