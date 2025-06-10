import { v4 as uuidv4 } from 'uuid';
import { 
  Room, 
  Message, 
  User, 
  UserRole,
  MessageType,
  Note
} from '../types/room';

/**
 * 本地存储键名
 */
const STORAGE_KEYS = {
  ROOMS: 'haigui_rooms',
  ROOMS_BY_CODE: 'haigui_roomsByCode',
  CURRENT_ROOM_ID: 'haigui_currentRoomId',
  CURRENT_USER_ID: 'haigui_currentUserId',
  USER_NAME: 'userName'
};

/**
 * 从本地存储获取房间列表
 */
export const getRooms = (): Record<string, Room> => {
  const rooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
  const parsedRooms = rooms ? JSON.parse(rooms) : {};
  console.log('[localStorageService] getRooms called, found rooms:', parsedRooms);
  return parsedRooms;
};

/**
 * 从本地存储获取邀请码到房间ID的映射
 */
export const getRoomsByCode = (): Record<string, string> => {
  const roomsByCode = localStorage.getItem(STORAGE_KEYS.ROOMS_BY_CODE);
  const parsedRoomsByCode = roomsByCode ? JSON.parse(roomsByCode) : {};
  console.log('[localStorageService] getRoomsByCode called, found roomsByCode:', parsedRoomsByCode);
  return parsedRoomsByCode;
};

/**
 * 保存房间列表到本地存储
 */
export const saveRooms = (rooms: Record<string, Room>): void => {
  console.log('[localStorageService] saveRooms called with rooms:', rooms);
  try {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    console.log('[localStorageService] Rooms saved successfully.');
  } catch (error) {
    console.error('[localStorageService] Error saving rooms:', error);
  }
};

/**
 * 保存邀请码到房间ID的映射到本地存储
 */
export const saveRoomsByCode = (roomsByCode: Record<string, string>): void => {
  console.log('[localStorageService] saveRoomsByCode called with roomsByCode:', roomsByCode);
  try {
    localStorage.setItem(STORAGE_KEYS.ROOMS_BY_CODE, JSON.stringify(roomsByCode));
    console.log('[localStorageService] RoomsByCode saved successfully.');
  } catch (error) {
    console.error('[localStorageService] Error saving roomsByCode:', error);
  }
};

/**
 * 保存当前房间ID
 */
export const saveCurrentRoomId = (roomId: string | null): void => {
  console.log(`[localStorageService] saveCurrentRoomId called with roomId: ${roomId}`);
  if (roomId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROOM_ID, roomId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ROOM_ID);
  }
};

/**
 * 获取当前房间ID
 */
export const getCurrentRoomId = (): string | null => {
  const roomId = localStorage.getItem(STORAGE_KEYS.CURRENT_ROOM_ID);
  console.log(`[localStorageService] getCurrentRoomId called, found roomId: ${roomId}`);
  return roomId;
};

/**
 * 保存当前用户ID
 */
export const saveCurrentUserId = (userId: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
};

/**
 * 获取当前用户ID
 */
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
};

/**
 * 保存用户名
 */
export const saveUserName = (userName: string): void => {
  localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
};

/**
 * 获取用户名
 */
export const getUserName = (): string => {
  const storedName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
  
  if (storedName) {
    return storedName;
  }
  
  // 生成随机用户名
  const randomName = `游客${Math.floor(Math.random() * 10000)}`;
  localStorage.setItem(STORAGE_KEYS.USER_NAME, randomName);
  return randomName;
};

/**
 * 清除当前用户的登录状态
 */
export const clearCurrentUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_NAME);
};

// 添加一些辅助方法，模拟事件监听器管理
type Callback<T> = (data: T) => void;
type Unsubscribe = () => void;

const listeners: Record<string, Callback<any>[]> = {};

/**
 * 添加事件监听器
 */
export const addListener = <T>(eventName: string, callback: Callback<T>): Unsubscribe => {
  if (!listeners[eventName]) {
    listeners[eventName] = [];
  }
  
  listeners[eventName].push(callback);
  
  return () => {
    listeners[eventName] = listeners[eventName].filter(cb => cb !== callback);
  };
};

/**
 * 触发事件
 */
export const triggerEvent = <T>(eventName: string, data: T): void => {
  if (listeners[eventName]) {
    listeners[eventName].forEach(callback => callback(data));
  }
};

// 导出一些辅助函数，方便使用

/**
 * 生成5-8位的随机邀请码
 */
export const generateInviteCode = (): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉容易混淆的字符
  const length = Math.floor(Math.random() * 4) + 5; // 5-8位
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * 获取房间数据
 */
export const getRoomData = (roomId: string): Room | null => {
  const rooms = getRooms();
  return rooms[roomId] || null;
};

/**
 * 更新房间数据
 */
export const updateRoomData = (roomId: string, updater: (room: Room) => Room): void => {
  const rooms = getRooms();
  if (rooms[roomId]) {
    rooms[roomId] = updater(rooms[roomId]);
    saveRooms(rooms);
    triggerEvent(`room_${roomId}`, rooms[roomId]);
  }
}; 