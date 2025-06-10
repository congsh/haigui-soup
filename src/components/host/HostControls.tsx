import React, { useState } from 'react';
import { Card, Button, Input, Space, Typography, Modal, Divider, message } from 'antd';
import {
  SendOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { useRoom } from '../../context/RoomContext';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface HostControlsProps {
  replyToId?: string;
  clearReplyTo?: () => void;
  replyToContent?: string;
}

/**
 * 主持人控制面板组件
 */
const HostControls: React.FC<HostControlsProps> = ({ 
  replyToId, 
  clearReplyTo,
  replyToContent
}) => {
  const { 
    currentRoom, 
    sendAnswer, 
    sendInfo, 
    endRoom, 
    restartRoom 
  } = useRoom();
  
  const [infoContent, setInfoContent] = useState('');
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isEndModalVisible, setIsEndModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 发送回答
  const handleSendAnswer = async (answer: 'yes' | 'no' | 'uncertain') => {
    if (!currentRoom) return;
    
    setIsLoading(true);
    try {
      await sendAnswer(answer, replyToId);
      
      // 如果是回复，清除回复状态
      if (clearReplyTo && replyToId) {
        clearReplyTo();
      }
      
      message.success('回答已发送');
    } catch (error) {
      message.error('发送回答失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送情报
  const handleSendInfo = async () => {
    if (!currentRoom || !infoContent.trim()) return;
    
    setIsLoading(true);
    try {
      await sendInfo(infoContent.trim());
      setInfoContent('');
      setIsInfoModalVisible(false);
      message.success('情报已发送');
    } catch (error) {
      message.error('发送情报失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 结束/重新开始房间
  const handleRoomStatusChange = async (action: 'end' | 'restart') => {
    if (!currentRoom) return;
    
    setIsLoading(true);
    try {
      if (action === 'end') {
        await endRoom();
        setIsEndModalVisible(false);
        message.success('房间已结束');
      } else {
        await restartRoom();
        message.success('房间已重新开始');
      }
    } catch (error) {
      message.error(action === 'end' ? '结束房间失败' : '重新开始房间失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card title="主持人控制面板" style={{ marginBottom: '20px' }}>
        {replyToId && replyToContent && (
          <div 
            style={{ 
              borderLeft: '3px solid #1890ff', 
              paddingLeft: '10px',
              marginBottom: '10px',
              background: '#f0f7ff',
              padding: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>正在回复问题:</Text>
              <Button 
                type="link" 
                size="small" 
                onClick={clearReplyTo}
              >
                取消回复
              </Button>
            </div>
            <Text>{replyToContent}</Text>
          </div>
        )}

        <div>
          <Title level={5}>回答问题</Title>
          <Space style={{ marginBottom: '16px' }}>
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={() => handleSendAnswer('yes')}
              loading={isLoading}
            >
              是
            </Button>
            <Button 
              danger 
              icon={<CloseCircleOutlined />} 
              onClick={() => handleSendAnswer('no')}
              loading={isLoading}
            >
              否
            </Button>
            <Button 
              icon={<QuestionOutlined />} 
              onClick={() => handleSendAnswer('uncertain')}
              loading={isLoading}
            >
              不确定
            </Button>
          </Space>

          <Divider />

          <Title level={5}>房间控制</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<InfoCircleOutlined />}
              onClick={() => setIsInfoModalVisible(true)}
            >
              发布情报
            </Button>
            
            {currentRoom?.status === 'ended' ? (
              <Button 
                type="default" 
                icon={<PlayCircleOutlined />}
                onClick={() => handleRoomStatusChange('restart')}
                loading={isLoading}
              >
                重新开始
              </Button>
            ) : (
              <Button 
                danger 
                icon={<PauseCircleOutlined />}
                onClick={() => setIsEndModalVisible(true)}
              >
                结束房间
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* 发布情报模态框 */}
      <Modal
        title="发布情报"
        open={isInfoModalVisible}
        onOk={handleSendInfo}
        onCancel={() => setIsInfoModalVisible(false)}
        okText="发送"
        cancelText="取消"
        confirmLoading={isLoading}
      >
        <TextArea
          placeholder="输入情报内容"
          value={infoContent}
          onChange={(e) => setInfoContent(e.target.value)}
          rows={4}
          showCount
          maxLength={500}
        />
        <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
          情报将会发送给所有参与者，可以用于提供线索或推进游戏。
        </Text>
      </Modal>

      {/* 结束房间确认模态框 */}
      <Modal
        title="结束房间"
        open={isEndModalVisible}
        onOk={() => handleRoomStatusChange('end')}
        onCancel={() => setIsEndModalVisible(false)}
        okText="确认结束"
        cancelText="取消"
        confirmLoading={isLoading}
      >
        <p>确定要结束当前房间吗？</p>
        <p>结束后，参与者仍可以查看聊天记录，但不能再发送新消息。</p>
        <p>你可以随时重新开始房间。</p>
      </Modal>
    </div>
  );
};

export default HostControls; 