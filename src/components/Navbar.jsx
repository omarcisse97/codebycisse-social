import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext';
import { useHabboAvatar } from './contexts/HabboAvatarContext';
import UserSettings from './UserSettings';
import SearchUserDropdown from './SearchUserDropdown';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  UserIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UserIcon as UserIconSolid,
  BellIcon as BellIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid
} from '@heroicons/react/24/solid'

const Navbar = () => {
  const { userInfo } = useAuth();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const { avatar } = useHabboAvatar();
  const location = useLocation()
  const navigate = useNavigate()
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const isActive = (path) => location.pathname === path

  const handleUserSelect = (user) => {
    // Navigate to user's profile when selected
    navigate(`/profile/${user.id}`);
    setShowMobileSearch(false); // Close mobile search if open
  }

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: ChatBubbleLeftIcon,
      iconSolid: ChatBubbleLeftIconSolid,
      badge: 3
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: BellIcon,
      iconSolid: BellIconSolid,
      badge: 12
    }
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  YūConnect
                </span>
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchUserDropdown onUserSelect={handleUserSelect} />
            </div>

            {/* Mobile Search Button */}
            <button 
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const active = isActive(item.path)
                const Icon = active ? item.iconSolid : item.icon

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative p-2 sm:p-3 rounded-xl transition-all duration-200 ${active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    title={item.name}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium text-[10px] sm:text-xs">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}

              {/* User Menu */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={avatar?.getHeadOnlyImage()}
                      alt={`${userInfo.username}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold text-sm">${userInfo.username.charAt(0).toUpperCase()}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{userInfo.username}</p>
                      <p className="text-sm text-gray-500">{userInfo.email}</p>
                    </div>
                    <Link
                      to={`/profile/${userInfo.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Your Profile
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => { 
                        setIsUserSettingsOpen(true);
                        setShowUserMenu(false);
                      }}
                    >
                      Settings
                    </button>
                    <div className="border-t border-gray-100 mt-2">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => { logout(); }}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="bg-white h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Search</h2>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <SearchUserDropdown 
                onUserSelect={(user) => {
                  handleUserSelect(user);
                  setShowMobileSearch(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}

      <UserSettings
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
      />
    </>
  )
}

export default Navbar