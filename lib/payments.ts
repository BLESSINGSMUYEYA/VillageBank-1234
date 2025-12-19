// Payment processing utilities for village banking system

export interface PaymentRequest {
  amount: number
  phoneNumber: string
  paymentMethod: 'AIRTEL_MONEY' | 'MPAMBA' | 'BANK_CARD'
  reference?: string
  description?: string
}

export interface PaymentResponse {
  success: boolean
  transactionId?: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  message: string
  error?: string
}

// Mock payment processing - replace with actual payment gateway integration
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock payment processing logic
    // In production, integrate with actual payment gateways:
    // - Airtel Money API
    // - Mpamba (TNM) API  
    // - Bank card processor (Stripe, etc.)

    const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate 90% success rate for demo purposes
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      return {
        success: true,
        transactionId: mockTransactionId,
        status: 'COMPLETED',
        message: 'Payment processed successfully',
      }
    } else {
      return {
        success: false,
        status: 'FAILED',
        message: 'Payment failed',
        error: 'Insufficient funds or network error',
      }
    }
  } catch (error) {
    return {
      success: false,
      status: 'FAILED',
      message: 'Payment processing error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function verifyPayment(transactionId: string): Promise<PaymentResponse> {
  try {
    // Mock payment verification - replace with actual payment gateway verification
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, call payment gateway's verification API
    // For demo, return success for any transaction ID
    return {
      success: true,
      transactionId,
      status: 'COMPLETED',
      message: 'Payment verified successfully',
    }
  } catch (error) {
    return {
      success: false,
      status: 'FAILED',
      message: 'Payment verification failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function validatePhoneNumber(phoneNumber: string, paymentMethod: string): boolean {
  // Remove any non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  
  // Malawi phone numbers are typically 10 digits starting with 0
  // or 12 digits with country code +265
  if (paymentMethod === 'AIRTEL_MONEY') {
    // Airtel Money numbers typically start with 09 or +2659
    return cleanNumber.length === 10 && cleanNumber.startsWith('09') ||
           cleanNumber.length === 12 && cleanNumber.startsWith('2659')
  } else if (paymentMethod === 'MPAMBA') {
    // Mpamba numbers typically start with 08 or +2658
    return cleanNumber.length === 10 && cleanNumber.startsWith('08') ||
           cleanNumber.length === 12 && cleanNumber.startsWith('2658')
  }
  
  return false
}

export function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'AIRTEL_MONEY':
      return 'Airtel Money'
    case 'MPAMBA':
      return 'Mpamba'
    case 'BANK_CARD':
      return 'Bank Card'
    case 'CASH':
      return 'Cash'
    default:
      return method
  }
}
