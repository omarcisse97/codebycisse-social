/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { HabboAvatarAssets } from '../models/AvatarAssets';
import { HabboAvatar } from '../models/Avatar';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
const HabboAvatarContext = createContext();

const HabboAvatarReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_AVATAR':
            return { ...state, avatar: action.payload, loading: false };
        case 'SET_AVATAR_ASSETS':
            return { ...state, avatarAssets: action.payload, loading: false };
        default: return state;
    }
}
export const HabboAvatarProvider = ({ children }) => {
    const [state, dispatch] = useReducer(HabboAvatarReducer, {
        avatar: null,
        avatarAssets: null,
        loading: false
    });
    const { user, userInfo } = useAuth();

    useEffect(() => {
        initializeAvatarAssetsSets();
    }, []);
    useEffect(() => {
        if (state.avatarAssets && !state.avatar && userInfo) {
            initializeAvatar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.avatarAssets, userInfo]);

    const fetchAvatarByUserID = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            if (!user?.id || !userInfo.id) {
                throw new Error('Unable to retrieve user id');
            }
            const user_id = userInfo?.id ? userInfo?.id : user?.id;
            const tempAvatar = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/avatars/${user_id}`, {
                headers: {
                    api_key: import.meta.env.VITE_BACKEND_API_KEY
                },
                method: 'GET'
            })
                .then((result) => {
                    if (result.ok) return result.json()
                    return null;
                });
            if (!tempAvatar || (tempAvatar && (tempAvatar?.success === false && tempAvatar.error !== ''))) {
                throw new Error(`Issue occured when fetching the avatar data =? ${tempAvatar ? tempAvatar.error : ''}`);
            }
            dispatch({ type: 'SET_LOADING', payload: false });
            return tempAvatar?.data;
        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            console.error('Failed to fetch avatar -> ', error);
            return null;
        }
    }

    const createAvatarSchema = async (preBuilt = null) => {
        try {
            const existAvatar = await fetchAvatarByUserID();
            if (!existAvatar || (existAvatar && typeof existAvatar !== 'object')) {
                throw new Error('Failed to properly avatar');
            }
            if (Object.keys(existAvatar).length >= 1) {
                throw new Error('User already has an avatar created. Aborting...');
            }
            dispatch({ type: 'SET_LOADING', payload: true });
            const defaultAvatar = preBuilt && preBuilt?._gender && preBuilt?._figure ? preBuilt : new HabboAvatar('M');
            if (!defaultAvatar || !defaultAvatar._figure || !defaultAvatar._gender) {
                throw new Error('Failed to generate default avatar');
            }
            // const defaultAvatarJSON = defaultAvatar.getJSON();
            const newAvatar = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/avatars`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    api_key: import.meta.env.VITE_BACKEND_API_KEY
                },
                body: JSON.stringify({
                    data: {
                        user_id: userInfo?.id || user?.id,
                        figure: defaultAvatar.getFigure(),
                        gender: defaultAvatar._gender
                    }
                })
            })
                .then((response) => {
                    if (response.ok) return response.json();
                    return null;
                });

            if (!newAvatar || (newAvatar && (newAvatar?.success === false || newAvatar?.error !== '' || !newAvatar?.data))) {
                throw new Error(`Failed to create new avatar for user in server -> ${newAvatar?.error ? newAvatar?.error : 'No error message available'} `);
            }
            dispatch({ type: 'SET_LOADING', payload: false });
            return newAvatar?.data;
        } catch (error) {
            console.error('Failed to create avatar for user. Error(s): ', error);
            dispatch({ type: 'SET_LOADING', payload: false });
            return null;
        }
    }
    const initializeAvatar = async () => {

        try {
            let savedAvatarSchema = await fetchAvatarByUserID();
            if (!savedAvatarSchema) {
                throw new Error('Failed to fetch avatar for user');
            }
            if (Object.keys(savedAvatarSchema).length < 1) {
                
                savedAvatarSchema = await createAvatarSchema();
                if (!savedAvatarSchema) {
                    throw new Error('Failed to create new avatar for user');
                }
                toast.success('Initialized new avatar!');
            }
            // let savedAvatarSchema = JSON.parse(localStorage.getItem('avatar')) || null
            dispatch({ type: 'SET_LOADING', payload: true });
            const temp = new HabboAvatar(
                savedAvatarSchema.gender,
            );
            temp.setFigureFromString(savedAvatarSchema?.figure);
            dispatch({ type: 'SET_AVATAR', payload: temp });
            // if (!savedAvatarSchema) {
            //     localStorage.setItem('avatar', temp.getJSON());
            // }
            // // toast.success('Initialized avatar successfully!');

        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            console.error('Failed to initialize avatar. Error(s): ', error);
            // toast.error('Failed to initialize avatar');
        }
    }
    const initializeAvatarAssetsSets = () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const temp = new HabboAvatarAssets();
        temp.init();
        temp.initPalettes();
        dispatch({ type: 'SET_AVATAR_ASSETS', payload: temp });
    }
    const updateAvatarInDB = async (newAvatarClass) => {
        try {
            console.log('New avatar goal -> ', newAvatarClass);
            const existing = await fetchAvatarByUserID();
            if (!existing || (existing && typeof existing !== 'object')) {
                throw new Error('Failed to fetch existing avatar');
            }
            let updateAction = null;
            if (Object.keys(existing).length < 1) {
                updateAction = createAvatarSchema(newAvatarClass);
            } else {
                updateAction = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/avatars/${userInfo?.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        api_key: import.meta.env.VITE_BACKEND_API_KEY
                    },
                    body: JSON.stringify({
                        data: {
                            gender: newAvatarClass._gender,
                            figure: newAvatarClass?.getFigure()
                        }
                    })
                    
                })
                .then((response) => {
                    if(response.ok) return response.json();
                    return null;
                })

                if(!updateAction || (updateAction && (updateAction?.success === false || updateAction?.error !== ''))){
                    throw new Error(`Failed to update avatar in server =? ${updateAction?.error? updateAction?.error: 'No error message available' }`);
                }
                console.log('UPDATE AVATAR RESULT -> ', updateAction);
            }
            dispatch({ type: 'SET_LOADING', payload: true });
            return true;

        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            console.error('Failed to update avatar. Error(s): ', error);
            return false;
        }
    }
    const updateAvatar = async (tmp) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            
            const updateDB = await updateAvatarInDB(tmp);
            if(updateDB === true){
                toast.success('Successfully saved avatar');
            } else {
                toast.error('Failed to save avatar. All updates will be lost');
            }
            dispatch({ type: 'SET_AVATAR', payload: tmp });
            localStorage.setItem('avatar', tmp);
            toast.success('Updated avatar successfully');
        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            console.error('Failed to update avatar. Error(s): ', error);
            toast.error('Failed to update avatar');
        }
    }
    const value = {
        ...state,
        updateAvatar
    };
    return (
        <HabboAvatarContext.Provider value={value}>
            {children}
        </HabboAvatarContext.Provider>
    );

}

export const useHabboAvatar = () => {
    const context = useContext(HabboAvatarContext);
    if (!context) {
        throw new Error('useHabboAvatar must be used within the provider');
    }
    return context;
};