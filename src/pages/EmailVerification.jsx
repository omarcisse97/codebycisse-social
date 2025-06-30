import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../components/contexts/AuthContext'

const EmailVerification = () => {
  const { register, loading } = useAuth()
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [email, setEmail] = useState('')

  // Get email from URL params or local storage if coming from registration
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    const storedEmail = localStorage.getItem('verificationEmail')
    
    if (emailParam) {
      setEmail(emailParam)
    } else if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  const handleResendEmail = async () => {
    if (!email) {
      alert('Please enter your email address')
      return
    }

    setResendLoading(true)
    setResendSuccess(false)

    try {
      // Use the register function to resend verification
      // This will trigger the email verification again
      await register(email, 'dummy-password', {}, true) // Add a flag for resend
      setResendSuccess(true)
    } catch (error) {
      console.error('Resend error:', error)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-1">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6" style={{marginTop: '-30px'}}>
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          </div>

          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification link to your email address
          </p>
          
          {email && (
            <p className="mt-2 text-sm font-medium text-blue-600">
              {email}
            </p>
          )}
        </div>

        <div className="space-y-1">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Next steps:
            </h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link in the email</li>
              <li>Return to this site to sign in</li>
            </ol>
          </div>

          {/* Resend Section */}
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600">
              Didn't receive the email?
            </p>

            {!email && (
              <div className="space-y-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <button
              onClick={handleResendEmail}
              disabled={resendLoading || !email}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Sending...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="-ml-1 mr-2 h-4 w-4" />
                  Resend verification email
                </>
              )}
            </button>

            {resendSuccess && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Verification email sent successfully!
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1">
            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              I've verified my email - Sign in
            </Link>

            <Link
              to="/register"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to registration
            </Link>
          </div>

          
        </div>
      </div>
    </div>
  )
}

export default EmailVerification