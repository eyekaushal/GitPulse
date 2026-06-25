function errorHandler(err, req, res, _next) {
    console.error('Error:', err.message);
  
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  
    // Axios errors from GitHub API
    if (err.response) {
      const status = err.response.status;
      const messages = {
        401: 'GitHub token is invalid or expired',
        403: 'GitHub API rate limit exceeded',
        404: 'Resource not found on GitHub',
        422: 'Invalid request to GitHub API'
      };
      return res.status(status).json({
        error: messages[status] || `GitHub API error (${status})`
      });
    }
  
    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: err.errors.map(e => e.message)
      });
    }
  
    // Sequelize unique constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Resource already exists' });
    }
  
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  module.exports = errorHandler;