import React, { useState } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Space, 
  Tooltip, 
  Typography,
  message
} from 'antd';
import { 
  SendOutlined, 
  RiseOutlined, 
  FireOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { useRoom } from '../../context/RoomContext';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * 参与者控制面板组件
 */
const ParticipantControls: React.FC = () => {
  const { 
    currentRoom, 
    sendQuestion, 
    sendFlower, 
    sendTrash, 
    raiseHand 
  } = useRoom();
  
  const [questionContent, setQuestionContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 房间是否已结束
  const isRoomEnded = currentRoom?.status === 'ended';

  // 发送问题
  const handleSendQuestion = async () => {
    if (!currentRoom || !questionContent.trim()) return;
    
    // 检查房间是否已结束
    if (isRoomEnded) {
      message.error('房间已结束，无法发送消息');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendQuestion(questionContent.trim());
      setQuestionContent('');
      message.success('问题已发送');
    } catch (error) {
      message.error('发送问题失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 举手
  const handleRaiseHand = async () => {
    if (!currentRoom) return;
    
    // 检查房间是否已结束
    if (isRoomEnded) {
      message.error('房间已结束，无法举手');
      return;
    }
    
    // 获取当前用户
    const currentUserId = currentRoom.users.find(
      user => user.id === currentRoom.users.find(u => u.id === user.id)?.id
    )?.id;
    
    if (!currentUserId) return;
    
    // 获取当前举手状态
    const currentUser = currentRoom.users.find(user => user.id === currentUserId);
    const isCurrentlyRaising = currentUser?.isRaisingHand || false;
    
    setIsLoading(true);
    try {
      await raiseHand(!isCurrentlyRaising);
      message.success(isCurrentlyRaising ? '已放下手' : '已举手');
    } catch (error) {
      message.error('举手操作失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送鲜花
  const handleSendFlower = async () => {
    if (!currentRoom) return;
    
    // 检查房间是否已结束
    if (isRoomEnded) {
      message.error('房间已结束，无法发送鲜花');
      return;
    }
    
    // 检查房间规则是否允许发送鲜花
    if (!currentRoom.rules.allowFlowersAndTrash) {
      message.error('当前房间不允许丢鲜花');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendFlower();
      message.success('已丢出鲜花');
    } catch (error) {
      message.error('发送鲜花失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 发送垃圾
  const handleSendTrash = async () => {
    if (!currentRoom) return;
    
    // 检查房间是否已结束
    if (isRoomEnded) {
      message.error('房间已结束，无法发送垃圾');
      return;
    }
    
    // 检查房间规则是否允许发送垃圾
    if (!currentRoom.rules.allowFlowersAndTrash) {
      message.error('当前房间不允许丢垃圾');
      return;
    }
    
    setIsLoading(true);
    try {
      await sendTrash();
      message.success('已丢出垃圾');
    } catch (error) {
      message.error('发送垃圾失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前用户的举手状态
  const isCurrentUserRaisingHand = () => {
    if (!currentRoom) return false;
    
    const currentUserId = currentRoom.users.find(
      user => user.id === currentRoom.users.find(u => u.id === user.id)?.id
    )?.id;
    
    if (!currentUserId) return false;
    
    const currentUser = currentRoom.users.find(user => user.id === currentUserId);
    return currentUser?.isRaisingHand || false;
  };

  return (
    <Card title="发送问题" style={{ marginBottom: '20px' }}>
      {isRoomEnded ? (
        <Text type="warning">房间已结束，无法发送新消息</Text>
      ) : (
        <>
          <TextArea
            placeholder="输入你想问的问题"
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
            rows={3}
            style={{ marginBottom: '10px' }}
            disabled={isRoomEnded}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              {currentRoom?.rules.requireHandRaise && (
                <Tooltip title={isCurrentUserRaisingHand() ? '放下手' : '举手'}>
                  <Button
                    type={isCurrentUserRaisingHand() ? 'primary' : 'default'}
                    icon={<RiseOutlined />}
                    onClick={handleRaiseHand}
                    loading={isLoading}
                  >
                    {isCurrentUserRaisingHand() ? '放下手' : '举手'}
                  </Button>
                </Tooltip>
              )}
              
              {currentRoom?.rules.allowFlowersAndTrash && (
                <>
                  <Tooltip title="丢鲜花">
                    <Button
                      icon={<FireOutlined />}
                      onClick={handleSendFlower}
                      loading={isLoading}
                    >
                      鲜花
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="丢垃圾">
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={handleSendTrash}
                      loading={isLoading}
                    >
                      垃圾
                    </Button>
                  </Tooltip>
                </>
              )}
            </Space>
            
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendQuestion}
              disabled={!questionContent.trim() || isRoomEnded}
              loading={isLoading}
            >
              发送
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ParticipantControls; 