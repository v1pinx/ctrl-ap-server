import { logger } from "../utils/logger.js"

const errorHandler = (err, req, res, next) => {
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  })

  // Default error
  const error = {
    success: false,
    error: "Internal server error",
  }

  // Database errors
  if (err.code === "23505") {
    // Unique violation
    error.error = "Resource already exists"
    return res.status(409).json(error)
  }

  if (err.code === "23503") {
    // Foreign key violation
    error.error = "Referenced resource not found"
    return res.status(400).json(error)
  }

  if (err.code === "23514") {
    // Check violation
    error.error = "Invalid data provided"
    return res.status(400).json(error)
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.error = "Invalid token"
    return res.status(401).json(error)
  }

  if (err.name === "TokenExpiredError") {
    error.error = "Token expired"
    return res.status(401).json(error)
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.error = "Validation failed"
    error.details = err.details
    return res.status(400).json(error)
  }

  // Custom application errors
  if (err.statusCode) {
    error.error = err.message
    return res.status(err.statusCode).json(error)
  }

  // Default 500 error
  res.status(500).json(error)
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export { errorHandler, AppError };