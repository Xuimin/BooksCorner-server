const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
  image: { type: String, default: null },
  isAdmin: { type: Boolean, default: false }
})

module.exports = mongoose.model('user', UserSchema)