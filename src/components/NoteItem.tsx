import React, { useState } from 'react';
import { Card, Typography, Space, Input, Button, Tooltip } from 'antd';
import { StarOutlined, StarFilled, EditOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { Note } from '../types/room';

const { Text } = Typography;
const { TextArea } = Input;

interface NoteItemProps {
  note: Note;
  onUpdate: (noteId: string, content: string, isImportant: boolean) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
}

/**
 * 笔记项组件
 */
const NoteItem: React.FC<NoteItemProps> = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [isImportant, setIsImportant] = useState(note.isImportant);
  const [isLoading, setIsLoading] = useState(false);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // 处理保存编辑
  const handleSave = async () => {
    if (editContent.trim() === '') {
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(note.id, editContent, isImportant);
      setIsEditing(false);
    } catch (error) {
      console.error('更新笔记失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理删除笔记
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(note.id);
    } catch (error) {
      console.error('删除笔记失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理切换重要性
  const handleToggleImportant = async () => {
    setIsLoading(true);
    try {
      await onUpdate(note.id, note.content, !isImportant);
      setIsImportant(!isImportant);
    } catch (error) {
      console.error('更新笔记失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      size="small"
      style={{ 
        marginBottom: '10px',
        borderColor: isImportant ? '#faad14' : undefined,
        background: isImportant ? '#fffbe6' : undefined
      }}
      actions={[
        <Tooltip title={isImportant ? '取消标记重要' : '标记为重要'}>
          {isImportant ? (
            <StarFilled 
              key="important" 
              style={{ color: '#faad14' }} 
              onClick={handleToggleImportant}
            />
          ) : (
            <StarOutlined 
              key="important"
              onClick={handleToggleImportant}
            />
          )}
        </Tooltip>,
        <Tooltip title="编辑笔记">
          <EditOutlined 
            key="edit" 
            onClick={() => {
              setEditContent(note.content);
              setIsEditing(true);
            }}
          />
        </Tooltip>,
        <Tooltip title="删除笔记">
          <DeleteOutlined 
            key="delete" 
            onClick={handleDelete}
          />
        </Tooltip>
      ]}
    >
      <div>
        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <Tooltip title={formatTime(note.timestamp)}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(note.timestamp).toLocaleDateString()}
            </Text>
          </Tooltip>
          {isImportant && (
            <Text type="warning">重要</Text>
          )}
        </div>

        {isEditing ? (
          <div>
            <TextArea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoSize={{ minRows: 2, maxRows: 6 }}
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Space>
                <Button
                  size="small"
                  onClick={() => setIsEditing(false)}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={isLoading}
                >
                  保存
                </Button>
              </Space>
            </div>
          </div>
        ) : (
          <Text>{note.content}</Text>
        )}
      </div>
    </Card>
  );
};

export default NoteItem; 