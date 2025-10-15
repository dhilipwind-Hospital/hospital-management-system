import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Input, message, Typography, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface AccessRequest {
  id: string;
  requestingDoctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  reason: string;
  requestedDurationHours: number;
  createdAt: string;
}

const PendingAccessRequests: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patient-access/requests/pending');
      setRequests(response.data.requests || []);
    } catch (error: any) {
      console.error('Failed to fetch requests:', error);
      message.error('Failed to load access requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    Modal.confirm({
      title: 'Approve Access Request',
      content: (
        <div>
          <p>Are you sure you want to grant access to:</p>
          <p><strong>Dr. {request.requestingDoctor.firstName} {request.requestingDoctor.lastName}</strong></p>
          <p>Duration: <strong>{request.requestedDurationHours} hours</strong></p>
          <p style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 4 }}>
            <Text type="secondary">Reason: {request.reason}</Text>
          </p>
        </div>
      ),
      okText: 'Approve',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        setActionLoading(request.id);
        try {
          await api.patch(`/patient-access/requests/${request.id}/approve`);
          message.success('Access granted successfully!');
          fetchRequests();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to approve request');
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleRejectClick = (request: AccessRequest) => {
    setSelectedRequest(request);
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;

    setActionLoading(selectedRequest.id);
    try {
      await api.patch(`/patient-access/requests/${selectedRequest.id}/reject`, {
        reason: rejectionReason,
      });
      message.success('Access request rejected');
      setRejectModalVisible(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      title: 'Doctor',
      key: 'doctor',
      render: (record: AccessRequest) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            <UserOutlined /> Dr. {record.requestingDoctor.firstName} {record.requestingDoctor.lastName}
          </Text>
          {record.requestingDoctor.specialization && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.requestingDoctor.specialization}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ maxWidth: 300, display: 'block' }}>{text}</Text>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'requestedDurationHours',
      key: 'duration',
      render: (hours: number) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {hours < 24 ? `${hours} hours` : `${hours / 24} day${hours / 24 > 1 ? 's' : ''}`}
        </Tag>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text>{moment(date).format('MMM DD, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {moment(date).format('hh:mm A')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: AccessRequest) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record)}
            loading={actionLoading === record.id}
            size="small"
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleRejectClick(record)}
            loading={actionLoading === record.id}
            size="small"
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>Pending Access Requests</Title>
          <Text type="secondary">
            Doctors from other locations are requesting access to your medical records
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description="No pending access requests"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} request${total !== 1 ? 's' : ''}`,
          }}
        />
      </Card>

      {/* Reject Modal */}
      <Modal
        title="Reject Access Request"
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
          setSelectedRequest(null);
        }}
        okText="Reject Request"
        okButtonProps={{ danger: true, loading: !!actionLoading }}
      >
        {selectedRequest && (
          <div>
            <p>
              You are rejecting access request from{' '}
              <strong>
                Dr. {selectedRequest.requestingDoctor.firstName}{' '}
                {selectedRequest.requestingDoctor.lastName}
              </strong>
            </p>
            <TextArea
              rows={4}
              placeholder="Optional: Provide a reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PendingAccessRequests;
