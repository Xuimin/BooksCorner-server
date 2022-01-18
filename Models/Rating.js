const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RatingSchema = new Schema({
  bookId: { type: String },
  book: [{
    booksId: { type: String },
    title: { type: String },
    price: { type: Number },
    isAvailable: { type: Boolean, default: true },
    image: { type: String },
    category: { type: String },
  }],
  rate: [{
    username: { type: String },
    rating: { type: Number },
    comment: { type: String, default: null },
    isEdited: { type: Boolean, default: false }
  }]
})

module.exports = mongoose.model('rating', RatingSchema)