import React, { useState } from 'react'
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowPathRoundedSquareIcon,
  ShareIcon,
  PhotoIcon,
  FaceSmileIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../components/contexts/AuthContext';
import { useHabboAvatar } from '../components/contexts/HabboAvatarContext';
import { HabboAvatar } from '../components/models/Avatar';

const Home = () => {
  const [newPost, setNewPost] = useState('')
  const { userInfo } = useAuth();
  const { avatar } = useHabboAvatar();
  // Default avatar for user
  


  const AvatarDisplay = ({ _avatar, size = 'medium', headOnly = 'false' }) => {
    const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-10 h-10 sm:w-12 sm:h-12',
      large: 'w-16 h-16'
    }
    if (!_avatar) {
      return (
        <div className={`${sizeClasses[size]} relative bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden border-4 border-white shadow-lg flex items-center justify-center`}>
          <div className="w-full h-full bg-gradient-to-b from-sky-200 to-green-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-xs">Avatar</span>
          </div>
        </div>
      )
    }
    return (
      <div className={`${sizeClasses[size]} relative bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden border-4 border-white shadow-lg flex items-center justify-center`}>
        <img
          src={headOnly === 'false' ? _avatar.getFullBodyImage('3', '3') : _avatar.getHeadOnlyImage()}
          alt='avatar'
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-b from-sky-200 to-green-200 rounded-lg flex items-center justify-center">
                                <span class="text-gray-500 text-xs">Avatar</span>
                                </div>
                            `;
          }}
        />
      </div>
    );
  }
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: {
        username: 'sarah_dev',
        name: 'Sarah Johnson',
        avatar: new HabboAvatar('F', {
          hr: { color: '1095', set: '890' },
          hd: { color: '', set: '600' },
          ch: { color: '', set: '4353' },
          lg: { color: '', set: '' },
          sh: { color: '', set: '' },
          ha: { color: '', set: '' },
          he: { color: '', set: '' },
          ea: { color: '', set: '3698' },
          fa: { color: '', set: '' },
          ca: { color: '', set: '' },
          wa: { color: '', set: '' },
          cc: { color: '', set: '' },
          cp: { color: '', set: '' }
        }),
        verified: true
      },
      content: 'Just shipped a new feature! The feeling when your code works perfectly on the first try is unmatched 🚀',
      timestamp: '2h',
      likes: 24,
      comments: 5,
      reposts: 2,
      liked: false,
      images: []
    },
    {
      id: 2,
      author: {
        username: 'gokuKing_89996',
        name: 'San Goku',
        avatar: new HabboAvatar('M', {
          hr: { color: '', set: '4269' },
          hd: { color: '', set: '5840' },
          ch: { color: '', set: '5229' },
          lg: { color: '', set: '' },
          sh: { color: '', set: '' },
          ha: { color: '', set: '' },
          he: { color: '', set: '' },
          ea: { color: '', set: '1604' },
          fa: { color: '', set: '' },
          ca: { color: '', set: '' },
          wa: { color: '', set: '' },
          cc: { color: '', set: '' },
          cp: { color: '', set: '' }
        }),
        verified: false
      },
      content: 'Beautiful sunset from my home office today. Sometimes the best debugging sessions happen with a view like this 🌅',
      timestamp: '4h',
      likes: 156,
      comments: 12,
      reposts: 8,
      liked: true,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop']
    },
    {
      id: 3,
      author: {
        username: 'designer_alex',
        name: 'Alex Rivera',
        avatar: new HabboAvatar('F', {
          hr: { color: '1045-1040', set: '6010' },
          hd: { color: '4', set: '628' },
          ch: { color: '1225', set: '3137' },
          lg: { color: '', set: '3174' },
          sh: { color: '', set: '' },
          ha: { color: '', set: '' },
          he: { color: '', set: '' },
          ea: { color: '', set: '' },
          fa: { color: '', set: '' },
          ca: { color: '', set: '' },
          wa: { color: '', set: '' },
          cc: { color: '', set: '' },
          cp: { color: '', set: '' }
        }),
        verified: true
      },
      content: 'Working on some exciting new UI concepts. The intersection of design and technology never ceases to amaze me. What do you think about minimalist interfaces vs. feature-rich designs?',
      timestamp: '6h',
      likes: 89,
      comments: 23,
      reposts: 15,
      liked: false,
      images: []
    }
  ])

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    const post = {
      id: Date.now(),
      author: {
        username: userInfo?.username,
        name: userInfo.full_name,
        avatar: avatar,
        verified: false
      },
      content: newPost,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      reposts: 0,
      liked: false,
      images: []
    }

    setPosts([post, ...posts])
    setNewPost('')
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        }
        : post
    ))
  }
  console.log('Posts -> ', posts);
  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <form onSubmit={handleCreatePost}>
          <div className="flex space-x-3 sm:space-x-4">
            <AvatarDisplay _avatar={avatar} size="large" />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder={`What's on your mind, ${userInfo?.full_name}?`}
                className="w-full p-3 sm:p-4 text-base sm:text-lg placeholder-gray-500 border-none resize-none focus:outline-none"
                rows="3"
              />
              <div className="flex items-center justify-between mt-3 sm:mt-4">
                <div className="flex space-x-2 sm:space-x-4">
                  <button
                    type="button"
                    className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:bg-blue-50 px-2 sm:px-3 py-2 rounded-lg transition-colors"
                  >
                    <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm font-medium hidden sm:inline">Photo</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center space-x-1 sm:space-x-2 text-blue-600 hover:bg-blue-50 px-2 sm:px-3 py-2 rounded-lg transition-colors"
                  >
                    <FaceSmileIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm font-medium hidden sm:inline">Emoji</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newPost.trim()}
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4 sm:space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          Load more posts
        </button>
      </div>
    </div>
  )
}

