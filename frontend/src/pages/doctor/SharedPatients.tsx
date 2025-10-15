import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Typography, Empty, Button, Statistic, Row, Col } from 'antd';
import { UserOutlined, ClockCircleOutlined, EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface SharedPatient {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    location: string;
  };
  grantedAt: string;
  expiresAt: string;
  reason: string;
}

const SharedPatients: React.FC = () => {
  const [sharedPatients, setSharedPatients] = useState<SharedPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedPatients();
    
    // Refresh every minute to update countdown
    const interval = setInterval(fetchSharedPatients, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSharedPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patient-access/shared');
      setSharedPatients(response.data.sharedPatients || []);
    } catch (error: any) {
      console.error('Failed to fetch shared patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = moment();
    const expiry = moment(expiresAt);
    const duration = moment.duration(expiry.diff(now));

    if (duration.asMilliseconds() <= 0) {
      return { text: 'Expired', color: 'red', urgent: true };
    }

    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes() % 60);

    if (hours < 1) {
      return { text: `${minutes}m`, color: 'red', urgent: true };
    } else if (hours < 4) {
      return { text: `${hours}h ${minutes}m`, color: 'orange', urgent: true };
    } else if (hours < 24) {
      return { text: `${hours}h`, color: 'blue', urgent: false };
    } else {
      const days = Math.floor(duration.asDays());
      return { text: `${days}d`, color: 'green', urgent: false };
    }
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor/shared-patients/${patientId}`);
  };

  const columns = [
    {
      title: 'Patient',
      key: 'patient',
      render: (record: SharedPatient) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            <UserOutlined /> {record.patient.firstName} {record.patient.lastName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <EnvironmentOutlined /> {record.patient.location}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Access Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ maxWidth: 300, display: 'block' }} ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Granted',
      dataIndex: 'grantedAt',
      key: 'grantedAt',
      render: (date: string) => (
        <Text type="secondary">{moment(date).format('MMM DD, hh:mm A')}</Text>
      ),
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => {
        const remaining = getTimeRemaining(date);
        return (
          <Space direction="vertical" size={0}>
            <Tag color={remaining.color} icon={<ClockCircleOutlined />}>
              {remaining.text} remaining
            </Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {moment(date).format('MMM DD, hh:mm A')}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: SharedPatient) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewPatient(record.patient.id)}
          size="small"
        >
          View Records
        </Button>
      ),
    },
  ];

  const activeCount = sharedPatients.length;
  const expiringCount = sharedPatients.filter(p => {
    const remaining = getTimeRemaining(p.expiresAt);
    return remaining.urgent;
  }).length;

  return (
    <div style={{ padding: 24 }}>
      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Active Shared Access"
              value={activeCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Expiring Soon"
              value={expiringCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: expiringCount > 0 ? '#cf1322' : '#3f8600' }}
              suffix={expiringCount > 0 ? '⚠️' : ''}
            />
          </Card>
        </Col>
      </Row>

      {/* Shared Patients Table */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Shared Patient Access</Title>
          <Text type="secondary">
            Patients from other locations who have granted you temporary access
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={sharedPatients}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="No shared patient access"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary">
                  Request access to patients from other locations to see them here
                </Text>
              </Empty>
            ),
          }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} patient${total !== 1 ? 's' : ''}`,
          }}
          rowClassName={(record) => {
            const remaining = getTimeRemaining(record.expiresAt);
            return remaining.urgent ? 'expiring-soon-row' : '';
          }}
        />
      </Card>

      <style>{`
        .expiring-soon-row {
          background-color: #fff7e6 !important;
        }
        .expiring-soon-row:hover {
          background-color: #ffe7ba !important;
        }
      `}</style>
    </div>
  );
};

export default SharedPatients;
