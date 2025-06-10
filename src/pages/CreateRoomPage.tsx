import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Form, 
  Input, 
  Typography, 
  Layout, 
  Card, 
  Divider, 
  Radio, 
  Switch, 
  message,
  Alert
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRoom } from '../context/RoomContext';
import { RoomRules } from '../types/room';

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

/**
 * 创建房间页面
 */
const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { createNewRoom, isLoading } = useRoom();
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    console.log('[CreateRoomPage] Form submitted with values:', values);
    setError(null);
    setSuccess(null);
    setCreating(true);

    try {
      const rules: RoomRules = {
        isRedSoup: values.isRedSoup === 'red',
        scoringMethod: values.scoringMethod,
        requireHandRaise: values.requireHandRaise,
        allowFlowersAndTrash: values.allowFlowersAndTrash
      };

      console.log('[CreateRoomPage] Calling createNewRoom with:', {
        title: values.title,
        description: values.description,
        rules
      });

      const room = await createNewRoom(
        values.title,
        values.description,
        rules
      );

      console.log('[CreateRoomPage] Room created successfully:', room);
      setSuccess(`房间创建成功！邀请码: ${room.inviteCode}`);
      message.success('房间创建成功');
      
      // 给用户一点时间看到成功消息，然后导航到房间页面
      setTimeout(() => {
        navigate(`/room/${room.id}`);
      }, 1000);
    } catch (error: any) {
      console.error('[CreateRoomPage] Error creating room:', error);
      const errorMessage = error.message || '创建房间失败，请重试';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            style={{ marginBottom: '20px' }}
          >
            返回首页
          </Button>

          <Title level={2}>创建海龟汤房间</Title>
          <Paragraph>设置房间信息和规则，成为主持人出题。</Paragraph>

          {error && (
            <Alert
              message="创建房间失败"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: '20px' }}
            />
          )}

          {success && (
            <Alert
              message="创建房间成功"
              description={success}
              type="success"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}

          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                isRedSoup: 'normal',
                scoringMethod: 'host',
                requireHandRaise: false,
                allowFlowersAndTrash: true
              }}
              disabled={creating}
            >
              <Title level={4}>基本信息</Title>
              <Form.Item
                name="title"
                label="房间标题"
                rules={[{ required: true, message: '请输入房间标题' }]}
              >
                <Input placeholder="请输入房间标题" />
              </Form.Item>

              <Form.Item
                name="description"
                label="房间描述"
              >
                <TextArea 
                  placeholder="请输入房间描述（可选）" 
                  rows={4}
                  showCount
                  maxLength={200}
                />
              </Form.Item>

              <Divider />

              <Title level={4}>房间规则</Title>

              <Form.Item
                name="isRedSoup"
                label="汤的类型"
              >
                <Radio.Group>
                  <Radio.Button value="normal">普通汤</Radio.Button>
                  <Radio.Button value="red">红汤</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="scoringMethod"
                label="打分方式"
              >
                <Radio.Group>
                  <Radio.Button value="host">主持人打分</Radio.Button>
                  <Radio.Button value="everyone">所有人打分</Radio.Button>
                  <Radio.Button value="none">不打分</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="requireHandRaise"
                label="是否需要举手才能回答"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="allowFlowersAndTrash"
                label="是否允许丢鲜花和垃圾"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  loading={creating || isLoading}
                  block
                >
                  创建房间
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default CreateRoomPage; 