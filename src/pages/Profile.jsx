import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../components/contexts/AuthContext'
import { useHabboAvatar } from '../components/contexts/HabboAvatarContext'
import UserProfile from '../components/models/UserProfile' 

const Profile = () => {
  const { user_id } = useParams() // Changed from username to user_id
  const { userInfo } = useAuth()
  const { avatar } = useHabboAvatar()
  
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)

  // Determine if this is the current user's profile
  const isOwnProfile = !user_id || user_id === userInfo?.id
  

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const profile = new UserProfile()
        
        if (isOwnProfile) {
          // Initialize with current user's data
          await profile.init(true, '', userInfo, avatar)
        } else {
          // Fetch other user's data
          await profile.init(false, user_id)
        }
        
        setUserProfile(profile)
      } catch (err) {
        console.error('Failed to initialize profile:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    // Only initialize if we have required data
    if (isOwnProfile && userInfo && avatar) {
      initializeProfile()
    } else if (!isOwnProfile && user_id) {
      initializeProfile()
    }
  }, [user_id, userInfo, avatar, isOwnProfile])

  const handleAvatarSave = async (newAvatar) => {
    try {
      // Update the avatar in context and backend
      console.log('Avatar saved:', newAvatar)
      
      // Re-initialize profile with new avatar data
      if (userProfile && isOwnProfile) {
        await userProfile.init(true, '', userInfo, newAvatar)
        setUserProfile(userProfile)
      }
    } catch (err) {
      console.error('Failed to save avatar:', err)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          {/* Cover photo skeleton */}
          <div className="h-48 sm:h-64 bg-gray-300"></div>
          
          <div className="relative px-4 sm:px-6">
            <div className="pb-6">
              {/* Avatar skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 lg:-mt-20">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gray-300 rounded-lg border-4 border-white"></div>
              </div>
              
              {/* Profile info skeleton */}
              <div className="mt-4 sm:mt-6 space-y-3">
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No profile data
  if (!userProfile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-400 mb-2">Profile Not Found</h2>
          <p className="text-gray-400">The requested profile could not be found.</p>
        </div>
      </div>
    )
  }

  // Render the profile using UserProfile class methods
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Content */}
      <div className="bg-white">
        {userProfile.RenderProfile({
          setShowAvatarEditor,
          activeTab,
          showAvatarEditor,
          handleAvatarSave,
          setActiveTab
        })}
      </div>
    </div>
  )
}

export default Profile