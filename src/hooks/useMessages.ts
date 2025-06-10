import { useState, useEffect, useMemo } from 'react';
import { Message, MessageType } from '../types/room';

/**
 * 消息管理钩子
 * @param messages 所有消息
 * @param userId 当前用户ID
 * @returns 格式化的消息和相关方法
 */
export const useMessages = (messages: Message[] = [], userId: string | null = null) => {
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [messageFilter, setMessageFilter] = useState<MessageType | 'all'>('all');

  // 根据过滤条件更新消息
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setFilteredMessages([]);
      return;
    }

    let filtered = [...messages];

    // 按照类型过滤
    if (messageFilter !== 'all') {
      filtered = filtered.filter(msg => msg.type === messageFilter);
    }

    // 按时间排序
    filtered.sort((a, b) => a.timestamp - b.timestamp);

    setFilteredMessages(filtered);
  }, [messages, messageFilter]);

  // 获取用户的问题
  const userQuestions = useMemo(() => {
    if (!messages || messages.length === 0 || !userId) {
      return [];
    }
    return messages.filter(msg => msg.type === MessageType.QUESTION && msg.senderId === userId);
  }, [messages, userId]);

  // 获取是/否/不确定回答的问题
  const yesAnswers = useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }
    // 找出回答为"是"的消息
    const yesMessages = messages.filter(msg => 
      msg.type === MessageType.ANSWER && msg.content === '是'
    );
    
    // 找出这些回答所回复的问题
    return yesMessages.map(answer => {
      if (!answer.replyToId) return null;
      const question = messages.find(msg => msg.id === answer.replyToId);
      return { answer, question };
    }).filter(item => item !== null && item.question);
  }, [messages]);

  const noAnswers = useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }
    const noMessages = messages.filter(msg => 
      msg.type === MessageType.ANSWER && msg.content === '否'
    );
    
    return noMessages.map(answer => {
      if (!answer.replyToId) return null;
      const question = messages.find(msg => msg.id === answer.replyToId);
      return { answer, question };
    }).filter(item => item !== null && item.question);
  }, [messages]);

  const uncertainAnswers = useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }
    const uncertainMessages = messages.filter(msg => 
      msg.type === MessageType.ANSWER && msg.content === '不确定'
    );
    
    return uncertainMessages.map(answer => {
      if (!answer.replyToId) return null;
      const question = messages.find(msg => msg.id === answer.replyToId);
      return { answer, question };
    }).filter(item => item !== null && item.question);
  }, [messages]);

  // 获取情报消息
  const infoMessages = useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }
    return messages.filter(msg => msg.type === MessageType.INFO);
  }, [messages]);

  return {
    filteredMessages,
    messageFilter,
    setMessageFilter,
    userQuestions,
    yesAnswers,
    noAnswers,
    uncertainAnswers,
    infoMessages
  };
}; 