import models from "../../models/index.mjs"

const getAllProductsFiltered = async (req, res, next) => {
  try {
    // Start building the query
    let query = models.Product.find()
    let filterConditions = {}
    
    // Filter by product name
    if (req.query.name) {
      // Split the search term into words
      const searchTerms = req.query.name.split(/\s+/).filter(term => term.length > 0);
      
      if (searchTerms.length > 0) {
        // Create an array of regex patterns for each word
        const nameRegexPatterns = searchTerms.map(term => ({
          name: { $regex: term, $options: 'i' }
        }));
        
        // Use $and to match all terms in any order
        filterConditions.$and = nameRegexPatterns;
      }
    }

    if (req.query.productCode) {
      filterConditions.product_code = req.query.productCode
    }
    
    // Filter by manufacturer
    if (req.query.manufacturer) {
      filterConditions.manufacturer = { $regex: req.query.manufacturer, $options: 'i' }
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filterConditions.price = {}
      
      if (req.query.minPrice) {
        filterConditions.price.$gte = parseFloat(req.query.minPrice)
      }
      
      if (req.query.maxPrice) {
        filterConditions.price.$lte = parseFloat(req.query.maxPrice)
      }
    }
    
    // Apply generic filter if provided
    if (req.query.filterField && req.query.filterValue) {
      filterConditions[req.query.filterField] = { $regex: req.query.filterValue, $options: 'i' }
    }
    
    // Apply all filter conditions
    if (Object.keys(filterConditions).length > 0) {
      query = query.find(filterConditions)
    }
    
    // Get total count for pagination
    const count = await models.Product.countDocuments(filterConditions)
    
    // Sorting
    if (req.query.sortField && req.query.sortOrder) {
      const sortDirection = req.query.sortOrder === 'DESC' ? -1 : 1
      const sortOption = {}
      sortOption[req.query.sortField] = sortDirection
      query = query.sort(sortOption)
    }
    
    // Pagination
    if (req.query.pageSize && req.query.pageNumber) {
      const pageSize = parseInt(req.query.pageSize)
      const pageNumber = parseInt(req.query.pageNumber)
      query = query.skip(pageSize * pageNumber).limit(pageSize)
    }
    
    // Determine projection (fields to include/exclude)
    if (req.query.extendedProduct && req.query.extendedProduct === 'false') {
      query = query.select('-specifications')
    }
    
    // Execute query and get products
    const products = await query.exec()
    
    res.status(200).json({ data: products, count })
  } catch (err) {
    next(err)
  }
}

/**
 * Get products sorted by views with optional limit and sort direction
 * @route GET /api/products/by-views
 * @param {string} order - Sort order ('asc' or 'desc', defaults to 'desc')
 * @param {number} limit - Maximum number of products to return
 * @access Public
 */
const getProductsByViews = async (req, res, next) => {
  try {
    // Start building the query
    let query = models.Product.find();
    
    // Get sort order from query params (default to descending)
    const sortOrder = req.query.order && req.query.order.toLowerCase() === 'asc' ? 1 : -1;
    
    // Apply sorting by views
    query = query.sort({ views: sortOrder });
    
    // Apply limit if provided
    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      if (!isNaN(limit) && limit > 0) {
        query = query.limit(limit);
      }
    }
    
    // Execute query and get products
    const products = await query.exec();
    
    // Get total count for metadata
    const count = products.length;
    
    res.status(200).json({ 
      data: products, 
      count,
      metadata: {
        sortedBy: 'views',
        sortOrder: sortOrder === 1 ? 'ascending' : 'descending',
        limit: req.query.limit ? parseInt(req.query.limit) : null
      }
    });
  } catch (err) {
    next(err);
  }
}

const incrementProductViews = async (req, res, next) => {
  try {
    const productId = req.params.pid;
    
    // Find the product and increment its views
    const product = await models.Product.findByIdAndUpdate(
      productId,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (product) {
      res.status(200).json({ 
        success: true,
        views: product.views 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
  } catch (err) {
    next(err);
  }
};

const incrementProductImpressions = async (req, res, next) => {
  try {
    const productId = req.params.pid;
    
    // Find the product and increment its impressions
    const product = await models.Product.findByIdAndUpdate(
      productId,
      { $inc: { impressions: 1 } },
      { new: true }
    );
    
    if (product) {
      res.status(200).json({ 
        success: true,
        impressions: product.impressions 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await models.Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true }
    )
    
    if (product) {
      res.status(200).json(product)
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (err) {
    next(err)
  }
}

const deleteProduct = async (req, res, next) => {
  try {
    const product = await models.Product.findByIdAndDelete(req.params.productId)
    
    if (product) {
      res.status(204).end()
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (err) {
    next(err)
  }
}

export default {
  getAllProductsFiltered,
  getProductsByViews,
  incrementProductViews,
  incrementProductImpressions,
  updateProduct,
  deleteProduct
}