const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { isEmail } = require('validator')

const UserSchema = new Schema({
  username: { type: String },
  email: { type: String, isValid: [isEmail, 'Please enter a valid email'] },
  password: { type: String },
  image: { type: String, default: null },
  isAdmin: { type: Boolean, default: false }
})

module.exports = mongoose.model('user', UserSchema)