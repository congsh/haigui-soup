import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Typography, 
  Spin, 
  Row, 
  Col, 
  Button, 
  Card, 
  Affix, 
  Alert, 
  message,
  Tabs,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CopyOutlined, 
  UserOutlined,
  MessageOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { useMessages } from '../hooks/useMessages';
import { Message, UserRole } from '../types/room';
import ChatMessage from '../components/ChatMessage';
import ParticipantList from '../components/ParticipantList';
import HostControls from '../components/host/HostControls';
import ParticipantControls from '../components/participant/ParticipantControls';
import NotesPanel from '../components/NotesPanel';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * 房间页面
 */
const RoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userName } = useAuth();
  const { currentRoom, leaveRoom } = useRoom();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 处理消息
  const { filteredMessages } = useMessages(
    currentRoom?.messages || [],
    currentUser?.uid || null
  );

  // 页面加载和离开时的处理
  useEffect(() => {
    // 页面离开时清理
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  // 消息滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

  // 处理复制邀请码
  const handleCopyInviteCode = () => {
    if (!currentRoom) return;
    
    navigator.clipboard.writeText(currentRoom.inviteCode)
      .then(() => {
        message.success('邀请码已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };

  // 处理回复消息
  const handleReplyToMessage = (messageId: string) => {
    if (!currentRoom) return;
    
    const message = currentRoom.messages.find(msg => msg.id === messageId);
    if (message) {
      setReplyToId(messageId);
      setReplyToMessage(message);
    }
  };

  // 清除回复状态
  const clearReplyTo = () => {
    setReplyToId(undefined);
    setReplyToMessage(null);
  };

  // 检查当前用户是否为主持人
  const isHost = currentUser && currentRoom && currentRoom.hostId === currentUser.uid;

  // 在加载或无房间时显示加载中
  if (!currentRoom) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-container">
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载中...</div>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
              style={{ marginRight: '16px' }}
            >
              返回首页
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {currentRoom.title}
            </Title>
          </div>
          
          <div>
            <Button 
              icon={<CopyOutlined />} 
              onClick={handleCopyInviteCode}
              style={{ marginRight: '8px' }}
            >
              复制邀请码: {currentRoom.inviteCode}
            </Button>
          </div>
        </div>
      </Header>
      
      <Layout>
        {!isMobile && (
          <Sider 
            width={300} 
            theme="light"
            style={{ 
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              position: 'fixed',
              left: 0,
              top: 64,
              bottom: 0,
            }}
          >
            <Card title="房间信息" style={{ margin: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong>类型：</Text>
                <Text>{currentRoom.rules.isRedSoup ? '红汤' : '普通汤'}</Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong>打分方式：</Text>
                <Text>
                  {currentRoom.rules.scoringMethod === 'host' && '主持人打分'}
                  {currentRoom.rules.scoringMethod === 'everyone' && '所有人打分'}
                  {currentRoom.rules.scoringMethod === 'none' && '不打分'}
                </Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong>是否需要举手：</Text>
                <Text>{currentRoom.rules.requireHandRaise ? '是' : '否'}</Text>
              </div>
              
              <div>
                <Text strong>可丢鲜花和垃圾：</Text>
                <Text>{currentRoom.rules.allowFlowersAndTrash ? '是' : '否'}</Text>
              </div>
            </Card>
            
            <Card title={`参与者 (${currentRoom.users.length})`} style={{ margin: '16px' }}>
              <ParticipantList 
                participants={currentRoom.users} 
                hostId={currentRoom.hostId}
                currentUserId={currentUser?.uid || null}
              />
            </Card>
          </Sider>
        )}
        
        <Layout style={{ padding: '0 24px 24px', marginLeft: isMobile ? 0 : 300 }}>
          <Content style={{ margin: '16px 0' }}>
            {currentRoom.status === 'ended' && (
              <Alert
                message="房间已结束"
                description="主持人已结束当前房间，你仍然可以查看聊天记录，但不能发送新消息。"
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            
            {isMobile ? (
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                style={{ marginBottom: '16px' }}
                items={[
                  {
                    key: 'chat',
                    label: (
                      <span>
                        <MessageOutlined />
                        聊天
                      </span>
                    ),
                    children: (
                      <>
                        <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto', padding: '16px' }}>
                          {filteredMessages.map(message => (
                            <ChatMessage
                              key={message.id}
                              message={message}
                              isCurrentUser={message.senderId === currentUser?.uid}
                              onReply={isHost ? handleReplyToMessage : undefined}
                              replyToMessage={
                                message.replyToId 
                                  ? currentRoom.messages.find(msg => msg.id === message.replyToId) || null
                                  : null
                              }
                            />
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                        
                        {isHost ? (
                          <HostControls 
                            replyToId={replyToId}
                            clearReplyTo={clearReplyTo}
                            replyToContent={replyToMessage?.content}
                          />
                        ) : (
                          <ParticipantControls />
                        )}
                      </>
                    )
                  },
                  {
                    key: 'notes',
                    label: (
                      <span>
                        <FileTextOutlined />
                        笔记
                      </span>
                    ),
                    children: <NotesPanel />
                  },
                  {
                    key: 'participants',
                    label: (
                      <span>
                        <UserOutlined />
                        参与者
                      </span>
                    ),
                    children: (
                      <Card title={`参与者 (${currentRoom.users.length})`}>
                        <ParticipantList 
                          participants={currentRoom.users} 
                          hostId={currentRoom.hostId}
                          currentUserId={currentUser?.uid || null}
                        />
                      </Card>
                    )
                  }
                ]}
              />
            ) : (
              <Row gutter={16}>
                <Col span={16}>
                  <Card>
                    <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto', padding: '16px' }}>
                      {filteredMessages.map(message => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isCurrentUser={message.senderId === currentUser?.uid}
                          onReply={isHost ? handleReplyToMessage : undefined}
                          replyToMessage={
                            message.replyToId 
                              ? currentRoom.messages.find(msg => msg.id === message.replyToId) || null
                              : null
                          }
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </Card>
                  
                  <div style={{ marginTop: '16px' }}>
                    {isHost ? (
                      <HostControls 
                        replyToId={replyToId}
                        clearReplyTo={clearReplyTo}
                        replyToContent={replyToMessage?.content}
                      />
                    ) : (
                      <ParticipantControls />
                    )}
                  </div>
                </Col>
                
                <Col span={8}>
                  <Affix offsetTop={16}>
                    <NotesPanel />
                  </Affix>
                </Col>
              </Row>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default RoomPage; 