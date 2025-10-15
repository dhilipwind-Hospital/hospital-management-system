import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Checkbox, message, Select } from 'antd';
import { MailOutlined, LockOutlined, PhoneOutlined, EyeInvisibleOutlined, EyeOutlined, GoogleOutlined, FacebookOutlined, CloseOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const { Title, Text } = Typography;

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef2f7 0%, #fff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(217, 31, 94, 0.15);
  max-width: 480px;
  width: 100%;
  padding: 40px 32px;
  position: relative;
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: transparent;
  color: #999;
  
  &:hover {
    color: #d91f5e;
    background: transparent;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const GradientLogo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d91f5e 0%, #14b8a6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
`;

const WelcomeTitle = styled(Title)`
  margin: 0 !important;
  font-size: 24px !important;
  font-weight: 600 !important;
  color: #1a1a1a;
`;

const Subtitle = styled(Text)`
  display: block;
  color: #666;
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 32px;
`;

const TabSwitcher = styled.div`
  display: flex;
  background: #f5f5f5;
  border-radius: 50px;
  padding: 4px;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 50px;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1a1a1a' : '#666'};
  font-size: 15px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    color: #1a1a1a;
  }
`;

const LoginMethodToggle = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const MethodButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 14px 20px;
  border: 2px solid ${props => props.active ? '#d91f5e' : '#e5e5e5'};
  border-radius: 12px;
  background: ${props => props.active ? '#fef2f7' : 'white'};
  color: ${props => props.active ? '#d91f5e' : '#666'};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    border-color: #d91f5e;
    color: #d91f5e;
  }
`;

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-label > label {
    font-weight: 500;
    color: #1a1a1a;
  }
`;

const StyledInput = styled(Input)`
  height: 52px;
  border-radius: 12px;
  background: #f5f5f5;
  border: 2px solid transparent;
  font-size: 15px;
  
  &:hover, &:focus {
    background: white;
    border-color: #d91f5e;
  }
  
  .ant-input {
    background: transparent;
  }
`;

const StyledPasswordInput = styled(Input.Password)`
  height: 52px;
  border-radius: 12px;
  background: #f5f5f5;
  border: 2px solid transparent;
  font-size: 15px;
  
  &:hover, &:focus {
    background: white;
    border-color: #d91f5e;
  }
  
  .ant-input {
    background: transparent;
  }
`;

const RememberRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ForgotLink = styled.a`
  color: #d91f5e;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  
  &:hover {
    color: #b01849;
    text-decoration: underline;
  }
`;

const PrimaryButton = styled(Button)`
  width: 100%;
  height: 52px;
  border-radius: 50px;
  background: #d91f5e;
  border: none;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 24px;
  
  &:hover {
    background: #b01849 !important;
  }
`;

const Divider = styled.div`
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 24px 0;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: #e5e5e5;
  }
  
  &::before {
    left: 0;
  }
  
  &::after {
    right: 0;
  }
`;

const SocialButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SocialButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e5e5e5;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    border-color: #d91f5e;
    color: #d91f5e;
  }
`;

