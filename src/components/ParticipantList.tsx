import React from 'react';
import { List, Avatar, Badge, Typography, Tooltip } from 'antd';
import { UserOutlined, CrownOutlined, RiseOutlined } from '@ant-design/icons';
import { User, UserRole } from '../types/room';

const { Text } = Typography;

interface ParticipantListProps {
  participants: User[];
  hostId: string;
  currentUserId: string | null;
}

/**
 * 参与者列表组件
 */
const ParticipantList: React.FC<ParticipantListProps> = ({ 
  participants, 
  hostId, 
  currentUserId 
}) => {
  // 获取用户头像颜色
  const getUserAvatarColor = (userId: string): string => {
    // 生成固定颜色以便于识别
    const colors = [
      '#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#9c27b0',
      '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b',
      '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e'
    ];
    
    // 使用用户ID的哈希值确定颜色索引
    const hashCode = userId.split('').reduce(
      (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0
    );
    
    return colors[Math.abs(hashCode) % colors.length];
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={participants}
      renderItem={(user) => {
        const isHost = user.id === hostId;
        const isCurrentUser = user.id === currentUserId;
        const avatarColor = getUserAvatarColor(user.id);
        
        return (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Badge
                  count={isHost ? <CrownOutlined style={{ color: '#ffd700' }} /> : 0}
                  offset={[0, 28]}
                >
                  <Avatar 
                    style={{ 
                      backgroundColor: avatarColor,
                      border: isCurrentUser ? '2px solid #1890ff' : 'none'
                    }}
                    icon={<UserOutlined />} 
                  />
                </Badge>
              }
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text strong>{user.name}</Text>
                  {isHost && (
                    <Tooltip title="主持人">
                      <Text type="warning" style={{ marginLeft: '8px' }}>
                        (主持人)
                      </Text>
                    </Tooltip>
                  )}
                  {isCurrentUser && (
                    <Tooltip title="当前用户">
                      <Text type="secondary" style={{ marginLeft: '8px' }}>
                        (你)
                      </Text>
                    </Tooltip>
                  )}
                </div>
              }
              description={
                user.isRaisingHand && (
                  <div style={{ display: 'flex', alignItems: 'center', color: '#fa8c16' }}>
                    <RiseOutlined style={{ marginRight: '4px' }} />
                    <Text type="warning">正在举手</Text>
                  </div>
                )
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ParticipantList; 