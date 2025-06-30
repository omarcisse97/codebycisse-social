import { HabboAvatar } from "./Avatar";
import AvatarEditor from "../AvatarEditor";
import {
    CalendarDaysIcon,
    LinkIcon,
    MapPinIcon,
    PencilIcon,
    UserPlusIcon,
    EllipsisHorizontalIcon,
    PhotoIcon
} from '@heroicons/react/24/outline'

class UserProfile {
    constructor() {
        this._info = null;
        this._avatar = null;
        this._myProfile = false;
        this._mockPosts = null;
        this._tabs = null;
    }
    async init(me = true, user_id = '', userInfo = null, avatar = null) {
        try {
            switch (me) {
                case true:
                    if (!userInfo || typeof userInfo !== 'object') {
                        throw new Error('Missing user info for my user');
                    }
                    if (Object.keys(userInfo).length < 1) {
                        throw new Error('Empty user info data');
                    }
                    if (!('username' in userInfo)) {
                        throw new Error('Cannot find username from info data');
                    }
                    if (!('full_name' in userInfo)) {
                        throw new Error('Cannot find full name from info data');
                    }
                    if (!avatar) {
                        throw new Error('Missing avatar data');
                    }
                    if (!avatar._gender || !avatar._figure) {
                        throw new Error('Missing crucial data from avatar data');
                    }
                    this._myProfile = true;
                    this._info = { ...userInfo };
                    console.log('AVATAR ON FILE -> ', avatar);
                    this._avatar = avatar;
                    break;
                case false:
                    try {
                        const userData = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/users/${user_id}`, {
                            method: 'GET',
                            headers: {
                                api_key: import.meta.env.VITE_BACKEND_API_KEY
                            }

                        })
                            .then((response) => {
                                if (response.ok) return response.json();
                                return null;
                            })
                        if (!userData || typeof userData?.data !== 'object' || (userData && typeof userData?.data === 'object' && (userData?.success === false || userData?.error !== ''))) {
                            throw new Error(`Failed to fetch data in server =? ${userData?.error}`);
                        }
                        if (Object.keys(userData?.data).length < 1) {
                            throw new Error(`No user found with id "${user_id}"`);
                        }
                        this._info = userData?.data;
                        const avatarData = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/avatars/${user_id}`, {
                            method: 'GET',
                            headers: {
                                api_key: import.meta.env.VITE_BACKEND_API_KEY
                            }

                        })
                            .then((response) => {
                                if (response.ok) return response.json();
                                return null;
                            });
                        if (!avatarData || typeof avatarData?.data !== 'object' || (avatarData && typeof avatarData?.data === 'object' && (avatarData?.success === false || avatarData?.error !== ''))) {
                            throw new Error(`Failed to fetch data in server =? ${userData?.error}`);
                        }
                        if (Object.keys(avatarData?.data).length < 1) {
                            throw new Error(`No avatar found with id "${user_id}"`);
                        }
                        this._avatar = new HabboAvatar(avatarData.data.gender, avatarData.data.figure);
                        this._myProfile = false;
                    } catch (error) {
                        console.error(error);
                        throw error;
                    }
                    break;
                default: throw new Error('Invalid input -> ', me);
            }
            this._mockPosts = [
                {
                    id: 1,
                    content: 'Just shipped a new feature! The feeling when your code works perfectly on the first try is unmatched 🚀',
                    timestamp: '2h',
                    likes: 24,
                    comments: 5,
                    reposts: 2
                },
                {
                    id: 2,
                    content: 'Working on some exciting React components today. The new hooks are incredibly powerful for state management!',
                    timestamp: '1d',
                    likes: 67,
                    comments: 12,
                    reposts: 8
                },
                {
                    id: 3,
                    content: 'Beautiful day for coding! Sometimes the best solutions come when you step away from the screen for a moment.',
                    timestamp: '3d',
                    likes: 89,
                    comments: 15,
                    reposts: 12
                }
            ];
            this._tabs = [
                { id: 'posts', name: 'Posts', count: this._mockPosts.length },
                { id: 'media', name: 'Media', count: 'In Construction' },
                { id: 'likes', name: 'Likes', count: 'In Construction' }
            ]
        } catch (error) {
            console.error('Failed to initialize user profile. Error(s): ', error);
        }
    }
    renderAvatarEditor(showAvatarEditor, setShowAvatarEditor, handleAvatarSave) {
        try {

            return (
                <AvatarEditor
                    isOpen={showAvatarEditor}
                    onClose={() => setShowAvatarEditor(false)}
                    currentAvatar={this._avatar}
                    onSave={handleAvatarSave}
                />
            );

        } catch (error) {
            console.error('Failed to display avatar editor. Error(s): ', error);
            return null;
        }
    }
    renderAvatarProfilePicture(size = 'large', headOnly = 'false') {
        try {
            const sizeClasses = {
                small: 'w-10 h-10',
                medium: 'w-16 h-16',
                large: 'w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40'
            }
            if (!this._avatar) {
                throw new Error('Avatar is not initialized');
            }
            if (!this._avatar?.getFullBodyImage || !this._avatar?._gender || !this._avatar?._figure) {
                throw new Error('Failed to retrieve avatar image');
            }
            if (!this._info?.username) {
                throw new Error('Failed to retrieve username');
            }
            return (
                <div className={`${sizeClasses[size]} relative bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden border-4 border-white shadow-lg flex items-center justify-center`}>
                    <img
                        src={headOnly === 'false' ? this._avatar.getFullBodyImage('3', '3') : this._avatar.getHeadOnlyImage()}
                        alt={this._info.username}
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
            )
        } catch (error) {
            console.error('Failed to create Avatar Display. Error(s): ', error);
            const sizeClasses = {
                small: 'w-10 h-10',
                medium: 'w-16 h-16',
                large: 'w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40'
            }

            return (
                <div className={`${sizeClasses[size]} relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg overflow-hidden border-4 border-white shadow-lg flex items-center justify-center`}>
                    <div className="text-gray-400">
                        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                </div>
            );
        }
    }
    renderCoverPhoto() {
        try {
            if (!this._avatar || !this._avatar._gender) {
                throw new Error('Missing avatar data');
            }
            return (
                <div className="relative">
                    <div className={`h-48 sm:h-64 ${this._avatar._gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}></div>
                </div>
            )
        } catch (error) {
            console.error('Failed to display cover photo. Error(s): ', error);
            return (
                <div className="relative">
                    <div className="h-48 sm:h-64 bg-gray-500" ></div>
                </div>
            )
        }
    }
    renderProfileInfo(setShowAvatarEditor) {
        try {
            return (
                <div className="pb-6">
                    {/* Avatar and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 lg:-mt-20">
                        <div className="relative">
                            {this.renderAvatarProfilePicture("large")}
                            {this._myProfile === true && (
                                <button
                                    onClick={() => setShowAvatarEditor(true)}
                                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-700 transition-colors"
                                >
                                    <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-6">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                {this._info?.full_name || this._info?.username}
                            </h1>

                        </div>
                        <p className="text-gray-500 text-base sm:text-lg">@{this._info?.username}</p>
                        <p className="mt-3 sm:mt-4 text-gray-900 leading-relaxed text-sm sm:text-base">{this._info?.bio ? this._info?.bio : 'No bio'}</p>

                        {/* Profile Meta */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-gray-500 text-sm">

                            <div className="flex items-center space-x-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{this._info?.location ? this._info?.location : 'No location saved'}</span>
                            </div>


                            <div className="flex items-center space-x-1">
                                <LinkIcon className="h-4 w-4" />
                                {this._info?.website && (
                                    <a href={`https://${this._info?.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {this._info?.website}
                                    </a>
                                )}
                                {!this._info?.website && (
                                    <p className="text-blue-600 hover:underline"> No websites</p>
                                )}
                            </div>
                            {this._info?.created_at && (
                                <div className="flex items-center space-x-1">
                                    <CalendarDaysIcon className="h-4 w-4" />
                                    <span>Joined {this._info?.created_at}</span>
                                </div>
                            )}

                        </div>

                        {/* Follow Stats */}
                        {/* <div className="flex space-x-4 sm:space-x-6 mt-3 sm:mt-4">
                        <button className="hover:underline">
                            <span className="font-bold text-gray-900 text-sm sm:text-base">{this._info?.following?.toLocaleString()}</span>
                            <span className="text-gray-500 ml-1 text-sm">Following</span>
                        </button>
                        <button className="hover:underline">
                            <span className="font-bold text-gray-900 text-sm sm:text-base">{this._info?.followers?.toLocaleString()}</span>
                            <span className="text-gray-500 ml-1 text-sm">Followers</span>
                        </button>
                    </div> */}
                    </div>
                </div>

            );
        } catch (error) {
            console.error('Failed to display user profile data. Error(s): ', error);
            return (
                <div className="mt-4 sm:mt-6">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-400">
                            Unable to load profile
                        </h1>
                    </div>
                    <p className="text-gray-400 text-base sm:text-lg">@unknown</p>
                    <p className="mt-3 sm:mt-4 text-gray-400 leading-relaxed text-sm sm:text-base">
                        Profile information could not be loaded
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-gray-400 text-sm">
                        <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span>Location unavailable</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <LinkIcon className="h-4 w-4" />
                            <span>Website unavailable</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <CalendarDaysIcon className="h-4 w-4" />
                            <span>Join date unavailable</span>
                        </div>
                    </div>
                </div>
            );
        }
    }

    renderTabContent(activeTab = 'posts') {
        try {
            return (
                <div className="mt-4 sm:mt-6">
                    {activeTab === 'posts' && (
                        <div className="space-y-4 sm:space-y-6">
                            {this._mockPosts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                                    <div className="flex space-x-3">
                                        {/* <AvatarDisplay avatar={this._avatar.getHeadOnlyImage()} size="small" /> */}
                                        {this.renderAvatarProfilePicture('small', "true")}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                                    {this._info?.name || this._info?.username}
                                                </span>

                                                <span className="text-gray-500 text-xs sm:text-sm">@{this._info?.username} · {post.timestamp}</span>
                                            </div>
                                            <p className="text-gray-900 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">{post.content}</p>
                                            <div className="flex items-center space-x-4 sm:space-x-6 text-gray-500 text-xs sm:text-sm">
                                                <span>{post.likes} likes</span>
                                                <span>{post.comments} comments</span>
                                                <span>{post.reposts} reposts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="text-center py-8 sm:py-12">

                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Media</h3>
                            <p className="text-gray-500 text-sm sm:text-base">Images and videos that {this._myProfile ? 'you' : this._info?.username} uploaded will appear here.</p>
                        </div>
                    )}

                    {activeTab === 'likes' && (
                        <div className="text-center py-8 sm:py-12">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Liked posts</h3>
                            <p className="text-gray-500 text-sm sm:text-base">Posts that {this._myProfile ? 'you' : this._info?.username} liked will appear here.</p>
                        </div>
                    )}
                </div>
            );
        } catch (error) {
            console.error('Failed to render tab content. Error(s): ', error);
            return (
                <div className="mt-4 sm:mt-6">
                    <div className="text-center py-8 sm:py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-medium text-gray-400 mb-2">
                            Unable to load content
                        </h3>
                        <p className="text-gray-400 text-sm sm:text-base">
                            There was an error loading this section. Please try again later.
                        </p>
                    </div>
                </div>
            );
        }
    }
    RenderProfile({ setShowAvatarEditor, activeTab, showAvatarEditor, handleAvatarSave, setActiveTab }) {
        try {
            return (
                <div className="max-w-4xl mx-auto">
                    <div className="relative px-4 sm:px-6">
                        {this.renderCoverPhoto()}
                        {this.renderProfileInfo(setShowAvatarEditor)}
                        <div className="border-b border-gray-200">
                            <div className="flex space-x-6 sm:space-x-8 overflow-x-auto">
                                {this._tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab.name}
                                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {this.renderTabContent(activeTab)}
                    </div>
                    {this.renderAvatarEditor(showAvatarEditor, setShowAvatarEditor, handleAvatarSave)}
                </div>
            )
        } catch (error) {
            console.error('Failed to render profile. Error(s): ', error);
            return (
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <h2 className="text-xl font-bold text-gray-400 mb-2">Profile Unavailable</h2>
                        <p className="text-gray-400">Unable to load profile data</p>
                    </div>
                </div>
            );
        }
    }

}
export default UserProfile;