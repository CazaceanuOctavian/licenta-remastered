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
  }, { _id: false }) 

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
    recommended_price: {
      type: Number,
      required: false
    },
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
    views: {
      type: Number,
      default: 0
    },
    impressions: {
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

  productSchema.index({ manufacturer: 1 })
  productSchema.index({ category: 1 })
  productSchema.index({ product_code: 1 })
  productSchema.index({ price: 1 })
  productSchema.index({ rating: -1 })

  return mongoose.model('Product', productSchema)
}

export default createProductEntity