import mongoose from 'mongoose'

const createProductEntity = () => {
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