import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Button, Empty, message } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styled from 'styled-components';

const { Title } = Typography;

const DashboardContainer = styled.div`
  .dashboard-header {
    margin-bottom: 24px;
  }
  
  .stat-card {
    text-align: center;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .ant-statistic-title {
      font-size: 16px;
      color: #666;
    }
    
    .ant-statistic-content {
      font-size: 24px;
      font-weight: 600;
    }
  }
`;

const SpaceWrap = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
`;

type Appt = {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  reason?: string;
  patient?: { id: string; firstName?: string; lastName?: string };
  service?: { id: string; name: string };
  doctor?: { id: string; firstName?: string; lastName?: string };
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [msg, msgCtx] = message.useMessage();
  const role = String(user?.role || '').toLowerCase();
  const isDoctor = role === 'doctor';

  const [loading, setLoading] = React.useState(false);
  const [appts, setAppts] = React.useState<Appt[]>([]);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!isDoctor) return;
      setLoading(true);
      try {
        const res = await api.get('/appointments/doctor/me', { params: { limit: 50 }, suppressErrorToast: true } as any);
        if (!mounted) return;
        setAppts((res.data?.data as Appt[]) || []);
      } catch (_e) {
        if (mounted) msg.warning('Could not load your recent appointments');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [isDoctor]);

  const today = new Date();
  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const todayAppointments = appts.filter(a => isSameDay(new Date(a.startTime), today)).length;
  const pendingAppointments = appts.filter(a => String(a.status).toLowerCase() === 'pending').length;
  const totalPatients = Array.from(new Set(appts.map(a => a.patient?.id).filter(Boolean))).length;
  const monthlyRevenue = undefined; // Not computed; hidden for doctor view

  return (
    <DashboardContainer>
      {msgCtx}
      <div className="dashboard-header">
        <Title level={3}>Welcome back, {user?.firstName}!</Title>
        <Typography.Text type="secondary">
          Here's what's happening with your hospital today.
        </Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Patients"
              value={isDoctor ? totalPatients : 1242}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Today's Appointments"
              value={isDoctor ? todayAppointments : 18}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Pending Appointments"
              value={isDoctor ? pendingAppointments : 42}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title="Monthly Revenue"
              value={monthlyRevenue ?? 0}
              prefix={<DollarOutlined />}
              precision={monthlyRevenue ? 2 : 0}
              valueStyle={{ color: '#722ed1' }}
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <Card title="Recent Appointments" style={{ height: '100%' }} loading={loading}>
            {isDoctor ? (
              appts.length ? (
                <Table
                  size="small"
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  dataSource={appts.slice(0, 10)}
                  columns={[
                    { title: 'Patient', dataIndex: ['patient','firstName'], key: 'patient', render: (_: any, r: Appt) => `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.trim() || '-' },
                    { title: 'Service', dataIndex: ['service','name'], key: 'service', render: (v: any) => v || '-' },
                    { title: 'Start', dataIndex: 'startTime', key: 'start', render: (v: string) => new Date(v).toLocaleString() },
                    { title: 'Status', dataIndex: 'status', key: 'status', render: (v: string) => {
                        const s = String(v).toLowerCase();
                        const color = s === 'pending' ? 'orange' : s === 'confirmed' ? 'green' : s === 'cancelled' ? 'red' : 'default';
                        return <Tag color={color}>{s.toUpperCase()}</Tag>;
                      }
                    },
                  ]}
                />
              ) : (
                <Empty description="No recent appointments">
                  <SpaceWrap>
                    <Button type="primary" onClick={() => navigate('/doctor/my-schedule')}>Add Availability</Button>
                    <Button onClick={() => navigate('/appointments/new')}>Create Appointment</Button>
                  </SpaceWrap>
                </Empty>
              )
            ) : (
              <Typography.Text type="secondary">This section will show recent items for your role.</Typography.Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Quick Actions" style={{ height: '100%' }}>
            {isDoctor ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <Button type="primary" onClick={() => navigate('/doctor/my-schedule')}>Add Availability</Button>
                <Button onClick={() => navigate('/appointments')}>View My Appointments</Button>
                <Button onClick={() => navigate('/doctor/my-patients')}>My Patients</Button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                <Button onClick={() => navigate('/appointments')}>Appointments</Button>
                <Button onClick={() => navigate('/patients')}>Patients</Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </DashboardContainer>
  );
};

export default Dashboard;
