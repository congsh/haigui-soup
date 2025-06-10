import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  subscribeToAuthChanges, 
  getCurrentUser,
  getStoredUserName,
  LocalUser,
  updateUserName
} from '../services/authService';

/**
 * 认证上下文接口
 */
interface AuthContextType {
  currentUser: LocalUser;
  userName: string;
  isLoading: boolean;
  updateName: (name: string) => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 认证提供者组件属性
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 认证提供者组件
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<LocalUser>(getCurrentUser());
  const [userName, setUserName] = useState<string>(getStoredUserName());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 监听认证状态变化 - 简化版只是设置初始用户
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // 组件卸载时取消监听
    return () => unsubscribe();
  }, []);

  // 更新用户名
  const updateName = (name: string): void => {
    setUserName(name);
    updateUserName(currentUser.uid, name).catch(console.error);
  };

  // 上下文值
  const value: AuthContextType = {
    currentUser,
    userName,
    isLoading,
    updateName
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 认证上下文钩子
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  
  return context;
}; 