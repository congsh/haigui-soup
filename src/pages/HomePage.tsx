import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Typography, Layout, Card, Form, Divider, message } from 'antd';
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
    if (!joinCode.trim()) {
      message.error('请输入邀请码');
      return;
    }

    setIsLoading(true);
    try {
      const room = await joinRoom(joinCode.trim().toUpperCase());
      if (room) {
        message.success('加入房间成功');
        navigate(`/room/${room.id}`);
      } else {
        message.error('房间不存在或已关闭');
      }
    } catch (error) {
      message.error('加入房间失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
              />
              <Button
                type="primary"
                size="large"
                onClick={handleJoinRoom}
                loading={isLoading}
              >
                加入
              </Button>
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
