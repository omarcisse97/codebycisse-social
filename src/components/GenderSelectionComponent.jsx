import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

const GenderSelectionComponent = ({ onClose }) => {
  const [selectedGender, setSelectedGender] = useState('');
  const [showError, setShowError] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { updateUserData } = useAuth();

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    setShowError(false);
  };

  const handleSubmit = async () => {
    if (!selectedGender) {
      setShowError(true);
      return;
    }
    
    let isSuccess = false;
    switch(selectedGender){
        case 'Male': 
            isSuccess = await updateUserData({gender: 'M'});
            break;
        case 'Female': 
            isSuccess = await updateUserData({gender: 'F'});
            break;
        default: break;
    }
    
    if(isSuccess === true){
        setIsSubmitted(true);
        // If onClose is provided (modal usage), close after delay
        // If not provided (App.jsx usage), the component will just show success
        if (onClose) {
          setTimeout(() => onClose(), 1500);
        }
        // For App.jsx usage, the parent will re-render automatically when userInfo updates
    }
  };

  const resetForm = () => {
    setSelectedGender('');
    setShowError(false);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Updated!</h2>
          <p className="text-gray-600 mb-4">Gender: <span className="font-semibold text-blue-600">{selectedGender}</span></p>
          <button 
            onClick={resetForm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Avatar Gender</h2>
        <p className="text-gray-600">This is required to customize your Habbo avatar</p>
        <div className="w-12 h-1 bg-red-500 mx-auto mt-2 rounded"></div>
        <p className="text-sm text-red-600 mt-1">* Required field</p>
      </div>

      <div className="space-y-4 mb-6">
        {/* Male Option */}
        <div 
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
            selectedGender === 'Male' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleGenderChange('Male')}
        >
          <div className="flex items-center">
            <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
              selectedGender === 'Male' 
                ? 'border-blue-500 bg-blue-500' 
                : 'border-gray-300'
            }`}>
              {selectedGender === 'Male' && (
                <div className="w-full h-full rounded-full bg-white scale-50"></div>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-3">👨</span>
              <div>
                <h3 className="font-semibold text-gray-900">Male</h3>
                <p className="text-sm text-gray-600">Masculine avatar appearance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Female Option */}
        <div 
          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
            selectedGender === 'Female' 
              ? 'border-pink-500 bg-pink-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleGenderChange('Female')}
        >
          <div className="flex items-center">
            <div className={`w-5 h-5 rounded-full border-2 mr-3 ${
              selectedGender === 'Female' 
                ? 'border-pink-500 bg-pink-500' 
                : 'border-gray-300'
            }`}>
              {selectedGender === 'Female' && (
                <div className="w-full h-full rounded-full bg-white scale-50"></div>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-2xl mr-3">👩</span>
              <div>
                <h3 className="font-semibold text-gray-900">Female</h3>
                <p className="text-sm text-gray-600">Feminine avatar appearance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {showError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span className="text-red-700 font-medium">Please select a gender to continue</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button 
        onClick={handleSubmit}
        disabled={!selectedGender}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
          selectedGender 
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {selectedGender ? '✓ Continue to Avatar Creator' : 'Select Gender to Continue'}
      </button>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          This helps us customize your avatar appearance. You can change this later in settings.
        </p>
      </div>
    </div>
  );
};

export default GenderSelectionComponent;