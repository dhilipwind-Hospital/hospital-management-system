import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Typography, Button, Space } from 'antd';
import { LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

/**
 * Public landing page for access request review
 * Handles email link clicks and redirects appropriately
 */
const ReviewAccessRequest: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const requestId = searchParams.get('requestId');

  useEffect(() => {
    if (!loading) {
      if (user && user.role === 'patient') {
        // Patient is logged in, redirect to access requests page
        navigate(`/portal/access-requests?highlight=${requestId}`);
      }
    }
  }, [user, loading, requestId, navigate]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // User is not logged in, show login prompt
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <LockOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
          <Title level={3}>Access Request Review</Title>
          <Text type="secondary">
            A doctor has requested access to your medical records
          </Text>
        </div>

        <Card
          style={{
            background: '#f0f2f5',
            marginBottom: 24,
            border: 'none',
          }}
        >
          <Paragraph>
            <strong>To review this access request, you need to:</strong>
          </Paragraph>
          <ol style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li>Login to your patient portal</li>
            <li>Review the doctor's request details</li>
            <li>Approve or reject the request</li>
          </ol>
        </Card>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="primary"
            size="large"
            block
            icon={<LoginOutlined />}
            onClick={() => {
              // Store the return URL so we can redirect back after login
              sessionStorage.setItem('returnUrl', `/portal/access-requests?highlight=${requestId}`);
              navigate('/login');
            }}
          >
            Login to Review Request
          </Button>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Don't have an account?{' '}
              <a onClick={() => navigate('/register')}>Register here</a>
            </Text>
          </div>
        </Space>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: '#fff7e6',
            borderLeft: '4px solid #faad14',
            borderRadius: 4,
          }}
        >
          <Text strong style={{ color: '#d46b08' }}>
            ⚠️ Security Notice
          </Text>
          <Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
            If you did not expect this request or have concerns, please contact
            our support team immediately.
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ReviewAccessRequest;
