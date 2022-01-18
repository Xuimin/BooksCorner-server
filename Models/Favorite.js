const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FavoriteSchema = new Schema({
  userId: { type: String },
  likes: [{
    bookId: { type: String },
    book: [{
      booksId: { type: String },
      title: { type: String },
      price: { type: Number },
      isAvailable: { type: Boolean, default: true },
      image: { type: String },
      category: { type: String },
    }]
  }]
})

module.exports = mongoose.model('favorite', FavoriteSchema)