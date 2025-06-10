import { useState, useEffect, useMemo } from 'react';
import { Note } from '../types/room';

/**
 * 笔记管理钩子
 * @param notes 用户所有笔记
 * @returns 格式化的笔记和相关方法
 */
export const useNotes = (notes: Note[] = []) => {
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [showImportantOnly, setShowImportantOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 根据过滤条件更新笔记
  useEffect(() => {
    if (!notes || notes.length === 0) {
      setFilteredNotes([]);
      return;
    }

    let filtered = [...notes];

    // 只显示重要笔记
    if (showImportantOnly) {
      filtered = filtered.filter(note => note.isImportant);
    }

    // 搜索关键词
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.content.toLowerCase().includes(term)
      );
    }

    // 按时间排序（最新的在前面）
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    setFilteredNotes(filtered);
  }, [notes, showImportantOnly, searchTerm]);

  // 获取重要笔记
  const importantNotes = useMemo(() => {
    if (!notes || notes.length === 0) {
      return [];
    }
    return notes.filter(note => note.isImportant);
  }, [notes]);

  // 获取今天的笔记
  const todayNotes = useMemo(() => {
    if (!notes || notes.length === 0) {
      return [];
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    return notes.filter(note => note.timestamp >= todayTimestamp);
  }, [notes]);

  return {
    filteredNotes,
    showImportantOnly,
    setShowImportantOnly,
    searchTerm,
    setSearchTerm,
    importantNotes,
    todayNotes
  };
};