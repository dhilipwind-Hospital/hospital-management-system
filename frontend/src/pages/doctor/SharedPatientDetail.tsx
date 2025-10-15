import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Descriptions,
  Table,
  Tabs,
  Tag,
  Space,
  Button,
  Alert,
  Spin,
  Empty,
  Timeline,
  Statistic,
  Row,
  Col,
  Badge,
  Divider,
} from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  registeredLocation: string;
  globalPatientId: string;
}

interface MedicalRecord {
  id: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  createdAt: string;
  doctor: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

interface Prescription {
  id: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes: string;
  status: string;
  createdAt: string;
  doctor: {
    firstName: string;
    lastName: string;
  };
}

interface LabResult {
  id: string;
  testName: string;
  result: string;
  normalRange: string;
  status: string;
  performedAt: string;
  notes: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: {
    name: string;
  };
  doctor: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  status: string;
  notes: string;
}

interface VitalSign {
  id: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  recordedAt: string;
}

interface SharedAccessInfo {
  grantedAt: string;
  expiresAt: string;
  reason: string;
  isActive: boolean;
}

const SharedPatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [accessInfo, setAccessInfo] = useState<SharedAccessInfo | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchAllData();
    }
  }, [patientId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // First, fetch shared access info to verify we have permission
      const accessRes = await api.get(`/patient-access/shared`);
      const sharedPatients = accessRes.data.sharedPatients || [];
      const currentAccess = sharedPatients.find((p: any) => p.patient.id === patientId);
      
      if (!currentAccess) {
        // No shared access found
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Set access info
      setAccessInfo({
        grantedAt: currentAccess.grantedAt,
        expiresAt: currentAccess.expiresAt,
        reason: currentAccess.reason,
        isActive: true,
      });

      // Set patient info from shared access data
      setPatientInfo({
        id: currentAccess.patient.id,
        firstName: currentAccess.patient.firstName,
        lastName: currentAccess.patient.lastName,
        email: currentAccess.patient.email || '',
        phone: currentAccess.patient.phone || '',
        dateOfBirth: currentAccess.patient.dateOfBirth || '',
        gender: currentAccess.patient.gender || '',
        bloodGroup: currentAccess.patient.bloodGroup || '',
        registeredLocation: currentAccess.patient.location || '',
        globalPatientId: currentAccess.patient.globalPatientId || currentAccess.patient.id,
      });

      // Fetch medical data
      await Promise.all([
        fetchMedicalRecords(), // This now fetches and separates all records
        fetchAppointments(),
        fetchVitalSigns(),
      ]);

      setAccessDenied(false);
    } catch (error: any) {
      console.error('Failed to fetch patient data:', error);
      if (error.response?.status === 403) {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      // Use aggregated records endpoint - combines medical records, prescriptions, and lab orders
      const res = await api.get(`/medical-records/aggregated?patientId=${patientId}`);
      const allRecords = res.data?.data || res.data || [];
      
      // Separate records by type
      const medicalHistory: MedicalRecord[] = [];
      const prescriptionsList: Prescription[] = [];
      const labResultsList: LabResult[] = [];
      
      allRecords.forEach((r: any) => {
        if (r.type === 'prescription') {
          prescriptionsList.push({
            id: r.id,
            medications: r.prescriptionItems || [],
            notes: r.description || '',
            status: r.status || 'pending',
            createdAt: r.date || r.createdAt,
            doctor: {
              firstName: r.doctor?.split(' ')[0] || 'Doctor',
              lastName: r.doctor?.split(' ')[1] || ''
            }
          });
        } else if (r.type === 'lab_report' || r.type === 'lab_order') {
          labResultsList.push({
            id: r.id,
            testName: r.title || 'Lab Test',
            result: r.description || 'Pending',
            normalRange: 'N/A',
            status: r.status || 'pending',
            performedAt: r.date || r.createdAt,
            notes: r.description || ''
          });
        } else {
          medicalHistory.push({
            id: r.id,
            diagnosis: r.diagnosis || r.title || 'N/A',
            treatment: r.treatment || r.description || '',
            notes: r.description || r.notes || '',
            createdAt: r.date || r.recordDate || r.createdAt,
            doctor: {
              firstName: r.doctor?.split(' ')[0] || 'Doctor',
              lastName: r.doctor?.split(' ')[1] || '',
              specialization: 'General'
            }
          });
        }
      });
      
      setMedicalRecords(medicalHistory);
      setPrescriptions(prescriptionsList);
      setLabResults(labResultsList);
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
      setMedicalRecords([]);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get(`/pharmacy/prescriptions/patient/${patientId}`);
      const prescriptionData = res.data || [];
      setPrescriptions(prescriptionData.map((p: any) => ({
        id: p.id,
        medications: p.items || p.medications || [],
        notes: p.notes || '',
        status: p.status || 'pending',
        createdAt: p.createdAt,
        doctor: {
          firstName: p.doctor?.firstName || 'Doctor',
          lastName: p.doctor?.lastName || ''
        }
      })));
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      setPrescriptions([]);
    }
  };

  const fetchLabResults = async () => {
    try {
      const res = await api.get(`/laboratory/orders/patient/${patientId}`);
      const orders = res.data || [];
      const results: LabResult[] = [];
      orders.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            if (item.result) {
              results.push({
                id: item.id,
                testName: item.test?.name || 'Lab Test',
                result: item.result?.resultValue || 'Pending',
                normalRange: item.result?.referenceRange || 'N/A',
                status: item.status || 'pending',
                performedAt: item.result?.resultTime || order.createdAt,
                notes: item.result?.comments || ''
              });
            }
          });
        }
      });
      setLabResults(results);
    } catch (error) {
      console.error('Failed to fetch lab results:', error);
      setLabResults([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/appointments?patientId=${patientId}`);
      const appointmentData = res.data || [];
      setAppointments(appointmentData.map((a: any) => ({
        id: a.id,
        date: a.startTime || a.date,
        time: a.startTime ? moment(a.startTime).format('hh:mm A') : (a.time || ''),
        service: {
          name: a.service?.name || 'Consultation'
        },
        doctor: {
          firstName: a.doctor?.firstName || 'Doctor',
          lastName: a.doctor?.lastName || '',
          specialization: a.doctor?.specialization || 'General'
        },
        status: a.status || 'pending',
        notes: a.notes || a.reason || ''
      })));
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
    }
  };

  const fetchVitalSigns = async () => {
    try {
      const res = await api.get(`/inpatient/admissions`);
      const patientAdmissions = (res.data || []).filter((a: any) => a.patientId === patientId);
      const vitals: VitalSign[] = [];
      patientAdmissions.forEach((admission: any) => {
        if (admission.vitalSigns && Array.isArray(admission.vitalSigns)) {
          vitals.push(...admission.vitalSigns.map((v: any) => ({
            id: v.id,
            bloodPressure: v.bloodPressure || 'N/A',
            heartRate: v.heartRate || 0,
            temperature: v.temperature || 0,
            respiratoryRate: v.respiratoryRate || 0,
            oxygenSaturation: v.oxygenSaturation || 0,
            recordedAt: v.recordedAt || v.createdAt
          })));
        }
      });
      setVitalSigns(vitals);
    } catch (error) {
      console.error('Failed to fetch vital signs:', error);
      setVitalSigns([]);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const duration = moment.duration(moment(expiresAt).diff(moment()));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes() % 60);
    
    if (hours < 1) {
      return { text: `${minutes}m`, color: 'red' };
    } else if (hours < 4) {
      return { text: `${hours}h ${minutes}m`, color: 'orange' };
    } else if (hours < 24) {
      return { text: `${hours}h`, color: 'blue' };
    } else {
      const days = Math.floor(duration.asDays());
      return { text: `${days}d`, color: 'green' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading patient records...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <Card>
        <Alert
          message="Access Denied"
          description="You do not have permission to view this patient's records. The access may have expired or been revoked."
          type="error"
          showIcon
          icon={<WarningOutlined />}
        />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/doctor/shared-patients')}
          style={{ marginTop: 16 }}
        >
          Back to Shared Patients
        </Button>
      </Card>
    );
  }

  if (!patientInfo) {
    return (
      <Empty description="Patient not found">
        <Button onClick={() => navigate('/doctor/shared-patients')}>
          Back to Shared Patients
        </Button>
      </Empty>
    );
  }

  const age = moment().diff(moment(patientInfo.dateOfBirth), 'years');

  return (
    <div style={{ padding: 24 }}>
      {/* Header with Back Button */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/doctor/shared-patients')}
        style={{ marginBottom: 16 }}
      >
        Back to Shared Patients
      </Button>

      {/* Access Info Alert */}
      {accessInfo && (
        <Alert
          message={
            <Space>
              <EyeOutlined />
              <Text strong>Temporary Access - Read Only</Text>
            </Space>
          }
          description={
            <Space direction="vertical" size={4}>
              <Text>
                <strong>Reason:</strong> {accessInfo.reason}
              </Text>
              <Text>
                <strong>Granted:</strong> {moment(accessInfo.grantedAt).format('MMM DD, YYYY hh:mm A')}
              </Text>
              <Text>
                <strong>Expires:</strong> {moment(accessInfo.expiresAt).format('MMM DD, YYYY hh:mm A')}
                {' '}
                <Tag color={getTimeRemaining(accessInfo.expiresAt).color}>
                  {getTimeRemaining(accessInfo.expiresAt).text} remaining
                </Tag>
              </Text>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Patient Basic Info Card */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={18}>
            <Title level={3} style={{ marginTop: 0 }}>
              <UserOutlined /> {patientInfo.firstName} {patientInfo.lastName}
            </Title>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Patient ID">
                <Tag color="blue">{patientInfo.globalPatientId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Age/Gender">
                {age} years / {patientInfo.gender}
              </Descriptions.Item>
              <Descriptions.Item label="Blood Group">
                <Tag color="red">{patientInfo.bloodGroup || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                <EnvironmentOutlined /> {patientInfo.registeredLocation}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <MailOutlined /> {patientInfo.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <PhoneOutlined /> {patientInfo.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                <CalendarOutlined /> {moment(patientInfo.dateOfBirth).format('MMM DD, YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={6}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small">
                  <Statistic
                    title="Medical Records"
                    value={medicalRecords.length}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ fontSize: 24 }}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card size="small">
                  <Statistic
                    title="Prescriptions"
                    value={prescriptions.length}
                    prefix={<MedicineBoxOutlined />}
                    valueStyle={{ fontSize: 24 }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Tabs for Different Sections */}
      <Card>
        <Tabs defaultActiveKey="medical-history">
          {/* Medical History Tab */}
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Medical History
              </span>
            }
            key="medical-history"
          >
            {medicalRecords.length === 0 ? (
              <Empty description="No medical records found" />
            ) : (
              <Timeline mode="left">
                {medicalRecords.map((record) => (
                  <Timeline.Item
                    key={record.id}
                    label={moment(record.createdAt).format('MMM DD, YYYY')}
                    color="blue"
                  >
                    <Card size="small">
                      <Text strong style={{ fontSize: 16 }}>{record.diagnosis}</Text>
                      <Divider style={{ margin: '8px 0' }} />
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text><strong>Treatment:</strong> {record.treatment}</Text>
                        <Text type="secondary">{record.notes}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          By: Dr. {record.doctor.firstName} {record.doctor.lastName} ({record.doctor.specialization})
                        </Text>
                      </Space>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </TabPane>

          {/* Prescriptions Tab */}
          <TabPane
            tab={
              <span>
                <MedicineBoxOutlined />
                Prescriptions
              </span>
            }
            key="prescriptions"
          >
            {prescriptions.length === 0 ? (
              <Empty description="No prescriptions found" />
            ) : (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {prescriptions.map((prescription) => (
                  <Card
                    key={prescription.id}
                    size="small"
                    title={
                      <Space>
                        <Text>Prescription</Text>
                        <Tag color={prescription.status === 'dispensed' ? 'green' : 'orange'}>
                          {prescription.status}
                        </Tag>
                      </Space>
                    }
                    extra={moment(prescription.createdAt).format('MMM DD, YYYY')}
                  >
                    <Table
                      size="small"
                      dataSource={prescription.medications}
                      pagination={false}
                      columns={[
                        { 
                          title: 'Medication', 
                          key: 'name',
                          render: (record: any) => (
                            <div>
                              <Text strong>{record.medicine?.name || record.name || 'N/A'}</Text>
                              {record.medicine?.strength && (
                                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                  {record.medicine.strength} {record.medicine.dosageForm}
                                </Text>
                              )}
                            </div>
                          )
                        },
                        { title: 'Dosage', dataIndex: 'dosage', key: 'dosage' },
                        { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
                        { title: 'Duration', dataIndex: 'duration', key: 'duration' },
                      ]}
                    />
                    {prescription.notes && (
                      <Alert
                        message="Notes"
                        description={prescription.notes}
                        type="info"
                        style={{ marginTop: 12 }}
                      />
                    )}
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                      Prescribed by: Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                    </Text>
                  </Card>
                ))}
              </Space>
            )}
          </TabPane>

          {/* Lab Results Tab */}
          <TabPane
            tab={
              <span>
                <ExperimentOutlined />
                Lab Results
              </span>
            }
            key="lab-results"
          >
            {labResults.length === 0 ? (
              <Empty description="No lab results found" />
            ) : (
              <Table
                dataSource={labResults}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                columns={[
                  {
                    title: 'Test Name',
                    dataIndex: 'testName',
                    key: 'testName',
                  },
                  {
                    title: 'Result',
                    dataIndex: 'result',
                    key: 'result',
                    render: (text) => <Text strong>{text}</Text>,
                  },
                  {
                    title: 'Normal Range',
                    dataIndex: 'normalRange',
                    key: 'normalRange',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status) => (
                      <Tag color={status === 'normal' ? 'green' : status === 'abnormal' ? 'red' : 'orange'}>
                        {status}
                      </Tag>
                    ),
                  },
                  {
                    title: 'Date',
                    dataIndex: 'performedAt',
                    key: 'performedAt',
                    render: (date) => moment(date).format('MMM DD, YYYY'),
                  },
                ]}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ padding: 16, background: '#f5f5f5' }}>
                      <Text strong>Notes:</Text>
                      <p>{record.notes || 'No additional notes'}</p>
                    </div>
                  ),
                }}
              />
            )}
          </TabPane>

        </Tabs>
      </Card>

      {/* Footer Note */}
      <Alert
        message="Read-Only Access"
        description="You are viewing this patient's records with temporary shared access. You cannot modify any information. All your actions are logged for security and compliance."
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ marginTop: 24 }}
      />
    </div>
  );
};

export default SharedPatientDetail;
