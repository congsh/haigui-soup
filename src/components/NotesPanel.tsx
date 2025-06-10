import React, { useState } from 'react';
import { Card, Input, Button, Typography, Tabs, Space, Divider, Empty, message } from 'antd';
import { PlusOutlined, StarOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { useRoom } from '../context/RoomContext';
import { useNotes } from '../hooks/useNotes';
import NoteItem from './NoteItem';

const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * 笔记管理面板组件
 */
const NotesPanel: React.FC = () => {
  const { currentRoom, userNotes, addNote, updateNote, deleteNote } = useRoom();
  const { 
    filteredNotes, 
    showImportantOnly, 
    setShowImportantOnly, 
    searchTerm, 
    setSearchTerm, 
    importantNotes, 
    todayNotes 
  } = useNotes(userNotes);
  
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // 添加笔记
  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setIsLoading(true);
    try {
      await addNote(newNoteContent.trim(), isImportant);
      setNewNoteContent('');
      setIsImportant(false);
      message.success('笔记已添加');
    } catch (error) {
      message.error('添加笔记失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新笔记
  const handleUpdateNote = async (noteId: string, content: string, isImportant: boolean) => {
    try {
      await updateNote(noteId, content, isImportant);
      message.success('笔记已更新');
    } catch (error) {
      message.error('更新笔记失败');
      console.error(error);
    }
  };

  // 删除笔记
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      message.success('笔记已删除');
    } catch (error) {
      message.error('删除笔记失败');
      console.error(error);
    }
  };

  // 根据活动标签获取笔记列表
  const getNotesByTab = () => {
    switch (activeTab) {
      case 'important':
        return importantNotes;
      case 'today':
        return todayNotes;
      case 'all':
      default:
        return filteredNotes;
    }
  };

  return (
    <Card title="我的笔记" style={{ marginBottom: '20px' }}>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={{ marginBottom: '16px' }}
        items={[
          {
            key: 'all',
            label: (
              <span>
                <HistoryOutlined />
                全部
              </span>
            )
          },
          {
            key: 'important',
            label: (
              <span>
                <StarOutlined />
                重要
              </span>
            )
          },
          {
            key: 'today',
            label: (
              <span>
                <HistoryOutlined />
                今天
              </span>
            )
          }
        ]}
      />

      {activeTab === 'all' && (
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="搜索笔记"
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        </div>
      )}

      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
        {getNotesByTab().length > 0 ? (
          getNotesByTab().map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ))
        ) : (
          <Empty description="暂无笔记" />
        )}
      </div>

      <Divider />

      <div>
        <Title level={5}>添加新笔记</Title>
        <TextArea
          placeholder="输入笔记内容"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={3}
          style={{ marginBottom: '10px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button
              type={isImportant ? 'primary' : 'default'}
              icon={<StarOutlined />}
              onClick={() => setIsImportant(!isImportant)}
            >
              {isImportant ? '标记为重要' : '标记为重要'}
            </Button>
            <Text type="secondary">
              {isImportant ? '此笔记将被标记为重要' : ''}
            </Text>
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNote}
            disabled={!newNoteContent.trim()}
            loading={isLoading}
          >
            添加
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default NotesPanel; 