const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookSchema = new Schema({
  title: { type: String },
  description: { type: String },
  price: { type: Number },
  isAvailable: { type: Boolean, default: true },
  image: { type: String, default: null },
  category: { type: String },
  ISBN: { type: Number },
  isRecommended: { type: Boolean, default: false },
  overall: { type: Number, default: 0 }
})

module.exports = mongoose.model('book', BookSchema)