const LoginNew: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [msg, msgCtx] = message.useMessage();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      const role = String(user.role || '').toLowerCase();
      if (role === 'admin' || role === 'super_admin') navigate('/admin/appointments', { replace: true });
      else if (role === 'doctor') navigate('/availability', { replace: true });
      else if (role === 'lab_technician' || role === 'lab_supervisor') navigate('/laboratory/dashboard', { replace: true });
      else if (role === 'pharmacist') navigate('/pharmacy', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const onLoginFinish = async (values: { email: string; password: string; remember?: boolean }) => {
    try {
      if (loading) return;
      setLoading(true);
      await login(values.email, values.password, !!values.remember);
      msg.success('Login successful!');
    } catch (error) {
      msg.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      
      if (!credentialResponse.credential) {
        msg.error('Google authentication failed');
        return;
      }

      // Send Google credential to backend
      const response = await api.post('/auth/google-login', {
        credential: credentialResponse.credential
      });

      // Store tokens
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      msg.success('Google login successful!');
      
      // Redirect based on role
      const role = String(response.data.user?.role || '').toLowerCase();
      if (role === 'admin' || role === 'super_admin') navigate('/admin/appointments', { replace: true });
      else if (role === 'doctor') navigate('/availability', { replace: true });
      else if (role === 'lab_technician' || role === 'lab_supervisor') navigate('/laboratory/dashboard', { replace: true });
      else if (role === 'pharmacist') navigate('/pharmacy', { replace: true });
      else navigate('/', { replace: true });
      
      // Reload to update auth context
      window.location.reload();
    } catch (error: any) {
      console.error('Google login error:', error);
      msg.error(error.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values: any) => {
    try {
      if (loading) return;
      setLoading(true);
      
      // Register the user with email and phone
      const registerData = {
        email: values.email,
        phone: values.phone,
        password: values.password,
        firstName: values.fullName?.split(' ')[0] || values.fullName,
        lastName: values.fullName?.split(' ').slice(1).join(' ') || '',
        role: 'patient',
        location: values.location || 'Chennai',
        agreeToTerms: values.agreeToTerms
      };
      
      await api.post('/auth/register', registerData);
      msg.success('Registration successful! Please login.');
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error: any) {
      msg.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (info: any) => {
    const first = info?.errorFields?.[0]?.errors?.[0] || 'Please fix the highlighted fields';
    msg.warning(first);
  };

  return (
    <PageContainer>
      {msgCtx}
      <Modal>
        <CloseButton 
          icon={<CloseOutlined />} 
          onClick={() => navigate('/home')}
        />
        
        <LogoContainer>
          <img 
            src="/logo.png" 
            alt="Ayphen Hospital" 
            style={{ width: 48, height: 48, objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.src = 'https://ayphen-backend-bucket-test2.s3.eu-west-1.amazonaws.com/Vector.png';
            }}
          />
          <WelcomeTitle level={3}>Welcome to Ayphen Hospital</WelcomeTitle>
        </LogoContainer>
        
        <Subtitle>
          Access your health records, book appointments, and manage your healthcare
        </Subtitle>
        
        <TabSwitcher>
          <Tab 
            active={activeTab === 'login'} 
            onClick={() => setActiveTab('login')}
          >
            Login
          </Tab>
          <Tab 
            active={activeTab === 'register'} 
            onClick={() => navigate('/register')}
          >
            Register
          </Tab>
        </TabSwitcher>
        
        {activeTab === 'login' ? (
          <>
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onLoginFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              form={loginForm}
            >
              <StyledFormItem
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <StyledInput
                  prefix={<MailOutlined style={{ color: '#999' }} />}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />
              </StyledFormItem>

              <StyledFormItem 
                label="Password" 
                name="password" 
                rules={[{ required: true, message: 'Please input your password!' }]}
              > 
                <StyledPasswordInput
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="Enter your password"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  autoComplete="current-password"
                />
              </StyledFormItem>

              <RememberRow>
                <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <ForgotLink href="/forgot-password">Forgot password?</ForgotLink>
              </RememberRow>

              <Form.Item style={{ margin: 0 }}>
                <PrimaryButton 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                >
                  Login
                </PrimaryButton>
              </Form.Item>
            </Form>
            
            <Divider>or continue with</Divider>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  msg.error('Google login failed');
                }}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>
          </>
        ) : (
          <>
            <Form
              name="register"
              onFinish={onRegisterFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              form={registerForm}
            >
              <StyledFormItem
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: 'Please input your full name!' }]}
              >
                <StyledInput
                  prefix={<UserOutlined style={{ color: '#999' }} />}
                  placeholder="John Doe"
                />
              </StyledFormItem>

              <StyledFormItem
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <StyledInput
                  prefix={<MailOutlined style={{ color: '#999' }} />}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />
              </StyledFormItem>

              <StyledFormItem
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: 'Please input your phone number!' },
                  { pattern: /^[+]?[\d\s-()]+$/, message: 'Please enter a valid phone number!' },
                ]}
              >
                <StyledInput
                  prefix={<PhoneOutlined style={{ color: '#999' }} />}
                  placeholder="+91 98765 43210"
                />
              </StyledFormItem>

              <StyledFormItem
                label="Hospital Location"
                name="location"
                initialValue="Chennai"
                rules={[{ required: true, message: 'Please select your location!' }]}
              >
                <Select
                  placeholder="Select your nearest hospital"
                  suffixIcon={<EnvironmentOutlined style={{ color: '#999' }} />}
                  style={{ height: '52px', borderRadius: '12px' }}
                >
                  <Select.Option value="Chennai">Chennai, Tamil Nadu</Select.Option>
                  <Select.Option value="Mumbai">Mumbai, Maharashtra</Select.Option>
                  <Select.Option value="Delhi">Delhi</Select.Option>
                  <Select.Option value="Bangalore">Bangalore, Karnataka</Select.Option>
                  <Select.Option value="Hyderabad">Hyderabad, Telangana</Select.Option>
                  <Select.Option value="Kolkata">Kolkata, West Bengal</Select.Option>
                  <Select.Option value="Pune">Pune, Maharashtra</Select.Option>
                </Select>
              </StyledFormItem>

              <StyledFormItem 
                label="Password" 
                name="password" 
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' },
                ]}
              > 
                <StyledPasswordInput
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="Minimum 6 characters"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  autoComplete="new-password"
                />
              </StyledFormItem>

              <StyledFormItem 
                label="Confirm Password" 
                name="confirmPassword" 
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              > 
                <StyledPasswordInput
                  prefix={<LockOutlined style={{ color: '#999' }} />}
                  placeholder="Re-enter your password"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  autoComplete="new-password"
                />
              </StyledFormItem>

              <Form.Item 
                name="agreeToTerms" 
                valuePropName="checked"
                rules={[
                  { 
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions')),
                  },
                ]}
                style={{ marginBottom: 24 }}
              >
                <Checkbox>
                  I agree to the <a href="/terms" style={{ color: '#d91f5e' }}>Terms & Conditions</a> and <a href="/privacy" style={{ color: '#d91f5e' }}>Privacy Policy</a>
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ margin: 0 }}>
                <PrimaryButton 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                >
                  Create Account
                </PrimaryButton>
              </Form.Item>
            </Form>
            
            <Divider>or continue with</Divider>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  msg.error('Google login failed');
                }}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </div>
          </>
        )}
      </Modal>
    </PageContainer>
  );
};

export default LoginNew;
