import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearch } from './contexts/SearchContext';

const SearchUserDropdown = ({ onUserSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const { searchUsers, users } = useSearch();
  // Mock search function - replace with your API call
  const searchUsersTest = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await searchUsers(query, '5');
    
    // await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock results - replace with actual API call to your Search class
    const mockResults = [
      {
        id: 1,
        username: 'john_doe',
        full_name: 'John Doe',
        avatar_url: 'https://via.placeholder.com/40',
        is_private: false
      },
      {
        id: 2,
        username: 'jane_smith',
        full_name: 'Jane Smith',
        avatar_url: 'https://via.placeholder.com/40',
        is_private: true
      },
      {
        id: 3,
        username: 'mike_wilson',
        full_name: 'Mike Wilson',
        avatar_url: 'https://via.placeholder.com/40',
        is_private: false
      }
    ].filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.full_name.toLowerCase().includes(query.toLowerCase())
    );

    // setSearchResults(mockResults);
    await searchUsers(query, '5');
    
    setIsLoading(false);
  };
  useEffect(() => {
    if(users){
      setSearchResults(users);
    }
  }, [users]);

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsersTest(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleUserClick = (user) => {
    onUserSelect(user);
    setSearchQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search people, posts..."
          className="block w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm sm:text-base"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (searchQuery.trim() || searchResults.length > 0) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 max-h-64 sm:max-h-80 overflow-y-auto z-50"
        >
          {isLoading ? (
            <div className="p-3 sm:p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-1 sm:py-2">
              <div className="px-3 py-1.5 sm:py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                People
              </div>
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={user?.avatar?.getHeadOnlyImage()}
                      alt={`${user.username}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold text-xs sm:text-sm">${user.username.charAt(0).toUpperCase()}</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.full_name}</p>
                      {user.is_private && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() && !isLoading ? (
            <div className="p-3 sm:p-4 text-center text-gray-500">
              <MagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs sm:text-sm">No results found for "{searchQuery}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
export default SearchUserDropdown;
