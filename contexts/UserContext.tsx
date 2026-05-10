import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { User } from '@/types';

const USER_STORAGE_KEY = '@xjo_user';

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (name: string, nickname: string, dateOfBirth: Date) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      nickname,
      dateOfBirth,
      isVerified: true,
    };
    
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error('Failed to save user:', error);
      throw error;
    }
  };

  const updateUserName = async (name: string) => {
    if (!user) return;
    
    const updatedUser: User = {
      ...user,
      name,
    };
    
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev);
  };

  return {
    user,
    isLoading,
    registerUser,
    updateUserName,
    logout,
    isRegistered: !!user,
    isBalanceVisible,
    toggleBalanceVisibility,
  };
});
