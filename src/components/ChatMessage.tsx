import React from 'react';
import { Card, Typography, Space, Tag, Tooltip } from 'antd';
import { 
  QuestionCircleOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionOutlined,
  RobotOutlined,
  FireOutlined,
  DeleteOutlined,
  UserOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { Message, MessageType } from '../types/room';

const { Text } = Typography;

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onReply?: (messageId: string) => void;
  replyToMessage?: Message | null;
}

/**
 * 聊天消息组件
 */
const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isCurrentUser, 
  onReply,
  replyToMessage
}) => {
  // 获取消息图标
  const getMessageIcon = () => {
    switch (message.type) {
      case MessageType.QUESTION:
        return <QuestionCircleOutlined style={{ color: '#1890ff' }} />;
      case MessageType.ANSWER:
        if (message.content === '是') {
          return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        } else if (message.content === '否') {
          return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
        } else {
          return <QuestionOutlined style={{ color: '#faad14' }} />;
        }
      case MessageType.INFO:
        return <InfoCircleOutlined style={{ color: '#722ed1' }} />;
      case MessageType.SYSTEM:
        return <RobotOutlined style={{ color: '#13c2c2' }} />;
      case MessageType.FLOWER:
        return <FireOutlined style={{ color: '#eb2f96' }} />;
      case MessageType.TRASH:
        return <DeleteOutlined style={{ color: '#8c8c8c' }} />;
      case MessageType.HAND_RAISE:
        return <RiseOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <UserOutlined />;
    }
  };

  // 获取消息标签
  const getMessageTag = () => {
    switch (message.type) {
      case MessageType.QUESTION:
        return <Tag color="blue">提问</Tag>;
      case MessageType.ANSWER:
        if (message.content === '是') {
          return <Tag color="green">是</Tag>;
        } else if (message.content === '否') {
          return <Tag color="red">否</Tag>;
        } else {
          return <Tag color="orange">不确定</Tag>;
        }
      case MessageType.INFO:
        return <Tag color="purple">情报</Tag>;
      case MessageType.SYSTEM:
        return <Tag color="cyan">系统</Tag>;
      case MessageType.FLOWER:
        return <Tag color="magenta">鲜花</Tag>;
      case MessageType.TRASH:
        return <Tag color="gray">垃圾</Tag>;
      case MessageType.HAND_RAISE:
        return <Tag color="orange">举手</Tag>;
      default:
        return null;
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        marginBottom: '10px'
      }}
    >
      <Card
        size="small"
        style={{ 
          maxWidth: '80%', 
          background: isCurrentUser ? '#e6f7ff' : '#fff',
          borderColor: isCurrentUser ? '#91d5ff' : '#d9d9d9'
        }}
      >
        {/* 如果是回复消息，显示被回复的内容 */}
        {replyToMessage && (
          <div 
            style={{ 
              borderLeft: '2px solid #d9d9d9',
              paddingLeft: '8px',
              marginBottom: '8px',
              color: '#8c8c8c',
              fontSize: '12px'
            }}
          >
            <Text type="secondary">{replyToMessage.senderName}: {replyToMessage.content}</Text>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ marginRight: '8px' }}>
            {getMessageIcon()}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <Space>
                <Text strong>{message.senderName}</Text>
                {getMessageTag()}
              </Space>
              <Tooltip title={new Date(message.timestamp).toLocaleString()}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatTime(message.timestamp)}
                </Text>
              </Tooltip>
            </div>

            <div>
              <Text>{message.content}</Text>
            </div>

            {onReply && message.type === MessageType.QUESTION && (
              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: '12px', 
                    cursor: 'pointer' 
                  }}
                  onClick={() => onReply(message.id)}
                >
                  回复
                </Text>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatMessage; 