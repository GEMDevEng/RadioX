/**
 * Query middleware for handling field selection, pagination, and sorting
 * - Supports field selection with comma-separated fields
 * - Implements pagination with page and limit parameters
 * - Provides sorting with comma-separated fields (prefix with - for descending)
 */
const queryMiddleware = (req, res, next) => {
  // Field selection
  if (req.query.fields) {
    req.fieldSelection = req.query.fields.split(',').join(' ');
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  req.pagination = {
    page,
    limit,
    skip
  };
  
  // Add pagination metadata to response
  const originalJson = res.json;
  res.json = function(data) {
    if (Array.isArray(data) && req.pagination) {
      return originalJson.call(this, {
        data,
        pagination: {
          page: req.pagination.page,
          limit: req.pagination.limit,
          total: req.totalCount || data.length,
          pages: req.totalCount ? Math.ceil(req.totalCount / req.pagination.limit) : 1
        }
      });
    }
    return originalJson.call(this, data);
  };
  
  // Sorting
  if (req.query.sort) {
    const sortFields = req.query.sort.split(',');
    const sortObject = {};
    
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sortObject[field.substring(1)] = -1;
      } else {
        sortObject[field] = 1;
      }
    });
    
    req.sortOptions = sortObject;
  } else {
    // Default sort by createdAt descending
    req.sortOptions = { createdAt: -1 };
  }
  
  next();
};

module.exports = queryMiddleware;
