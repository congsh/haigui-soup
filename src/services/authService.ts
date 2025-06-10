import { v4 as uuidv4 } from 'uuid';
import { 
  saveUserName, 
  getUserName, 
  saveCurrentUserId, 
  getCurrentUserId,
  clearCurrentUser,
  addListener,
  triggerEvent
} from './localStorageService';

/**
 * 本地用户接口 - 模拟 Firebase 用户
 */
export interface LocalUser {
  uid: string;
  isAnonymous: boolean;
}

/**
 * 用户配置文件接口
 */
interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
}

// 事件名称
const AUTH_CHANGE_EVENT = 'auth_change';

// 创建和保存默认用户
let currentUser: LocalUser | null = null;

// 标记是否已初始化
let isInitialized = false;

/**
 * 初始化认证系统 - 确保只运行一次
 */
const initAuth = (): LocalUser => {
  if (isInitialized && currentUser) {
    return currentUser;
  }
  
  isInitialized = true;
  
  // 从本地存储中获取用户ID，如果没有则创建新的
  const userId = getCurrentUserId() || uuidv4();
  
  // 创建用户对象
  currentUser = {
    uid: userId,
    isAnonymous: true
  };
  
  // 保存用户ID
  saveCurrentUserId(userId);
  
  return currentUser;
};

// 初始用户 - 确保总是有一个可用的用户实例
const defaultUser = initAuth();

/**
 * 获取当前用户 - 确保总是返回一个有效用户
 */
export const getCurrentUser = (): LocalUser => {
  return currentUser || defaultUser;
};

/**
 * 更新用户信息（简化版登录）
 * @param userName 用户名
 * @returns 用户ID和名称
 */
export const signInAnonymousUser = async (userName: string): Promise<{ userId: string, userName: string }> => {
  try {
    // 确保有用户实例
    const user = getCurrentUser();
    
    // 存储用户名
    saveUserName(userName);
    
    return { userId: user.uid, userName };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
};

/**
 * 退出登录 - 在这个简化版中，只是重置用户名
 */
export const signOut = async (): Promise<void> => {
  try {
    // 不改变用户ID，只更新用户名为随机值
    const randomName = `游客${Math.floor(Math.random() * 10000)}`;
    saveUserName(randomName);
  } catch (error) {
    console.error('退出登录失败:', error);
    throw error;
  }
};

/**
 * 获取当前用户配置文件
 * @returns 用户配置文件
 */
export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  const user = getCurrentUser();
  
  return {
    id: user.uid,
    name: getUserName(),
    createdAt: Date.now()
  };
};

/**
 * 更新用户名
 * @param userId 用户ID
 * @param newName 新的用户名
 */
export const updateUserName = async (userId: string, newName: string): Promise<void> => {
  try {
    saveUserName(newName);
  } catch (error) {
    console.error('更新用户名失败:', error);
    throw error;
  }
};

/**
 * 监听认证状态变化
 * @param callback 回调函数，接收当前用户
 * @returns 取消监听的函数
 */
export const subscribeToAuthChanges = (
  callback: (user: LocalUser) => void
): () => void => {
  // 立即回调一次当前用户
  setTimeout(() => {
    callback(getCurrentUser());
  }, 0);
  
  // 这个简化版不需要真正的监听，只需返回一个空函数
  return () => {};
};

/**
 * 获取存储的用户名或生成随机用户名
 * @returns 用户名
 */
export const getStoredUserName = (): string => {
  return getUserName();
}; 