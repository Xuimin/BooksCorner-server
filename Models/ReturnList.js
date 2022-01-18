const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReturnListSchema = new Schema({
  userId: { type: String },
  toReturn: [{
    bookId: { type: String },
    book: [{
      booksId: { type: String },
      title: { type: String },
      price: { type: Number }
    }],
    date_return: { type: String }
  }]
})

module.exports = mongoose.model('returnList', ReturnListSchema)