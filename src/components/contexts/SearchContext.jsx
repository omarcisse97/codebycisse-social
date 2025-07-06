import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { HabboAvatar } from '../models/Avatar';

const SearchContext = createContext();
const SearchReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_USERS':
            return { ...state, users: action.payload };
        default: return state;
    }
}
export const SearchProvider = ({ children }) => {
    const [state, dispatch] = useReducer(SearchReducer, {
        users: null,
        loading: false
    });

    useEffect(() => {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_USERS', payload: [] });
        dispatch({ type: 'SET_LOADING', payload: false });
    }, []);

    const fetchUserAvatar = async (user_id) => {
        try {
            if (!user_id) {
                throw new Error('User ID cannot be null');
            }
            const result = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/avatars`, {
                method: 'GET',
                headers: {
                    api_key: import.meta.env.VITE_BACKEND_API_KEY,
                    clause: `user_id=${user_id}`
                },
            })
                .then((response) => {
                    if (response.ok) return response.json();
                    return null;
                })

            if (!result || !result?.data || typeof result?.data !== 'object') {
                const err = result?.error ? result?.error : 'No error message';
                throw new Error(err);
            }
            // eslint-disable-next-line no-unsafe-optional-chaining
            if (!('gender' in result?.data) || !('figure' in result?.data)) {
                throw new Error('User does not have an avatar');
            }
            const avatar = new HabboAvatar(result?.data?.gender);
            avatar.setFigureFromString(result?.data?.figure);
            return avatar;
        } catch (error) {
            console.error('Failed to fetch user avatar. Error(s): ', error);
            return null;
        }
    }
    const searchUsers = async (q = '', limit = '20') => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const result = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/users`, {
                method: 'GET',
                headers: {
                    api_key: import.meta.env.VITE_BACKEND_API_KEY,
                    q: q,
                    limit: limit,
                    search: true,
                    searchFor: ['username', 'full_name']
                },
            })
                .then((response) => {
                    if (response.ok) return response.json();
                    return null;
                });

            if (!result || !result?.data || !Array.isArray(result?.data)) {
                const err = result?.error ? result?.error : 'No error message returned';
                throw new Error(err);
            }
            const users = [];
            console.log('Search raw result -> ', result);
            for (let i = 0; i < result?.data?.length; i++) {
                try {
                    if (
                        !result?.data[i]?.id ||
                        !result?.data[i]?.username ||
                        !result?.data[i]?.full_name
                    ) {
                        throw new Error('Missing id, username, or full name');
                    }
                    const avatar = await fetchUserAvatar(result?.data[i]?.id);
                    users.push({
                        id: result?.data[i]?.id,
                        username: result?.data[i]?.username,
                        full_name: result?.data[i]?.full_name,
                        avatar: avatar
                    });
                } catch (error) {
                    console.log('Failed to obtain valid data for user ', result?.data[i]);
                    console.error('Error(s): ', error);
                    console.log('- Skipping');
                    continue;
                }
            }
            console.log('Search result -> ', users);
            dispatch({ type: 'SET_USERS', payload: users });
            dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
            console.error('Failed to search users. Error(s): ', error);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }

    const value = {
        ...state,
        searchUsers
    };
    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );

}
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useHabboAvatar must be used within the provider');
    }
    return context;
};


