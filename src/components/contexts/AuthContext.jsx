// contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { UpdatePassword } from '@supabase/auth-ui-react';

const AuthContext = createContext();

// Singleton Supabase client to prevent multiple instances
let supabaseInstance = null;
const fetchErrorMsg = (result) => {
  return `Failed to retrieve data from server. Error(s): ${result?.error ? result?.error : 'No error message available'}`;
}
const isFetchValid = (result) => {
  if (!result || (result && (!result?.data || result?.error !== ''))) {
    return { isValid: false, error: fetchErrorMsg(result) };
  }
  return { isValid: true, error: '' };
}

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseInstance;
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        user: action.payload?.user || null,
        isAuthenticated: !!action.payload?.user,
        loading: false
      };

    case 'SET_SUPABASE_CLIENT':
      return { ...state, supabaseClient: action.payload };
    case 'LOGOUT':
      return {
        ...state,
        session: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        userInfo: null
      };
    case 'SET_USER_INFO':
      return { ...state, userInfo: action.payload }
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    supabaseClient: null,
    session: null,
    user: null,
    isAuthenticated: false,
    loading: true,
    userInfo: null
  });

  // Initialize Supabase and auth state
  useEffect(() => {
    let subscription;

    const initSupabase = async () => {
      try {
        const supabase = getSupabaseClient(); // Use singleton
        dispatch({ type: 'SET_SUPABASE_CLIENT', payload: supabase });

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          if (session?.user) {
            const etc = await registerEnhanced(session?.user);
            
            if (etc) {
              
              dispatch({ type: 'SET_USER_INFO', payload: etc });
            }
          }
          dispatch({ type: 'SET_SESSION', payload: session });
        }

        // Listen for auth changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            
            dispatch({ type: 'SET_SESSION', payload: session });

            // Handle different auth events
            switch (event) {
              case 'SIGNED_IN':
                break;
              case 'SIGNED_OUT':
                toast.success('Successfully signed out!');
                break;
              case 'PASSWORD_RECOVERY':
                toast.info('Check your email for password recovery link');
                break;
              case 'USER_UPDATED':
                toast.success('Profile updated successfully!');
                break;
              case 'TOKEN_REFRESHED':
                console.log('Token refreshed automatically');
                break;
            }
          }
        );

        subscription = authSubscription;
        // console.log('Supabase initialized successfully');

      } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        toast.error('Failed to initialize authentication');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initSupabase();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array


  const registerEnhanced = async (data) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const tempUserResult = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/users`, {
        method: 'GET',
        headers: {
          clause: `id=${data?.id}`,
          api_key: import.meta.env.VITE_BACKEND_API_KEY,
        }
      })
        .then((result) => {
          if (result.ok) return result.json();
          return null;
        });
      if (isFetchValid(tempUserResult)?.isValid !== true) {
        throw new Error(isFetchValid(tempUserResult)?.error);
      }
      let tempUser = tempUserResult?.data;
      if (Array.isArray(tempUser)) {
        if (tempUser?.length < 1) {
          const registerResult = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              api_key: import.meta.env.VITE_BACKEND_API_KEY,
              fields: 'id,email,full_name,bio,website,location,phone,birth_date,is_verified,is_private,is_active'
            },

            body: JSON.stringify({
              push: [
                data?.id,
                data?.user_metadata?.email,
                data?.user_metadata?.full_name,
                '',
                '',
                '',
                '',
                null,
                data?.user_metadata?.email_verified,
                false,
                true
              ]
            })
          })
            .then((result) => {
              if (result.ok) return result.json();
              return null;
            });
          if (isFetchValid(registerResult)?.isValid !== true) {
            throw new Error(isFetchValid(tempUserResult)?.error);
          }
          await updateUserActiveInfo(true);
          tempUser = registerResult?.data;
          if(Array.isArray(tempUser)){
            if(tempUser?.length === 1){
              tempUser = tempUser[0];
            } else {
              if(tempUser?.length > 1){
                throw new Error('Server returned too much data');
              }
              tempUser = null;
            }
          }
        } else {
          throw new Error('Server returned way too many data');
        }
      }

      if(!tempUser){
        throw new Error('Failed to register or retrieve user from server');
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return tempUser;


    } catch (error) {
      console.error('An error occured. Review errors: ', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error('Failed to retrieve all of user info');
      return null;
    }
  }
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await state.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return data?.user || null;

    } catch (error) {
      console.error('Login error:', error);

      toast.error(error.message || 'Failed to sign in');
      if (error.message === 'Email not confirmed') {
        localStorage.setItem('verificationEmail', email);
        window.location.href = '/verify-email';
      }
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (email, password, userData = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await state.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        throw error;
      }
      
      if (!data.user?.email_confirmed_at) {
        toast.info('Please check your email to confirm your account');
      }

      return data?.user || null;

    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUserActiveInfo = async (is_active) => {

    const registerResult = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        api_key: import.meta.env.VITE_BACKEND_API_KEY,
        clause: `id=${state.user?.id}`
      },
      body: JSON.stringify({
        update: {
          date: {
            is_active: is_active
          }

        }
      })
    });
    await registerResult.json();
    
    return registerResult && registerResult?.success === true ? true : false;

  }

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }
      const tempUserInfo = { ...state.userInfo };
      const { error } = await state.supabaseClient.auth.signOut();

      if (error) {
        throw error;
      }
      if (tempUserInfo) {
        await updateUserActiveInfo(false);
      }

    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await state.supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUserData = async (obj) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (!state.user || !state.userInfo || !state.user?.id) {
        throw new Error('No user logged in');
      }
      const updateResult = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          api_key: import.meta.env.VITE_BACKEND_API_KEY,
          clause: `id=${state.user?.id}`
        },
        body: JSON.stringify({
          update: {
            data: {
              ...obj
            }
          }
        })
      })
        .then((response) => {
          if (response.ok) return response.json();
          return null;
        })
      console.log('Result update -> ', updateResult);
      if (!updateResult || (updateResult && (updateResult?.success !== true || !updateResult?.data))) {
        throw new Error(`Failed to update user data => ${updateResult?.error ? updateResult?.error : 'No error message retrieved'}`);
      }
      dispatch({ type: 'SET_USER_INFO', payload: updateResult?.data });
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success('Successfully updated user');
      return true;
    } catch (error) {
      console.error('Failed to update user data. Error(s): ', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  }

  const resetPassword = async (email) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      if (!state.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await state.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      toast.success('Password reset email sent!');

    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value = {
    // State
    ...state,
    // Methods
    login,
    register,
    logout,
    signInWithGoogle,
    resetPassword,
    registerEnhanced,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};