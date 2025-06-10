import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Room, 
  User, 
  Message, 
  UserRole, 
  MessageType, 
  Note 
} from '../types/room';
import { 
  createRoom, 
  joinRoomByCode, 
  sendMessage, 
  updateRoomStatus, 
  saveNote,
  toggleHandRaise,
  subscribeToRoom
} from '../services/roomService';
import { useAuth } from './AuthContext';
import { saveCurrentRoomId } from '../services/localStorageService';

/**
 * 房间上下文接口
 */
interface RoomContextType {
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;
  userNotes: Note[];
  createNewRoom: (title: string, description: string, rules: any) => Promise<Room>;
  joinRoom: (inviteCode: string) => Promise<Room | null>;
  leaveRoom: () => void;
  sendQuestion: (content: string, replyToId?: string) => Promise<void>;
  sendAnswer: (content: 'yes' | 'no' | 'uncertain', replyToId?: string) => Promise<void>;
  sendInfo: (content: string) => Promise<void>;
  sendFlower: () => Promise<void>;
  sendTrash: () => Promise<void>;
  raiseHand: (isRaising: boolean) => Promise<void>;
  addNote: (content: string, isImportant: boolean) => Promise<void>;
  updateNote: (noteId: string, content: string, isImportant: boolean) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  endRoom: () => Promise<void>;
  restartRoom: () => Promise<void>;
}

// 创建房间上下文
const RoomContext = createContext<RoomContextType | undefined>(undefined);

/**
 * 房间提供者组件属性
 */
interface RoomProviderProps {
  children: ReactNode;
}

/**
 * 房间提供者组件
 */
