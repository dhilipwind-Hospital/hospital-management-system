import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, Modal, Space, Typography, Alert, message, Spin } from 'antd';
import { LockOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

const RequestExternalAccess: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [currentRequestId, setCurrentRequestId] = useState('');
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes

  // Timer countdown
  React.useEffect(() => {
    if (otpModalVisible) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpModalVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSearchPatient = async (values: any) => {
    setSearching(true);
    try {
      const res = await api.post('/patient-access/search', {
        patientId: values.patientId,
      });
      setPatientInfo(res.data.patient);
      message.success('Patient found!');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Patient not found');
      setPatientInfo(null);
    } finally {
      setSearching(false);
    }
  };

  const handleRequestAccess = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post('/patient-access/request', {
        patientId: patientInfo.id,
        reason: values.reason,
        durationHours: values.durationHours || 24,
      });
      
      setCurrentRequestId(res.data.request.id);
      message.success('OTP sent to patient!');
      
      // Show info modal first
      Modal.info({
        title: '📧 OTP Sent to Patient',
        content: (
          <div>
            <p>A 6-digit OTP has been sent to the patient's email.</p>
            <p><strong>Ask the patient to share the OTP with you.</strong></p>
            <p>Once you receive it, click "Enter OTP" to gain access.</p>
          </div>
        ),
        onOk: () => {
          setOtpModalVisible(true);
          setTimeRemaining(900); // Reset timer
        },
        okText: 'Enter OTP',
      });
      
      form.resetFields(['reason', 'durationHours']);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to request access');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-doctor-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-doctor-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otpCode.join('');
    
    if (code.length !== 6) {
      message.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/patient-access/requests/${currentRequestId}/verify-otp`, {
        otpCode: code,
      });
      
      message.success('Access granted! You can now view patient records.');
      setOtpModalVisible(false);
      setOtpCode(['', '', '', '', '', '']);
      setPatientInfo(null);
      form.resetFields();
      
      // Redirect to shared patients
      navigate('/doctor/shared-patients');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Invalid OTP');
      // Don't clear OTP on error, let user try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          <LockOutlined /> OTP Verification
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Request access to patient records from another location using OTP verification
        </Text>
      </div>

      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          Step 1: Search Patient
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Enter the patient's ID to search across all hospital locations
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearchPatient}
        >
          <Form.Item
            label="Patient ID"
            name="patientId"
            rules={[{ required: true, message: 'Please enter patient ID' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="e.g., CHN-2025-00008"
              size="large"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={searching} size="large">
            🔍 Search Patient
          </Button>
        </Form>

        {patientInfo && (
          <div style={{ marginTop: 32 }}>
            <Title level={4} style={{ marginBottom: 16 }}>
              Step 2: Request Access
            </Title>
            
            <Alert
              message="✅ Patient Found"
              description={
                <div style={{ marginTop: 8 }}>
                  <p style={{ margin: '4px 0' }}><strong>Name:</strong> {patientInfo.firstName} {patientInfo.lastName}</p>
                  <p style={{ margin: '4px 0' }}><strong>Location:</strong> {patientInfo.location}</p>
                  <p style={{ margin: '4px 0' }}><strong>Patient ID:</strong> {patientInfo.globalPatientId}</p>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              layout="vertical"
              onFinish={handleRequestAccess}
            >
              <Form.Item
                label="Reason for Access"
                name="reason"
                rules={[{ required: true, message: 'Please provide a reason' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="e.g., Patient visiting for consultation, emergency treatment, second opinion, etc."
                />
              </Form.Item>

              <Form.Item
                label="Access Duration (hours)"
                name="durationHours"
                initialValue={24}
                help="How long do you need access to this patient's records?"
              >
                <InputNumber
                  min={1}
                  max={168}
                  prefix={<ClockCircleOutlined />}
                  style={{ width: '100%' }}
                  size="large"
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                📧 Send OTP Request to Patient
              </Button>
            </Form>
          </div>
        )}
      </Card>

      {/* OTP Entry Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <div style={{ fontSize: 18, fontWeight: 600 }}>Step 3: Enter OTP Code</div>
          </div>
        }
        open={otpModalVisible}
        onCancel={() => {
          setOtpModalVisible(false);
          setOtpCode(['', '', '', '', '', '']);
        }}
        footer={null}
        width={500}
      >
        <div style={{ textAlign: 'center' }}>
          <Text>Ask the patient for the 6-digit code sent to their email</Text>
          
          {patientInfo && (
            <div style={{ 
              background: '#f0f2f5', 
              padding: 16, 
              borderRadius: 8, 
              margin: '20px 0',
              textAlign: 'left'
            }}>
              <Text strong>Patient: </Text>
              <Text>{patientInfo.firstName} {patientInfo.lastName}</Text>
              <br />
              <Text strong>Location: </Text>
              <Text>{patientInfo.location}</Text>
            </div>
          )}
          
          <div style={{ margin: '30px 0' }}>
            <Space size="large">
              {otpCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-doctor-${index}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  style={{
                    width: 50,
                    height: 60,
                    fontSize: 24,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    border: '2px solid #d9d9d9',
                    borderRadius: 8,
                  }}
                />
              ))}
            </Space>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ fontSize: 16 }}>
              <ClockCircleOutlined /> Time Remaining: {' '}
              <span style={{ 
                color: timeRemaining < 300 ? '#ff4d4f' : timeRemaining < 600 ? '#faad14' : '#52c41a' 
              }}>
                {formatTime(timeRemaining)}
              </span>
            </Text>
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleVerifyOTP}
            loading={loading}
            disabled={otpCode.join('').length !== 6 || timeRemaining === 0}
            icon={loading ? <Spin /> : null}
          >
            ✅ Verify & Gain Access
          </Button>

          <Button
            type="link"
            block
            onClick={() => {
              setOtpModalVisible(false);
              setOtpCode(['', '', '', '', '', '']);
            }}
            style={{ marginTop: 12 }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RequestExternalAccess;
