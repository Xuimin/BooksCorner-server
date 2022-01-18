const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WalletSchema = new Schema({
  userId: { type: String },
  amount: { type: Number, default: 0 }
})

module.exports = mongoose.model('wallet', WalletSchema)