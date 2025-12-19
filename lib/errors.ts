// Centralized error handling utilities

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class PaymentError extends APIError {
  constructor(message: string = 'Payment processing failed') {
    super(message, 400, 'PAYMENT_ERROR')
    this.name = 'PaymentError'
  }
}

// Error handler utility for API routes
export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  if (error instanceof Error) {
    // Log detailed error for debugging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })

    // Return generic error to client
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Unknown error type
  return new Response(
    JSON.stringify({
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

// Validation helper
export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format')
  }
}

export function validatePhoneNumber(phone: string): void {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number format')
  }
}

export function validatePositiveNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number' || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`)
  }
}

export function validateUUID(id: string, fieldName: string = 'ID'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`)
  }
}

// Async error wrapper for API handlers
export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleAPIError(error)
    }
  }
}
