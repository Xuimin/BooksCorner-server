const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BorrowListSchema = new Schema({
  userId: { type: String },
  borrow: [{
    bookId: { type: String },
    book: [{
      booksId: { type: String },
      title: { type: String },
      price: { type: Number },
      isAvailable: { type: Boolean, default: true },
      image: { type: String },
      category: { type: String },
    }],
    date_borrowed: { type: String, default: Date.now() },
    date_return: { type: String },
    isPending: { type: Boolean, default: false } // to return money
  }],
  amount: { type: Number, default: 0 }
})

module.exports = mongoose.model('borrowList', BorrowListSchema)