const PostCard = ({ post, onLike }) => {
  

  const AvatarDisplay = ({ _avatar, size = 'medium', headOnly = 'false' }) => {
    const sizeClasses = {
      small: 'w-8 h-8',
      medium: 'w-10 h-10 sm:w-12 sm:h-12',
      large: 'w-16 h-16'
    }
    if (!_avatar) {
      return (
        <div className={`${sizeClasses[size]} relative bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden border-4 border-white shadow-lg flex items-center justify-center`}>
          <div className="w-full h-full bg-gradient-to-b from-sky-200 to-green-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-xs">Avatar</span>
          </div>
        </div>
      )
    }
    return (
      <div className={`${sizeClasses[size]} relative bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden border-4 border-white shadow-lg flex items-center justify-center`}>
        <img
          src={headOnly === 'false' ? _avatar.getFullBodyImage('3', '3') : _avatar.getHeadOnlyImage()}
          alt='avatar'
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-b from-sky-200 to-green-200 rounded-lg flex items-center justify-center">
                                <span class="text-gray-500 text-xs">Avatar</span>
                                </div>
                            `;
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-3">
          <AvatarDisplay _avatar={post.author.avatar} size="large" />
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{post.author.name}</h3>
              {post.author.verified && (
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">@{post.author.username} · {post.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1 sm:p-2 hover:bg-gray-50 rounded-full">
          <EllipsisHorizontalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-3 sm:mb-4">
        <p className="text-gray-900 leading-relaxed text-sm sm:text-base">{post.content}</p>
        {post.images.length > 0 && (
          <div className="mt-3 sm:mt-4 rounded-xl overflow-hidden">
            <img
              src={post.images[0]}
              alt="Post image"
              className="w-full h-48 sm:h-64 object-cover"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
        <button
          onClick={onLike}
          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all ${post.liked
            ? 'text-red-500 bg-red-50 hover:bg-red-100'
            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
            }`}
        >
          {post.liked ? (
            <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          <span className="text-xs sm:text-sm font-medium">{post.likes}</span>
        </button>

        <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all">
          <ChatBubbleOvalLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium">{post.comments}</span>
        </button>

        <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-gray-500 hover:text-green-500 hover:bg-green-50 transition-all">
          <ArrowPathRoundedSquareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm font-medium">{post.reposts}</span>
        </button>

        <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
          <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  )
}

export default Home