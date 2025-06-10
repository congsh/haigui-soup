import { v4 as uuidv4 } from 'uuid';
import { 
  Room, 
  RoomRules, 
  User, 
  Message, 
  UserRole, 
  MessageType, 
  Note 
} from '../types/room';
import {
  getRooms,
  saveRooms,
  getRoomsByCode,
  saveRoomsByCode,
  generateInviteCode,
  getRoomData,
  updateRoomData,
  addListener,
  triggerEvent
} from './localStorageService';

// 存储订阅房间ID，防止重复订阅
const subscribedRooms = new Set<string>();

/**
 * 创建新房间
 * @param hostId 主持人ID
 * @param hostName 主持人名称
 * @param title 房间标题
 * @param description 房间描述
 * @param rules 房间规则
 * @returns 创建的房间信息
 */
export const createRoom = async (
  hostId: string,
  hostName: string,
  title: string,
  description: string,
  rules: RoomRules
): Promise<Room> => {
  // 生成唯一ID和邀请码
  const roomId = uuidv4();
  let inviteCode = generateInviteCode();
  
  // 确保邀请码唯一
  let roomsByCode = getRoomsByCode();
  while (roomsByCode[inviteCode]) {
    inviteCode = generateInviteCode();
  }
  
  // 创建主持人用户
  const host: User = {
    id: hostId,
    name: hostName,
    role: UserRole.HOST
  };
  
  // 创建房间对象
  const newRoom: Room = {
    id: roomId,
    inviteCode,
    hostId,
    title,
    description,
    rules,
    users: [host],
    messages: [],
    createdAt: Date.now(),
    status: 'waiting',
    notes: {}
  };
  
  // 存储到本地存储
  const rooms = getRooms();
  rooms[roomId] = newRoom;
  saveRooms(rooms);
  
  // 保存邀请码到房间ID的映射
  roomsByCode[inviteCode] = roomId;
  saveRoomsByCode(roomsByCode);
  
  return newRoom;
};

/**
 * 通过邀请码加入房间
 * @param inviteCode 邀请码
 * @param userId 用户ID
 * @param userName 用户名称
 * @returns 加入的房间信息
 */
export const joinRoomByCode = async (
  inviteCode: string,
  userId: string,
  userName: string
): Promise<Room | null> => {
  try {
    // 查询房间
    const roomsByCode = getRoomsByCode();
    const roomId = roomsByCode[inviteCode];
    
    if (!roomId) {
      return null;
    }
    
    const rooms = getRooms();
    const roomData = rooms[roomId];
    
    if (!roomData) {
      return null;
    }
    
    // 检查用户是否已在房间
    if (roomData.users.some(user => user.id === userId)) {
      return roomData;
    }
    
    // 创建新用户
    const newUser: User = {
      id: userId,
      name: userName,
      role: UserRole.PARTICIPANT
    };
    
    // 添加用户到房间
    roomData.users.push(newUser);
    
    // 添加系统消息
    const systemMessage: Message = {
      id: uuidv4(),
      type: MessageType.SYSTEM,
      content: `${userName} 加入了房间`,
      senderId: 'system',
      senderName: '系统',
      timestamp: Date.now()
    };
    
    roomData.messages.push(systemMessage);
    
    // 保存更新后的房间
    rooms[roomId] = roomData;
    saveRooms(rooms);
    
    // 触发房间更新事件
    triggerEvent(`room_${roomId}`, roomData);
    
    return roomData;
  } catch (error) {
    console.error('加入房间失败:', error);
    return null;
  }
};

/**
 * 发送消息
 * @param roomId 房间ID
 * @param message 消息对象
 */
export const sendMessage = async (roomId: string, message: Message): Promise<void> => {
  try {
    updateRoomData(roomId, (room) => {
      return {
        ...room,
        messages: [...room.messages, message]
      };
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    throw error;
  }
};

/**
 * 更新房间状态
 * @param roomId 房间ID
 * @param status 新状态
 */
export const updateRoomStatus = async (roomId: string, status: 'waiting' | 'active' | 'ended'): Promise<void> => {
  try {
    updateRoomData(roomId, (room) => {
      return {
        ...room,
        status
      };
    });
  } catch (error) {
    console.error('更新房间状态失败:', error);
    throw error;
  }
};

/**
 * 添加或更新笔记
 * @param roomId 房间ID
 * @param userId 用户ID
 * @param note 笔记内容
 */
export const saveNote = async (roomId: string, userId: string, note: Note): Promise<void> => {
  try {
    updateRoomData(roomId, (room) => {
      const notes = { ...room.notes };
      
      if (!notes[userId]) {
        notes[userId] = {};
      }
      
      notes[userId][note.id] = note;
      
      return {
        ...room,
        notes
      };
    });
  } catch (error) {
    console.error('保存笔记失败:', error);
    throw error;
  }
};

/**
 * 举手/放下手
 * @param roomId 房间ID
 * @param userId 用户ID
 * @param isRaising 是否举手
 */
export const toggleHandRaise = async (roomId: string, userId: string, isRaising: boolean): Promise<void> => {
  try {
    updateRoomData(roomId, (room) => {
      const updatedUsers = room.users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            isRaisingHand: isRaising
          };
        }
        return user;
      });
      
      // 如果举手，发送举手消息
      let updatedMessages = [...room.messages];
      if (isRaising) {
        const user = room.users.find(u => u.id === userId);
        
        if (user) {
          const handRaiseMessage: Message = {
            id: uuidv4(),
            type: MessageType.HAND_RAISE,
            content: `${user.name} 举手请求回答`,
            senderId: userId,
            senderName: user.name,
            timestamp: Date.now()
          };
          
          updatedMessages.push(handRaiseMessage);
        }
      }
      
      return {
        ...room,
        users: updatedUsers,
        messages: updatedMessages
      };
    });
  } catch (error) {
    console.error('更新举手状态失败:', error);
    throw error;
  }
};

/**
 * 监听房间数据变化
 * @param roomId 房间ID
 * @param callback 回调函数，接收最新的房间数据
 * @returns 取消监听的函数
 */
export const subscribeToRoom = (roomId: string, callback: (room: Room) => void): () => void => {
  // 如果已经订阅过这个房间，先取消之前的监听
  if (subscribedRooms.has(roomId)) {
    // 只返回一个取消函数，但不立即触发回调
    return () => {
      subscribedRooms.delete(roomId);
    };
  }
  
  // 添加到已订阅列表
  subscribedRooms.add(roomId);
  
  // 立即回调一次
  const room = getRoomData(roomId);
  if (room) {
    // 使用setTimeout避免同步调用可能导致的问题
    setTimeout(() => {
      if (subscribedRooms.has(roomId)) {
        callback(room);
      }
    }, 0);
  }
  
  // 添加监听器
  const unsubscribe = addListener<Room>(`room_${roomId}`, (updatedRoom) => {
    // 确保仍然订阅此房间
    if (subscribedRooms.has(roomId)) {
      callback(updatedRoom);
    }
  });
  
  // 返回取消订阅函数
  return () => {
    subscribedRooms.delete(roomId);
    unsubscribe();
  };
}; 