export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const { currentUser, userName } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [unsubscribeRoom, setUnsubscribeRoom] = useState<(() => void) | null>(null);
  const subscribedRoomIdRef = useRef<string | null>(null);

  // 清理函数，在组件卸载时取消监听
  useEffect(() => {
    return () => {
      if (unsubscribeRoom) {
        unsubscribeRoom();
      }
    };
  }, [unsubscribeRoom]);

  /**
   * 订阅当前房间的更新
   */
  const subscribeToCurrentRoom = useCallback((roomId: string): void => {
    console.log(`[RoomContext] subscribeToCurrentRoom called for room: ${roomId}`);
    // 如果已经订阅了相同的房间，则不执行任何操作
    if (subscribedRoomIdRef.current === roomId) {
      console.log(`[RoomContext] Already subscribed to room ${roomId}. Skipping.`);
      return;
    }
    
    // 先取消之前的订阅
    if (unsubscribeRoom) {
      console.log(`[RoomContext] Unsubscribing from previous room: ${subscribedRoomIdRef.current}`);
      unsubscribeRoom();
      setUnsubscribeRoom(null);
    }
    
    // 更新当前订阅的房间ID
    subscribedRoomIdRef.current = roomId;
    
    // 创建新的订阅
    console.log(`[RoomContext] Creating new subscription for room: ${roomId}`);
    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      // 确认订阅ID没有变更
      if (subscribedRoomIdRef.current !== roomId) {
        console.log(`[RoomContext] Subscription ID changed. Current: ${subscribedRoomIdRef.current}, Received for: ${roomId}. Ignoring update.`);
        return;
      }
      
      console.log(`[RoomContext] Received update for room ${roomId}:`, updatedRoom);
      setCurrentRoom(updatedRoom);
      
      // 获取用户笔记
      if (currentUser && updatedRoom.notes && updatedRoom.notes[currentUser.uid]) {
        const notesObj = updatedRoom.notes[currentUser.uid];
        const notesList = Object.values(notesObj).filter(note => note.content.trim() !== '') as Note[];
        setUserNotes(notesList);
      }
    });
    
    setUnsubscribeRoom(() => unsubscribe);
  }, [unsubscribeRoom, currentUser]);

  /**
   * 创建新房间
   */
  const createNewRoom = useCallback(async (
    title: string, 
    description: string, 
    rules: any
  ): Promise<Room> => {
    if (!currentUser) {
      throw new Error('用户信息不可用，请刷新页面重试');
    }

    setIsLoading(true);
    setError(null);

    try {
      const newRoom = await createRoom(
        currentUser.uid,
        userName,
        title,
        description,
        rules
      );

      setCurrentRoom(newRoom);
      
      // 保存当前房间ID到本地存储
      saveCurrentRoomId(newRoom.id);
      
      // 订阅房间更新
      subscribeToCurrentRoom(newRoom.id);
      
      return newRoom;
    } catch (err: any) {
      setError(err.message || '创建房间失败');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, userName]);

  /**
   * 加入房间
   */
  const joinRoom = useCallback(async (inviteCode: string): Promise<Room | null> => {
    console.log(`[RoomContext] joinRoom called with inviteCode: ${inviteCode}`);
    if (!currentUser) {
      console.error('[RoomContext] User not available');
      throw new Error('用户信息不可用，请刷新页面重试');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[RoomContext] Calling joinRoomByCode from roomService...');
      const room = await joinRoomByCode(
        inviteCode,
        currentUser.uid,
        userName
      );
      console.log('[RoomContext] Got response from roomService.joinRoomByCode:', room);

      if (room) {
        setCurrentRoom(room);
        saveCurrentRoomId(room.id);
        console.log(`[RoomContext] Subscribing to room: ${room.id}`);
        subscribeToCurrentRoom(room.id);
      } else {
        console.warn('[RoomContext] joinRoomByCode returned null');
      }
      
      return room;
    } catch (err: any) {
      console.error('[RoomContext] Error in joinRoom:', err);
      setError(err.message || '加入房间失败');
      throw err;
    } finally {
      console.log('[RoomContext] joinRoom finished.');
      setIsLoading(false);
    }
  }, [currentUser, userName, subscribeToCurrentRoom]);

  /**
   * 离开房间
   */
  const leaveRoom = useCallback((): void => {
    if (unsubscribeRoom) {
      unsubscribeRoom();
      setUnsubscribeRoom(null);
    }
    
    // 清除当前房间ID
    saveCurrentRoomId(null);
    subscribedRoomIdRef.current = null;
    
    setCurrentRoom(null);
    setUserNotes([]);
  }, [unsubscribeRoom]);

  /**
   * 发送问题
   */
  const sendQuestion = useCallback(async (content: string, replyToId?: string): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.QUESTION,
      content,
      senderId: currentUser.uid,
      senderName: userName,
      timestamp: Date.now(),
      replyToId
    };

    try {
      await sendMessage(currentRoom.id, newMessage);
    } catch (err: any) {
      setError(err.message || '发送问题失败');
      throw err;
    }
  }, [currentUser, currentRoom, userName]);

  /**
   * 发送回答（只有主持人可以）
   */
  const sendAnswer = useCallback(async (content: 'yes' | 'no' | 'uncertain', replyToId?: string): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 检查是否为主持人
    if (currentRoom.hostId !== currentUser.uid) {
      throw new Error('只有主持人可以回答');
    }

    let answerContent = '';
    switch (content) {
      case 'yes':
        answerContent = '是';
        break;
      case 'no':
        answerContent = '否';
        break;
      case 'uncertain':
        answerContent = '不确定';
        break;
    }

    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.ANSWER,
      content: answerContent,
      senderId: currentUser.uid,
      senderName: userName,
      timestamp: Date.now(),
      replyToId
    };

    try {
      await sendMessage(currentRoom.id, newMessage);
    } catch (err: any) {
      setError(err.message || '发送回答失败');
      throw err;
    }
  }, [currentUser, currentRoom, userName]);

  /**
   * 发送情报（只有主持人可以）
   */
  const sendInfo = useCallback(async (content: string): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 检查是否为主持人
    if (currentRoom.hostId !== currentUser.uid) {
      throw new Error('只有主持人可以发送情报');
    }

    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.INFO,
      content,
      senderId: currentUser.uid,
      senderName: userName,
      timestamp: Date.now()
    };

    try {
      await sendMessage(currentRoom.id, newMessage);
    } catch (err: any) {
      setError(err.message || '发送情报失败');
      throw err;
    }
  }, [currentUser, currentRoom, userName]);

  /**
   * 发送鲜花
   */
  const sendFlower = useCallback(async (): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 检查房间规则是否允许发送鲜花
    if (!currentRoom.rules.allowFlowersAndTrash) {
      throw new Error('当前房间不允许发送鲜花');
    }

    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.FLOWER,
      content: '🌹',
      senderId: currentUser.uid,
      senderName: userName,
      timestamp: Date.now()
    };

    try {
      await sendMessage(currentRoom.id, newMessage);
    } catch (err: any) {
      setError(err.message || '发送鲜花失败');
      throw err;
    }
  }, [currentUser, currentRoom, userName]);

  /**
   * 发送垃圾
   */
  const sendTrash = useCallback(async (): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 检查房间规则是否允许发送垃圾
    if (!currentRoom.rules.allowFlowersAndTrash) {
      throw new Error('当前房间不允许发送垃圾');
    }

    const newMessage: Message = {
      id: uuidv4(),
      type: MessageType.TRASH,
      content: '🗑️',
      senderId: currentUser.uid,
      senderName: userName,
      timestamp: Date.now()
    };

    try {
      await sendMessage(currentRoom.id, newMessage);
    } catch (err: any) {
      setError(err.message || '发送垃圾失败');
      throw err;
    }
  }, [currentUser, currentRoom, userName]);

  /**
   * 举手/放下手
   */
  const raiseHand = useCallback(async (isRaising: boolean): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 检查房间规则是否要求举手
    if (!currentRoom.rules.requireHandRaise && isRaising) {
      throw new Error('当前房间不需要举手');
    }

    try {
      await toggleHandRaise(currentRoom.id, currentUser.uid, isRaising);
    } catch (err: any) {
      setError(err.message || '举手操作失败');
      throw err;
    }
  }, [currentUser, currentRoom]);

  /**
   * 添加笔记
   */
  const addNote = useCallback(async (content: string, isImportant: boolean): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    const newNote: Note = {
      id: uuidv4(),
      userId: currentUser.uid,
      content,
      timestamp: Date.now(),
      isImportant
    };

    try {
      await saveNote(currentRoom.id, currentUser.uid, newNote);
      
      // 更新本地笔记列表
      setUserNotes(prev => [...prev, newNote]);
    } catch (err: any) {
      setError(err.message || '添加笔记失败');
      throw err;
    }
  }, [currentUser, currentRoom]);

  /**
   * 更新笔记
   */
  const updateNote = useCallback(async (noteId: string, content: string, isImportant: boolean): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 查找笔记
    const noteIndex = userNotes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
      throw new Error('笔记不存在');
    }

    // 更新笔记
    const updatedNote: Note = {
      ...userNotes[noteIndex],
      content,
      isImportant,
      timestamp: Date.now()
    };

    try {
      await saveNote(currentRoom.id, currentUser.uid, updatedNote);
      
      // 更新本地笔记列表
      const newNotes = [...userNotes];
      newNotes[noteIndex] = updatedNote;
      setUserNotes(newNotes);
    } catch (err: any) {
      setError(err.message || '更新笔记失败');
      throw err;
    }
  }, [currentUser, currentRoom, userNotes]);

  /**
   * 删除笔记
   */
  const deleteNote = useCallback(async (noteId: string): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 过滤掉要删除的笔记
    const newNotes = userNotes.filter(note => note.id !== noteId);
    setUserNotes(newNotes);

    // 保存空内容的笔记作为删除操作
    const emptyNote: Note = {
      id: noteId,
      userId: currentUser.uid,
      content: '',
      timestamp: Date.now(),
      isImportant: false
    };

    try {
      await saveNote(currentRoom.id, currentUser.uid, emptyNote);
    } catch (err: any) {
      setError(err.message || '删除笔记失败');
      throw err;
    }
  }, [currentUser, currentRoom, userNotes]);

  /**
   * 结束房间（只有主持人可以）
   */
  const endRoom = useCallback(async (): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 检查是否为主持人
    if (currentRoom.hostId !== currentUser.uid) {
      throw new Error('只有主持人可以结束房间');
    }

    try {
      await updateRoomStatus(currentRoom.id, 'ended');
      
      // 发送系统消息
      const systemMessage: Message = {
        id: uuidv4(),
        type: MessageType.SYSTEM,
        content: '主持人已结束房间',
        senderId: 'system',
        senderName: '系统',
        timestamp: Date.now()
      };
      
      await sendMessage(currentRoom.id, systemMessage);
    } catch (err: any) {
      setError(err.message || '结束房间失败');
      throw err;
    }
  }, [currentUser, currentRoom]);

  /**
   * 重新开始房间（只有主持人可以）
   */
  const restartRoom = useCallback(async (): Promise<void> => {
    if (!currentUser || !currentRoom) {
      throw new Error('用户或房间信息不可用');
    }

    // 检查是否为主持人
    if (currentRoom.hostId !== currentUser.uid) {
      throw new Error('只有主持人可以重新开始房间');
    }

    try {
      await updateRoomStatus(currentRoom.id, 'active');
      
      // 发送系统消息
      const systemMessage: Message = {
        id: uuidv4(),
        type: MessageType.SYSTEM,
        content: '主持人已重新开始房间',
        senderId: 'system',
        senderName: '系统',
        timestamp: Date.now()
      };
      
      await sendMessage(currentRoom.id, systemMessage);
    } catch (err: any) {
      setError(err.message || '重新开始房间失败');
      throw err;
    }
  }, [currentUser, currentRoom]);

  // 上下文值
  const value: RoomContextType = {
    currentRoom,
    isLoading,
    error,
    userNotes,
    createNewRoom,
    joinRoom,
    leaveRoom,
    sendQuestion,
    sendAnswer,
    sendInfo,
    sendFlower,
    sendTrash,
    raiseHand,
    addNote,
    updateNote,
    deleteNote,
    endRoom,
    restartRoom
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};

/**
 * 房间上下文钩子
 */
export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  
  if (context === undefined) {
    throw new Error('useRoom 必须在 RoomProvider 内部使用');
  }
  
  return context;
};