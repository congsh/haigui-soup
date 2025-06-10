import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Typography, Layout, Card, Form, Divider, message, Alert, Space } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

/**
 * 首页组件
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { userName, updateName } = useAuth();
  const { joinRoom } = useRoom();
  
  const [isChangingName, setIsChangingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | 'info' | 'warning', content: string} | null>(null);

  // 确保用户名已经设置
  useEffect(() => {
    setNewName(userName);
  }, [userName]);

  // 处理用户名更新
  const handleUpdateName = () => {
    if (newName.trim() && newName !== userName) {
      updateName(newName.trim());
      message.success('用户名已更新');
    }
    setIsChangingName(false);
  };

  // 处理创建房间
  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  // 处理加入房间
  const handleJoinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    console.log(`[HomePage] Attempting to join room with code: ${code}`);

    if (!code) {
      message.error('请输入邀请码');
      setStatusMessage({type: 'error', content: '请输入邀请码'});
      return;
    }

    setIsLoading(true);
    setStatusMessage({type: 'info', content: `正在尝试加入房间（邀请码: ${code}）...`});
    
    try {
      console.log('[HomePage] Calling joinRoom from context...');
      const room = await joinRoom(code);
      console.log('[HomePage] Got response from joinRoom context:', room);

      if (room && room.id) {
        message.success('加入房间成功');
        setStatusMessage({type: 'success', content: `成功加入房间: ${room.title}`});
        console.log(`[HomePage] Navigating to /room/${room.id}`);
        setTimeout(() => {
          navigate(`/room/${room.id}`);
        }, 500);
      } else {
        const errorMsg = '无法加入房间，邀请码可能无效或已过期。';
        message.error(errorMsg);
        setStatusMessage({type: 'error', content: errorMsg});
        console.warn('[HomePage] Join room failed. Room is null or has no ID.');
        setIsLoading(false);
      }
    } catch (error: any) {
      const errorMessage = error.message || '加入房间时发生未知错误';
      message.error(errorMessage);
      setStatusMessage({type: 'error', content: errorMessage});
      console.error('[HomePage] Error joining room:', error);
      setIsLoading(false);
    }
  };

  // 重置状态
  const resetStatus = () => {
    setStatusMessage(null);
    setJoinCode('');
    setIsLoading(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>
            海龟汤互动房间
          </Title>
          
          <Card style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={4}>当前用户</Title>
                {isChangingName ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="输入新的用户名"
                      style={{ marginRight: '10px' }}
                    />
                    <Button type="primary" onClick={handleUpdateName}>
                      保存
                    </Button>
                    <Button 
                      style={{ marginLeft: '10px' }} 
                      onClick={() => {
                        setIsChangingName(false);
                        setNewName(userName);
                      }}
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Title level={3} style={{ margin: 0, marginRight: '20px' }}>
                      {userName}
                    </Title>
                    <Button size="small" onClick={() => setIsChangingName(true)}>
                      修改
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {statusMessage && (
            <Alert
              message={statusMessage.type === 'error' ? '错误' : statusMessage.type === 'success' ? '成功' : '提示'}
              description={statusMessage.content}
              type={statusMessage.type}
              showIcon
              closable
              onClose={resetStatus}
              style={{ marginBottom: '20px' }}
            />
          )}

          <Card style={{ marginBottom: '20px' }}>
            <Title level={4}>创建新房间</Title>
            <Paragraph>作为主持人创建新的海龟汤房间，设置游戏规则并出题。</Paragraph>
            <Button type="primary" size="large" onClick={handleCreateRoom}>
              创建房间
            </Button>
          </Card>

          <Card>
            <Title level={4}>加入已有房间</Title>
            <Paragraph>通过邀请码加入朋友的海龟汤房间。</Paragraph>
            <div style={{ display: 'flex', marginBottom: '20px' }}>
              <Input
                size="large"
                placeholder="输入邀请码"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                style={{ marginRight: '10px' }}
                disabled={isLoading}
              />
              <Space>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleJoinRoom}
                  loading={isLoading}
                  disabled={!joinCode.trim()}
                >
                  加入
                </Button>
                {isLoading && (
                  <Button size="large" onClick={() => {
                    setIsLoading(false);
                    setStatusMessage({type: 'info', content: '已取消加入房间'});
                  }}>
                    取消
                  </Button>
                )}
              </Space>
            </div>
          </Card>

          <Divider />

          <Card>
            <Title level={4}>什么是海龟汤？</Title>
            <Paragraph>
              海龟汤（lateral thinking puzzles）是一种侦探解谜游戏，由一个令人困惑的故事或场景开始，参与者需要通过提问来解开谜题。
            </Paragraph>
            <Paragraph>
              主持人只能用"是"、"否"或"不确定"来回答问题，参与者需要通过逻辑思考和推理能力逐步接近真相。
            </Paragraph>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
