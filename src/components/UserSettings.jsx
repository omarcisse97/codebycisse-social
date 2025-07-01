import React, { useState, useEffect } from 'react';
import { X, User, Globe, MapPin, Phone, Calendar, Lock, AtSign } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserSettings = ({ 
  isOpen, 
  onClose
}) => {

  const { userInfo, updateUserData } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: '',
    location: '',
    phone: '',
    birth_date: '',
    is_private: false,
    username: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && userInfo) {
      setFormData({
        full_name: userInfo?.full_name || '',
        bio: userInfo?.bio || '',
        website: userInfo?.website || '',
        location: userInfo?.location || '',
        phone: userInfo?.phone || '',
        birth_date: userInfo?.birth_date || '',
        is_private: userInfo?.is_private || false,
        username: userInfo?.username || ''
      });
      setErrors({});
    }
  }, [isOpen, userInfo]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length > 100) {
      newErrors.full_name = 'Full name must be less than 100 characters';
    }
    
    // Username validation
    if (formData.username && formData.username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    }
    
    // Website validation
    if (formData.website && formData.website.length > 255) {
      newErrors.website = 'Website URL must be less than 255 characters';
    } else if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website must be a valid URL (starting with http:// or https://)';
    }
    
    // Location validation
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location must be less than 100 characters';
    }
    
    // Phone validation
    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be less than 20 characters';
    }
    
    // Birth date validation
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = 'Birth date cannot be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const toUpdate = {};
      console.log('Attempt to update avatar');
      for(const field in formData){
        if(formData[field] !== '' && formData[field] !== userInfo[field]){
            console.log('Found update for field : ', field);
            console.log('Data: ', formData[field]);
            toUpdate[field] = formData[field];
        }
      }
      console.log('checking for valid updates -> ', toUpdate);
      if(Object.keys(toUpdate).length >= 1){
        console.log('About to launch update on -> ', toUpdate);
        const resultUpdate = await updateUserData(toUpdate);
        if(resultUpdate === true){
            console.log('Update success');
            setFormData(userInfo);
            navigate(`/profile/${userInfo?.id}`);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-sm sm:max-w-md lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg sm:rounded-t-xl">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Update Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <AtSign className="w-4 h-4" />
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              maxLength={50}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Website and Location - Side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Website */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                maxLength={255}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.website}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="City, Country"
              />
              {errors.location && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Phone and Birth Date - Side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                maxLength={20}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Birth Date
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                  errors.birth_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.birth_date && (
                <p className="mt-1 text-xs sm:text-sm text-red-500">{errors.birth_date}</p>
              )}
            </div>
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => handleInputChange('is_private', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Private Account
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  When your account is private, only approved followers can see your posts
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-lg sm:rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;