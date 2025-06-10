/**
 * 房间规则配置接口
 */
export interface RoomRules {
  isRedSoup: boolean;         // 是否为红汤（游戏类型）
  scoringMethod: 'host' | 'everyone' | 'none';  // 打分者（主持人/所有人/不打分）
  requireHandRaise: boolean;  // 是否需要举手才能回答
  allowFlowersAndTrash: boolean; // 是否可以丢鲜花和垃圾
}

/**
 * 消息类型枚举
 */
export enum MessageType {
  QUESTION = 'question',    // 提问
  ANSWER = 'answer',       // 回答（是/否/不确定）
  INFO = 'info',           // 情报
  SYSTEM = 'system',       // 系统消息
  FLOWER = 'flower',       // 鲜花
  TRASH = 'trash',         // 垃圾
  HAND_RAISE = 'handRaise' // 举手
}

/**
 * 消息接口
 */
export interface Message {
  id: string;
  type: MessageType;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  replyToId?: string; // 可选，回复某条消息的ID
}

/**
 * 参与者角色枚举
 */
export enum UserRole {
  HOST = 'host',
  PARTICIPANT = 'participant'
}

/**
 * 用户接口
 */
export interface User {
  id: string;
  name: string;
  role: UserRole;
  isRaisingHand?: boolean;
}

/**
 * 用户笔记接口
 */
export interface Note {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  isImportant: boolean;
}

/**
 * 房间笔记接口
 */
export interface RoomNotes {
  [userId: string]: {
    [noteId: string]: Note;
  };
}

/**
 * 房间接口
 */
export interface Room {
  id: string;
  inviteCode: string;
  hostId: string;
  title: string;
  description?: string;
  rules: RoomRules;
  users: User[];
  messages: Message[];
  notes?: RoomNotes; // 用户笔记集合
  createdAt: number;
  status: 'waiting' | 'active' | 'ended';
} 