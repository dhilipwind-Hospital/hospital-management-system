import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Card, Typography, Space, Tag } from 'antd';
import { SearchOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import api from '../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface RequestPatientAccessModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  location: string;
  globalPatientId?: string;
}

const RequestPatientAccessModal: React.FC<RequestPatientAccessModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [searchError, setSearchError] = useState<string>('');

  const handleSearch = async () => {
    const patientId = form.getFieldValue('patientId');
    
    if (!patientId) {
      message.warning('Please enter a Patient ID');
      return;
    }

    setSearching(true);
    setSearchError('');
    setPatientInfo(null);

    try {
      const response = await api.post('/patient-access/search', { patientId });
      setPatientInfo(response.data.patient);
      message.success('Patient found!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Patient not found';
      setSearchError(errorMsg);
      message.error(errorMsg);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!patientInfo) {
      message.warning('Please search for a patient first');
      return;
    }

    setLoading(true);

    try {
      await api.post('/patient-access/request', {
        patientId: patientInfo.id,
        reason: values.reason,
        durationHours: values.durationHours,
      });

      message.success('Access request sent successfully! Patient will be notified.');
      form.resetFields();
      setPatientInfo(null);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to send access request';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setPatientInfo(null);
    setSearchError('');
    onClose();
  };

  return (
    <Modal
      title="Request Patient Access"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ durationHours: 24 }}
      >
        {/* Step 1: Search Patient */}
        <Card size="small" style={{ marginBottom: 16, background: '#f5f5f5' }}>
          <Title level={5}>Step 1: Search Patient</Title>
          <Form.Item
            name="patientId"
            label="Patient ID"
            rules={[{ required: true, message: 'Please enter Patient ID' }]}
          >
            <Input
              placeholder="e.g., CHN-2025-00006"
              prefix={<UserOutlined />}
              suffix={
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={searching}
                  size="small"
                >
                  Search
                </Button>
              }
            />
          </Form.Item>

          {searchError && (
            <Text type="danger" style={{ display: 'block', marginTop: -16, marginBottom: 8 }}>
              {searchError}
            </Text>
          )}

          {patientInfo && (
            <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Patient Found:</Text>
                </div>
                {patientInfo.globalPatientId && (
                  <div>
                    <Text>Patient ID: <strong>{patientInfo.globalPatientId}</strong></Text>
                  </div>
                )}
                <div>
                  <Text>Name: {patientInfo.firstName} {patientInfo.lastName}</Text>
                </div>
                <div>
                  <Text>Location: </Text>
                  <Tag color="blue">{patientInfo.location}</Tag>
                </div>
              </Space>
            </Card>
          )}
        </Card>

        {/* Step 2: Request Details */}
        <Card size="small" style={{ marginBottom: 16, background: '#f5f5f5' }}>
          <Title level={5}>Step 2: Request Details</Title>
          
          <Form.Item
            name="reason"
            label="Reason for Access"
            rules={[
              { required: true, message: 'Please provide a reason' },
              { min: 10, message: 'Reason must be at least 10 characters' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="e.g., Patient visiting Mumbai branch for consultation. Need access to medical history and previous prescriptions."
              disabled={!patientInfo}
            />
          </Form.Item>

          <Form.Item
            name="durationHours"
            label="Access Duration"
            rules={[{ required: true, message: 'Please select duration' }]}
          >
            <Select
              placeholder="Select duration"
              disabled={!patientInfo}
              suffixIcon={<ClockCircleOutlined />}
            >
              <Option value={4}>4 hours</Option>
              <Option value={12}>12 hours</Option>
              <Option value={24}>24 hours (1 day)</Option>
              <Option value={48}>48 hours (2 days)</Option>
              <Option value={72}>72 hours (3 days)</Option>
              <Option value={168}>7 days</Option>
            </Select>
          </Form.Item>
        </Card>

        {/* Submit Buttons */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!patientInfo}
            >
              Send Request
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RequestPatientAccessModal;
