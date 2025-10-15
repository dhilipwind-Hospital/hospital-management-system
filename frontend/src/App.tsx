import React, { useEffect } from 'react';
import './styles/darkTheme.css';
import './styles/settings.css';
import './styles/adminOverrides.css';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalErrorHandler from './components/GlobalErrorHandler';
import { RouterProvider, createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { publicTheme, defaultTheme } from './themes/publicTheme';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PublicLayout from './components/PublicLayout';
import HomeReference from './pages/public/HomeReference';
import About from './pages/public/About';
import Departments from './pages/public/Departments';
import DepartmentsNew from './pages/public/DepartmentsNew';
import Doctors from './pages/public/Doctors';
import Services from './pages/public/Services';
import ServicesNew from './pages/public/ServicesNew';
import RequestCallback from './pages/public/RequestCallback';
import HealthPackages from './pages/public/HealthPackages';
import Announcements from './pages/public/Announcements';
import BookAppointment from './pages/public/BookAppointment';
import BookAppointmentEnhanced from './pages/public/BookAppointmentEnhanced';
import BookAppointmentWizard from './pages/public/BookAppointmentWizard';
import Emergency from './pages/public/Emergency';
import EmergencyNew from './pages/public/EmergencyNew';
import FirstAid from './pages/public/FirstAid';
import Insurance from './pages/public/Insurance';
import Login from './pages/Login';
import LoginNew from './pages/LoginNew';
import RegisterPage from './pages/RegisterPage';
import RegisterStepper from './pages/RegisterStepper';
import ReviewAccessRequest from './pages/public/ReviewAccessRequest';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import PatientDetailEnhanced from './pages/patients/PatientDetailEnhanced';
import Layout from './components/Layout';
import RequireRole from './components/RequireRole';
import ServicesAdmin from './pages/admin/ServicesAdmin';
import DoctorsAdmin from './pages/admin/DoctorsAdmin';
import DepartmentsAdmin from './pages/admin/DepartmentsAdmin';
import ReportsAdmin from './pages/admin/ReportsAdmin';
import AppointmentsAdmin from './pages/admin/AppointmentsAdmin';
import EmergencyRequestsAdmin from './pages/admin/EmergencyRequestsAdmin';
import CallbackRequestsAdmin from './pages/admin/CallbackRequestsAdmin';
import EmergencyDashboard from './pages/admin/EmergencyDashboard';
import CallbackQueue from './pages/admin/CallbackQueue';
import Notifications from './pages/Notifications';
import MyAppointments from './pages/appointments/MyAppointments';
import BookAppointmentAuth from './pages/appointments/BookAppointmentAuth';
import BookAppointmentStepper from './pages/appointments/BookAppointmentStepper';
import PatientDashboard from './pages/portal/PatientDashboard';
import MyInsurance from './pages/portal/MyInsurance';
import MedicalRecords from './pages/portal/MedicalRecords';
import MedicalHistory from './pages/portal/MedicalHistory';
import BillingHistory from './pages/portal/BillingHistory';
import ViewDoctorAvailability from './pages/availability/ViewDoctorAvailability';
import Records from './pages/Records';
import Pharmacy from './pages/Pharmacy';
import PharmacyDashboard from './pages/PharmacyDashboard';
import MedicineList from './pages/pharmacy/MedicineList';
import InventoryDashboard from './pages/pharmacy/InventoryDashboard';
import StockAlerts from './pages/pharmacy/StockAlerts';
import SupplierManagement from './pages/pharmacy/SupplierManagement';
import PurchaseOrders from './pages/pharmacy/PurchaseOrders';
import InventoryReports from './pages/pharmacy/InventoryReports';
import Messaging from './pages/communication/Messaging';
import Reminders from './pages/communication/Reminders';
import HealthArticles from './pages/communication/HealthArticles';
import Feedback from './pages/communication/Feedback';

// Laboratory Management
import LabDashboard from './pages/laboratory/LabDashboard';
import TestCatalog from './pages/laboratory/TestCatalog';
import OrderLabTest from './pages/laboratory/OrderLabTest';
import SampleCollection from './pages/laboratory/SampleCollection';
import ResultsEntry from './pages/laboratory/ResultsEntry';
import PatientLabResults from './pages/laboratory/PatientLabResults';
import DoctorLabResults from './pages/laboratory/DoctorLabResults';

// Inpatient Management
import BedManagement from './pages/inpatient/BedManagement';
import WardOverview from './pages/inpatient/WardOverview';
import PatientAdmission from './pages/inpatient/PatientAdmission';
import NursingCare from './pages/inpatient/NursingCare';
import DoctorRounds from './pages/inpatient/DoctorRounds';
import DischargeSummary from './pages/inpatient/DischargeSummary';
import AdmissionDetails from './pages/inpatient/AdmissionDetails';
import WardManagement from './pages/admin/inpatient/WardManagement';
import RoomManagement from './pages/admin/inpatient/RoomManagement';

import Settings from './pages/settings/Settings';
import MyProfile from './pages/profile/MyProfile';
import Forbidden from './pages/Forbidden';
import PatientRecordsDoctor from './pages/doctor/PatientRecords';
import MyPatients from './pages/doctor/MyPatients';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import WritePrescription from './pages/doctor/WritePrescription';
import DoctorMedicines from './pages/doctor/Medicines';
import ConsultationForm from './pages/doctor/ConsultationForm';
import MySchedule from './pages/doctor/MySchedule';
import SharedPatients from './pages/doctor/SharedPatients';
import SharedPatientDetail from './pages/doctor/SharedPatientDetail';
import RequestExternalAccess from './pages/doctor/RequestExternalAccess';
import PendingAccessRequests from './pages/portal/PendingAccessRequests';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  // Check for user preferences on app load
  useEffect(() => {
    // Try to load theme preference from localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    }
    
    // Try to load font size preference from localStorage
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else if (storedFontSize === 'small') {
      document.documentElement.style.fontSize = '14px';
    }
    
    // Try to load high contrast preference from localStorage
    const highContrast = localStorage.getItem('highContrast') === 'true';
    if (highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    }
  }, []);
  
  const RoleHome: React.FC = () => {
    const { user } = useAuth();
    
    // If no user is logged in, redirect to public home page
    if (!user) {
      return <Navigate to="/home" replace />;
    }
    
    const role = String(user?.role || '').toLowerCase();
    
    if (role === 'pharmacist') {
      return <Navigate to="/pharmacy" replace />;
    } else if (role && role !== 'admin' && role !== 'super_admin' && role !== 'doctor') {
      return <Navigate to="/portal" replace />;
    }
    return <Dashboard />;
  };
  const AdminAppointmentsRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const role = String(user?.role || '').toLowerCase();
    if (role === 'admin' || role === 'super_admin') {
      return <Navigate to="/admin/appointments" replace />;
    }
    if (role === 'pharmacist') {
      return <Navigate to="/pharmacy" replace />;
    }
    return <>{children}</>;
  };
  // Theme wrapper component
  const ThemedOutlet: React.FC = () => {
    // Apply pink theme to ALL pages in the application
    return (
      <ConfigProvider theme={publicTheme}>
        <Outlet />
      </ConfigProvider>
    );
  };

  const router = createBrowserRouter([
    {
      element: (
        <AuthProvider>
          <ThemedOutlet />
        </AuthProvider>
      ),
      children: [
        // Public
        { path: '/home', element: <PublicLayout><HomeReference /></PublicLayout> },
        { path: '/about', element: <PublicLayout><About /></PublicLayout> },
        { path: '/departments', element: <PublicLayout><DepartmentsNew /></PublicLayout> },
        { path: '/departments-old', element: <PublicLayout><Departments /></PublicLayout> },
        { path: '/doctors', element: <PublicLayout><Doctors /></PublicLayout> },
        { path: '/health-packages', element: <PublicLayout><HealthPackages /></PublicLayout> },
        { path: '/services', element: <PublicLayout><ServicesNew /></PublicLayout> },
        { path: '/services-old', element: <PublicLayout><Services /></PublicLayout> },
        { path: '/insurance', element: <PublicLayout><Insurance /></PublicLayout> },
        { path: '/appointments/book', element: <PublicLayout><BookAppointmentWizard /></PublicLayout> },
        { path: '/emergency', element: <PublicLayout><EmergencyNew /></PublicLayout> },
        { path: '/emergency-old', element: <PublicLayout><Emergency /></PublicLayout> },
        { path: '/first-aid', element: <PublicLayout><FirstAid /></PublicLayout> },
        { path: '/request-callback', element: <PublicLayout><RequestCallback /></PublicLayout> },
        { path: '/login', element: <LoginNew /> },
        { path: '/login-old', element: <Login /> },
        { path: '/register', element: <RegisterStepper /> },
        { path: '/review-access-request', element: <ReviewAccessRequest /> },

        // App
        { path: '/', element: <Layout><RoleHome /></Layout> },
        { path: '/patients', element: <Layout><RequireRole roles={['admin','super_admin']}><PatientList /></RequireRole></Layout> },
        { path: '/records', element: <Layout><RequireRole roles={['admin','super_admin']}><Records /></RequireRole></Layout> },
        { path: '/pharmacy', element: <Layout><RequireRole roles={['admin','super_admin','pharmacist']}><PharmacyDashboard /></RequireRole></Layout> },
        { path: '/pharmacy/medicines', element: <Layout><RequireRole roles={['admin','super_admin','pharmacist']}><MedicineList /></RequireRole></Layout> },
        { path: '/pharmacy/inventory', element: <Layout><RequireRole roles={['admin','super_admin','pharmacist']}><InventoryDashboard /></RequireRole></Layout> },
        { path: '/pharmacy/inventory/alerts', element: <Layout><RequireRole roles={['admin','super_admin','pharmacist']}><StockAlerts /></RequireRole></Layout> },
        { path: '/pharmacy/suppliers', element: <Layout><RequireRole roles={['admin','super_admin','pharmacist']}><SupplierManagement /></RequireRole></Layout> },
        { path: '/pharmacy/purchase-orders', element: <Layout><RequireRole roles={['admin','super_admin','pharmacist']}><PurchaseOrders /></RequireRole></Layout> },
        { path: '/pharmacy/inventory/reports', element: <Layout><RequireRole roles={['admin','super_admin','pharmacist']}><InventoryReports /></RequireRole></Layout> },
        { path: '/communication/messages', element: <Layout><Messaging /></Layout> },
        { path: '/communication/reminders', element: <Layout><Reminders /></Layout> },
        { path: '/communication/health-articles', element: <Layout><HealthArticles /></Layout> },
        { path: '/communication/feedback', element: <Layout><Feedback /></Layout> },
        
        // Laboratory Management routes
        { path: '/laboratory/dashboard', element: <Layout><LabDashboard /></Layout> },
        { path: '/laboratory/tests', element: <Layout><TestCatalog /></Layout> },
        { path: '/laboratory/order', element: <Layout><OrderLabTest /></Layout> },
        { path: '/laboratory/results', element: <Layout><DoctorLabResults /></Layout> },
        { path: '/laboratory/sample-collection', element: <Layout><SampleCollection /></Layout> },
        { path: '/laboratory/results-entry', element: <Layout><ResultsEntry /></Layout> },
        { path: '/laboratory/my-results', element: <Layout><PatientLabResults /></Layout> },
        
        // Inpatient Management routes
        { path: '/inpatient/beds', element: <Layout><RequireRole roles={['admin','super_admin','nurse']}><BedManagement /></RequireRole></Layout> },
        { path: '/inpatient/wards', element: <Layout><RequireRole roles={['admin','super_admin','nurse','doctor']}><WardOverview /></RequireRole></Layout> },
        { path: '/inpatient/admissions/new', element: <Layout><RequireRole roles={['doctor','nurse']}><PatientAdmission /></RequireRole></Layout> },
        { path: '/inpatient/admissions/:id', element: <Layout><RequireRole roles={['doctor','nurse','admin','super_admin']}><AdmissionDetails /></RequireRole></Layout> },
        { path: '/inpatient/nursing', element: <Layout><RequireRole roles={['nurse']}><NursingCare /></RequireRole></Layout> },
        { path: '/inpatient/rounds', element: <Layout><RequireRole roles={['doctor']}><DoctorRounds /></RequireRole></Layout> },
        { path: '/inpatient/discharge/:id', element: <Layout><RequireRole roles={['doctor']}><DischargeSummary /></RequireRole></Layout> },
        
        // Inpatient Admin routes
        { path: '/admin/inpatient/wards', element: <Layout><RequireRole roles={['admin','super_admin']}><WardManagement /></RequireRole></Layout> },
        { path: '/admin/inpatient/rooms', element: <Layout><RequireRole roles={['admin','super_admin']}><RoomManagement /></RequireRole></Layout> },
        
        { path: '/settings', element: <Layout><Settings /></Layout> },
        { path: '/profile', element: <Layout><MyProfile /></Layout> },
        { path: '/appointments', element: <Layout><AdminAppointmentsRedirect><MyAppointments /></AdminAppointmentsRedirect></Layout> },
        { path: '/appointments/new', element: <Layout><BookAppointmentStepper /></Layout> },
        { path: '/patients/new', element: <Layout><PatientForm /></Layout> },
        { path: '/patients/:id/edit', element: <Layout><PatientForm /></Layout> },
        { path: '/patients/:id', element: <Layout><PatientDetailEnhanced /></Layout> },
        { path: '/portal', element: <Layout>
          <RequireRole roles={['patient', 'nurse', 'lab_technician', 'accountant', 'receptionist']}>
            <PatientDashboard />
          </RequireRole>
        </Layout> },
        { path: '/portal/records', element: <Layout><RequireRole roles={['patient', 'nurse', 'lab_technician', 'accountant', 'receptionist']}><MedicalRecords /></RequireRole></Layout> },
        { path: '/portal/medical-history', element: <Layout><RequireRole roles={['patient', 'nurse', 'lab_technician', 'accountant', 'receptionist']}><MedicalHistory /></RequireRole></Layout> },
        { path: '/portal/bills', element: <Layout><RequireRole roles={['patient', 'nurse', 'lab_technician', 'accountant', 'receptionist']}><BillingHistory /></RequireRole></Layout> },
        { path: '/portal/insurance', element: <Layout><RequireRole roles={['patient', 'nurse', 'lab_technician', 'accountant', 'receptionist']}><MyInsurance /></RequireRole></Layout> },
        { path: '/doctor/my-patients', element: <Layout><RequireRole roles={['doctor']}><MyPatients /></RequireRole></Layout> },
        { path: '/doctor/patients/:patientId/records', element: <Layout><RequireRole roles={['doctor']}><PatientRecordsDoctor /></RequireRole></Layout> },
        { path: '/doctor/prescriptions', element: <Layout><RequireRole roles={['doctor']}><DoctorPrescriptions /></RequireRole></Layout> },
        { path: '/doctor/prescriptions/new', element: <Layout><RequireRole roles={['doctor']}><WritePrescription /></RequireRole></Layout> },
        { path: '/doctor/patients/:patientId/prescriptions/new', element: <Layout><RequireRole roles={['doctor']}><WritePrescription /></RequireRole></Layout> },
        { path: '/doctor/prescriptions/:id/edit', element: <Layout><RequireRole roles={['doctor']}><WritePrescription /></RequireRole></Layout> },
        { path: '/doctor/medicines', element: <Layout><RequireRole roles={['doctor']}><DoctorMedicines /></RequireRole></Layout> },
        { path: '/doctor/my-schedule', element: <Layout><RequireRole roles={['doctor']}><MySchedule /></RequireRole></Layout> },
        { path: '/doctor/shared-patients', element: <Layout><RequireRole roles={['doctor']}><SharedPatients /></RequireRole></Layout> },
        { path: '/doctor/shared-patients/:patientId', element: <Layout><RequireRole roles={['doctor']}><SharedPatientDetail /></RequireRole></Layout> },
        { path: '/doctor/request-external-access', element: <Layout><RequireRole roles={['doctor']}><RequestExternalAccess /></RequireRole></Layout> },
        { path: '/doctor/consultations/:appointmentId', element: <Layout><RequireRole roles={['doctor']}><ConsultationForm /></RequireRole></Layout> },

        // Patient Portal
        { path: '/portal/access-requests', element: <Layout><RequireRole roles={['patient']}><PendingAccessRequests /></RequireRole></Layout> },

        // Admin
        { path: '/admin/services', element: <Layout><RequireRole roles={['admin','super_admin']}><ServicesAdmin /></RequireRole></Layout> },
        { path: '/admin/doctors', element: <Layout><RequireRole roles={['admin','super_admin']}><DoctorsAdmin /></RequireRole></Layout> },
        { path: '/admin/departments', element: <Layout><RequireRole roles={['admin','super_admin']}><DepartmentsAdmin /></RequireRole></Layout> },
        { path: '/admin/reports', element: <Layout><RequireRole roles={['admin','super_admin']}><ReportsAdmin /></RequireRole></Layout> },
        { path: '/admin/appointments', element: <Layout><RequireRole roles={['admin','super_admin']}><AppointmentsAdmin /></RequireRole></Layout> },
        { path: '/admin/emergency-requests', element: <Layout><RequireRole roles={['admin','super_admin']}><EmergencyRequestsAdmin /></RequireRole></Layout> },
        { path: '/admin/emergency-dashboard', element: <Layout><RequireRole roles={['admin','super_admin','doctor','nurse']}><EmergencyDashboard /></RequireRole></Layout> },
        { path: '/admin/callback-requests', element: <Layout><RequireRole roles={['admin','super_admin']}><CallbackRequestsAdmin /></RequireRole></Layout> },
        { path: '/admin/callback-queue', element: <Layout><RequireRole roles={['admin','super_admin','receptionist','nurse']}><CallbackQueue /></RequireRole></Layout> },

        // Notifications
        { path: '/notifications', element: <Layout><Notifications /></Layout> },

        // Public view of a doctor's availability
        { path: '/doctors/:doctorId/availability', element: <PublicLayout><ViewDoctorAvailability /></PublicLayout> },
        { path: '/403', element: <Layout><Forbidden /></Layout> },

        // Fallback
        { path: '*', element: <Navigate to="/" replace /> }
      ]
    }
  ]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <AntApp>
        <ErrorBoundary>
          <SettingsProvider>
            <RouterProvider router={router} />
            <GlobalErrorHandler />
          </SettingsProvider>
        </ErrorBoundary>
      </AntApp>
    </GoogleOAuthProvider>
  );
};

export default App;
