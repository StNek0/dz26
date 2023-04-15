const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  onSale: {
    type: Boolean,
    required: true
  },
  newPrice: {
    type: Number
  }
})

const Product = mongoose.model('products', productSchema)
module.exports = Product