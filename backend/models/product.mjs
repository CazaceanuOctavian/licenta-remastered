import mongoose from 'mongoose'

const createProductEntity = () => {
  // Define a sub-schema for price history entries
  const priceHistorySchema = new mongoose.Schema({
    price: {
      type: Number,
      required: true
    },
    timestamp: {
      type: String,
      required: true
    }
  }, { _id: false }) // _id: false prevents MongoDB from creating IDs for each price history entry

  const productSchema = new mongoose.Schema({
    timestamp: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    // Add the recommended_price field as an optional float
    recommended_price: {
      type: Number,
      required: false
    },
    // Add the price_history field as an array of price history objects
    price_history: {
      type: [priceHistorySchema],
      default: []
    },
    rating: {
      type: Number,
      default: 0
    },
    number_of_reviews: {
      type: Number,
      default: 0
    },
    is_in_stoc: {
      type: Number,
      default: 0
    },
    url: {
      type: String,
      required: true
    },
    product_code: {
      type: String,
      required: true
    },
    online_mag: {
      type: String,
      required: true
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    manufacturer: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true // Automatically manage createdAt and updatedAt
  })

  // Adding indexes for common query fields
  productSchema.index({ manufacturer: 1 })
  productSchema.index({ category: 1 })
  productSchema.index({ product_code: 1 })
  productSchema.index({ price: 1 })
  productSchema.index({ rating: -1 })

  return mongoose.model('Product', productSchema)
}

export default createProductEntity