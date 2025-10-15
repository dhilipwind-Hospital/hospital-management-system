import React, { useEffect, useState } from 'react';
import { Steps, Button, Card, Form, Select, DatePicker, Radio, Input, message, Descriptions, Tag, Alert, Space, Spin, Modal, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { 
  MedicineBoxOutlined, 
  CalendarOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import './BookAppointmentStepper.css';

const { Option } = Select;
const { TextArea } = Input;

interface Service {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  department?: { id: string; name: string };
}

interface Department {
  id: string;
  name: string;
}

const BookAppointmentStepper: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Data states
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [urgency, setUrgency] = useState('routine');
  const [departmentId, setDepartmentId] = useState<string | undefined>();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Success modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [svcRes, deptRes] = await Promise.all([
        api.get('/services', { params: { page: 1, limit: 200 } }),
        api.get('/departments', { params: { page: 1, limit: 200 } })
      ]);
      setServices(svcRes.data?.data || svcRes.data || []);
      setDepartments(deptRes.data?.data || deptRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots: any = {
      morning: [],
      afternoon: [],
      evening: []
    };

    // Morning: 9 AM - 12 PM
    for (let hour = 9; hour < 12; hour++) {
      slots.morning.push({
        time: `${hour}:00 AM`,
        value: `${hour}:00`,
        available: Math.random() > 0.3
      });
      slots.morning.push({
        time: `${hour}:30 AM`,
        value: `${hour}:30`,
        available: Math.random() > 0.3
      });
    }

    // Afternoon: 12 PM - 5 PM
    for (let hour = 12; hour < 17; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.afternoon.push({
        time: `${displayHour}:00 PM`,
        value: `${hour}:00`,
        available: Math.random() > 0.3
      });
      slots.afternoon.push({
        time: `${displayHour}:30 PM`,
        value: `${hour}:30`,
        available: Math.random() > 0.3
      });
    }

    // Evening: 5 PM - 8 PM
    for (let hour = 17; hour < 20; hour++) {
      const displayHour = hour - 12;
      slots.evening.push({
        time: `${displayHour}:00 PM`,
        value: `${hour}:00`,
        available: Math.random() > 0.3
      });
      slots.evening.push({
        time: `${displayHour}:30 PM`,
        value: `${hour}:30`,
        available: Math.random() > 0.3
      });
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const next = () => {
    // Validate current step
    if (current === 0 && !selectedService) {
      messageApi.error('Please select a service');
      return;
    }
    if (current === 1 && (!selectedDate || !selectedTime)) {
      messageApi.error('Please select date and time');
      return;
    }
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      messageApi.error('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const [hourStr, minuteStr] = selectedTime.split(':');
      const hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      const startTime = selectedDate.hour(hour).minute(minute);
      const endTime = startTime.add(selectedService.duration || 30, 'minute');

      const payload = {
        serviceId: selectedService.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: reason || 'General consultation',
        notes: notes,
        preferences: {
          urgency: urgency,
          departmentId: departmentId
        }
      };

      const response = await api.post('/appointments', payload);
      
      setBookingDetails({
        date: selectedDate.format('MMMM D, YYYY'),
        time: selectedTime,
        service: selectedService.name,
        confirmationId: response.data?.id || 'N/A'
      });
      setShowSuccess(true);
    } catch (error: any) {
      messageApi.error(error?.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  // Step content
  const steps = [
    {
      title: 'Service',
      icon: <MedicineBoxOutlined />,
      content: (
        <div className="step-content">
          <h3>Select a Service</h3>
          <p className="step-description">Choose the medical service you need</p>
          
          <Select
            size="large"
            style={{ width: '100%' }}
            placeholder="Search and select a service"
            showSearch
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
            value={selectedService?.id}
            onChange={(value) => {
              const service = services.find(s => s.id === value);
              setSelectedService(service || null);
              if (service?.department?.id) {
                setDepartmentId(service.department.id);
              }
            }}
            loading={loading}
          >
            {services.map(service => (
              <Option key={service.id} value={service.id}>
                {service.name}
              </Option>
            ))}
          </Select>

          {selectedService && (
            <Card className="service-info-card" style={{ marginTop: 16 }}>
              <h4>{selectedService.name}</h4>
              {selectedService.description && <p>{selectedService.description}</p>}
              <Space>
                {selectedService.duration && (
                  <Tag color="blue">Duration: {selectedService.duration} mins</Tag>
                )}
                {selectedService.department && (
                  <Tag color="green">Department: {selectedService.department.name}</Tag>
                )}
              </Space>
            </Card>
          )}
        </div>
      )
    },
    {
      title: 'Date & Time',
      icon: <CalendarOutlined />,
      content: (
        <div className="step-content">
          <h3>Choose Date & Time</h3>
          <p className="step-description">Select your preferred appointment slot</p>

          <div style={{ marginBottom: 24 }}>
            <label className="step-label">Select Date</label>
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              disabledDate={(d) => d && d < dayjs().startOf('day')}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              value={selectedDate}
              placeholder="Choose a date"
            />
          </div>

          {selectedDate && (
            <div className="time-slots-container">
              <div className="time-period">
                <div className="time-period-title">🌅 Morning (9:00 AM - 12:00 PM)</div>
                <div className="slot-grid">
                  {timeSlots.morning.map((slot: any) => (
                    <Button
                      key={slot.value}
                      className={`time-slot ${slot.available ? 'available' : 'booked'} ${selectedTime === slot.value ? 'selected' : ''}`}
                      onClick={() => slot.available && handleTimeSelect(slot.value)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="time-period">
                <div className="time-period-title">☀️ Afternoon (12:00 PM - 5:00 PM)</div>
                <div className="slot-grid">
                  {timeSlots.afternoon.map((slot: any) => (
                    <Button
                      key={slot.value}
                      className={`time-slot ${slot.available ? 'available' : 'booked'} ${selectedTime === slot.value ? 'selected' : ''}`}
                      onClick={() => slot.available && handleTimeSelect(slot.value)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="time-period">
                <div className="time-period-title">🌙 Evening (5:00 PM - 8:00 PM)</div>
                <div className="slot-grid">
                  {timeSlots.evening.map((slot: any) => (
                    <Button
                      key={slot.value}
                      className={`time-slot ${slot.available ? 'available' : 'booked'} ${selectedTime === slot.value ? 'selected' : ''}`}
                      onClick={() => slot.available && handleTimeSelect(slot.value)}
                      disabled={!slot.available}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Details',
      icon: <FileTextOutlined />,
      content: (
        <div className="step-content">
          <h3>Additional Information</h3>
          <p className="step-description">Provide any additional details for your appointment</p>

          <div style={{ marginBottom: 16 }}>
            <label className="step-label">Urgency</label>
            <Radio.Group 
              value={urgency} 
              onChange={(e) => setUrgency(e.target.value)}
              style={{ width: '100%' }}
            >
              <Radio.Button value="routine" style={{ width: '33.33%', textAlign: 'center' }}>
                📅 Routine
              </Radio.Button>
              <Radio.Button value="urgent" style={{ width: '33.33%', textAlign: 'center' }}>
                ⚡ Urgent
              </Radio.Button>
              <Radio.Button value="emergency" style={{ width: '33.33%', textAlign: 'center' }}>
                🚨 Emergency
              </Radio.Button>
            </Radio.Group>
          </div>

          {urgency === 'emergency' && (
            <Alert
              type="warning"
              message="For emergencies, please use our 24/7 Emergency page"
              description={<a href="/emergency">Go to Emergency</a>}
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="step-label">Department (Optional)</label>
            <Select
              size="large"
              style={{ width: '100%' }}
              placeholder="Select department"
              value={departmentId}
              onChange={setDepartmentId}
              allowClear
            >
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="step-label">Reason for Visit</label>
            <TextArea
              rows={3}
              placeholder="Brief description of your concern"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="step-label">Additional Notes (Optional)</label>
            <TextArea
              rows={2}
              placeholder="Any additional information"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )
    },
    {
      title: 'Confirm',
      icon: <CheckCircleOutlined />,
      content: (
        <div className="step-content">
          <h3>Review Your Appointment</h3>
          <p className="step-description">Please review your appointment details before confirming</p>

          <Card className="confirmation-card">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Service">
                <strong>{selectedService?.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                <strong>{selectedDate?.format('MMMM D, YYYY')}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Time">
                <strong>{selectedTime}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {selectedService?.duration || 30} minutes
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {departmentId ? departments.find(d => d.id === departmentId)?.name : 'Auto-assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Urgency">
                <Tag color={urgency === 'emergency' ? 'red' : urgency === 'urgent' ? 'orange' : 'blue'}>
                  {urgency.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              {reason && (
                <Descriptions.Item label="Reason">
                  {reason}
                </Descriptions.Item>
              )}
              {notes && (
                <Descriptions.Item label="Notes">
                  {notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          <Alert
            type="info"
            message="By confirming, you agree to our terms and conditions"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      )
    }
  ];

  return (
    <div className="appointment-stepper-container">
      {contextHolder}

      {/* Loading Overlay */}
      {submitting && (
        <div className="loading-overlay">
          <Spin size="large" />
          <p>Booking your appointment...</p>
        </div>
      )}

      {/* Success Modal */}
      <Modal
        open={showSuccess}
        footer={null}
        closable={false}
        centered
        className="success-modal"
      >
        <Result
          status="success"
          title="Appointment Booked Successfully!"
          subTitle={
            <Space direction="vertical" size="small">
              <p><strong>Date:</strong> {bookingDetails?.date}</p>
              <p><strong>Time:</strong> {bookingDetails?.time}</p>
              <p><strong>Service:</strong> {bookingDetails?.service}</p>
              <p><strong>Confirmation ID:</strong> {bookingDetails?.confirmationId}</p>
            </Space>
          }
          extra={[
            <Button type="primary" key="view" onClick={() => navigate('/appointments')}>
              View My Appointments
            </Button>,
            <Button key="home" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ]}
        />
      </Modal>

      <Card className="stepper-card">
        <h2 className="page-title">📅 Book an Appointment</h2>
        
        <Steps current={current} className="appointment-steps">
          {steps.map((item, index) => (
            <Steps.Step 
              key={index} 
              title={item.title} 
              icon={item.icon}
            />
          ))}
        </Steps>

        <div className="steps-content">
          {steps[current].content}
        </div>

        <div className="steps-action">
          {current > 0 && (
            <Button 
              size="large"
              onClick={prev}
              icon={<LeftOutlined />}
            >
              Back
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button 
              type="primary" 
              size="large"
              onClick={next}
              icon={<RightOutlined />}
              iconPosition="end"
            >
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button 
              type="primary" 
              size="large"
              onClick={handleSubmit}
              loading={submitting}
              icon={<CheckCircleOutlined />}
            >
              Confirm Booking
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BookAppointmentStepper;
