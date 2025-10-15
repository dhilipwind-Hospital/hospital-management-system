import React, { useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Typography, theme, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  UserAddOutlined,
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  SettingOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  HomeOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import NotificationBell from './NotificationBell';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 1;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
`;

const StyledContent = styled(Content)`
  margin: 24px 16px;
  padding: 24px;
  min-height: 280px;
  background: #fff;
  border-radius: 8px;
`;

const AppLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try { return localStorage.getItem('hms_sider_collapsed') === '1'; } catch { return false; }
  });
  const { settings } = useSettings();
  
  // Use keyboard shortcuts
  useKeyboardShortcuts();
  
  // Apply settings when component mounts or settings change
  useEffect(() => {
    // Apply theme class to layout
    const layoutElement = document.querySelector('.app-layout');
    if (layoutElement) {
      // Remove existing theme classes
      layoutElement.classList.remove('theme-light', 'theme-dark');
      
      // Apply new theme class
      layoutElement.classList.add(`theme-${settings.theme}`);
      
      // Apply font size
      layoutElement.classList.remove('font-small', 'font-medium', 'font-large');
      layoutElement.classList.add(`font-${settings.fontSize}`);
      
      // Apply accessibility settings
      if (settings.accessibility.highContrastMode) {
        layoutElement.classList.add('high-contrast');
      } else {
        layoutElement.classList.remove('high-contrast');
      }
      
      if (settings.accessibility.reducedMotion) {
        layoutElement.classList.add('reduced-motion');
      } else {
        layoutElement.classList.remove('reduced-motion');
      }
      
      if (settings.accessibility.largeText) {
        layoutElement.classList.add('large-text');
      } else {
        layoutElement.classList.remove('large-text');
      }
    }
  }, [settings]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const location = useLocation();

  React.useEffect(() => {
    try { localStorage.setItem('hms_sider_collapsed', collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  const role = String(user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isDoctor = role === 'doctor';
  const isPharmacist = role === 'pharmacist';
  const isLabTech = role === 'lab_technician' || role === 'lab_supervisor';
  const isPatient = !isAdmin && !isDoctor && !isPharmacist && !isLabTech && !!role;

  const baseItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: isLabTech ? '/laboratory/dashboard' : '/',
    },
    {
      key: 'appointments',
      icon: <CalendarOutlined />,
      label: 'Appointments',
      path: '/appointments',
    },
    {
      key: 'book-appointment',
      icon: <CalendarOutlined />,
      label: 'Book Appointment',
      path: '/appointments/new',
    },
    {
      key: 'laboratory',
      icon: <ExperimentOutlined />,
      label: 'Laboratory',
      children: [
        // Doctor items
        ...(isDoctor ? [
          {
            key: 'lab-order',
            label: 'Order Lab Tests',
            path: '/laboratory/order',
          },
          {
            key: 'lab-results',
            label: 'View Lab Results',
            path: '/laboratory/results',
          },
        ] : []),
        // Lab Tech items
        ...(isLabTech || isAdmin ? [
          // Don't show Lab Dashboard for lab tech since main Dashboard already goes there
          ...(isAdmin ? [{
            key: 'lab-dashboard',
            label: 'Lab Dashboard',
            path: '/laboratory/dashboard',
          }] : []),
          {
            key: 'lab-sample-collection',
            label: 'Sample Collection',
            path: '/laboratory/sample-collection',
          },
          {
            key: 'lab-results-entry',
            label: 'Results Entry',
            path: '/laboratory/results-entry',
          },
        ] : []),
        // Patient items
        ...(isPatient ? [
          {
            key: 'lab-my-results',
            label: 'My Lab Results',
            path: '/laboratory/my-results',
          },
        ] : []),
        // Admin items
        ...(isAdmin ? [
          {
            key: 'lab-test-catalog',
            label: 'Test Catalog',
            path: '/laboratory/tests',
          },
        ] : []),
      ],
    },
    {
      key: 'records',
      icon: <FileTextOutlined />,
      label: 'Medical Records',
      path: '/records',
    },
    {
      key: 'patients',
      icon: <UserOutlined />,
      label: 'Patients',
      path: '/patients',
    },
    {
      key: 'medicines',
      icon: <MedicineBoxOutlined />,
      label: 'Pharmacy',
      path: '/pharmacy',
    },
    // Patient Portal - only for patients and staff who need patient access
    ...(!isLabTech ? [{
      key: 'portal',
      icon: <UserOutlined />,
      label: 'Patient Portal',
      path: '/portal',
    }] : []),
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      path: '/settings',
    },
  ];

  const adminOnlyItems = [
    {
      key: 'all-appointments',
      icon: <CalendarOutlined />,
      label: 'All Appointments',
      path: '/admin/appointments',
    },
    {
      key: 'callback-requests',
      icon: <FileTextOutlined />,
      label: 'Callback Requests',
      path: '/admin/callback-requests',
    },
    {
      key: 'departments-admin',
      icon: <TeamOutlined />,
      label: 'Departments (Admin)',
      path: '/admin/departments',
    },
    {
      key: 'emergency-requests',
      icon: <FileTextOutlined />,
      label: 'Emergency Requests',
      path: '/admin/emergency-requests',
    },
    {
      key: 'inpatient-management',
      icon: <HomeOutlined />,
      label: 'Inpatient Management',
      children: [
        {
          key: 'inpatient-wards',
          label: 'Wards',
          path: '/admin/inpatient/wards',
        },
        {
          key: 'inpatient-rooms',
          label: 'Rooms',
          path: '/admin/inpatient/rooms',
        },
        {
          key: 'inpatient-beds',
          label: 'Beds',
          path: '/inpatient/beds',
        },
      ],
    } as any,
    {
      key: 'staff',
      icon: <TeamOutlined />,
      label: 'Manage Doctors',
      path: '/admin/doctors',
    },
    {
      key: 'manage-services',
      icon: <MedicineBoxOutlined />,
      label: 'Manage Services',
      path: '/admin/services',
    },
    {
      key: 'reports',
      icon: <DashboardOutlined />,
      label: 'Reports',
      path: '/admin/reports',
    },
  ].sort((a, b) => a.label.localeCompare(b.label));

  let menuItems = isAdmin ? [...baseItems, ...adminOnlyItems] : baseItems;
  // Common hides
  if (isAdmin || isDoctor) {
    menuItems = menuItems.filter(item => item.key !== 'book-appointment');
  }
  // Admin-specific: hide end-user sections
  if (isAdmin) {
    menuItems = menuItems.filter(item => !['appointments', 'availability', 'portal'].includes(item.key));
  }
  // Doctor-specific: hide admin/staff-facing sections and add doctor menu items
  if (isDoctor) {
    menuItems = menuItems.filter(item => !['patients','records','medicines','portal','appointments'].includes(item.key));
    
    // Add doctor-specific menu items
    menuItems.splice(2, 0, {
      key: 'my-patients',
      icon: <UserOutlined />,
      label: 'My Patients',
      path: '/doctor/my-patients',
    });
    
    menuItems.splice(3, 0, {
      key: 'external-access',
      icon: <LockOutlined />,
      label: 'External Access',
      children: [
        {
          key: 'shared-patients',
          icon: <TeamOutlined />,
          label: 'Shared Patient Access',
          path: '/doctor/shared-patients',
        },
        {
          key: 'request-external-access',
          icon: <UserAddOutlined />,
          label: 'OTP Verification',
          path: '/doctor/request-external-access',
        },
      ],
    });
    
    menuItems.splice(4, 0, {
      key: 'my-schedule',
      icon: <ClockCircleOutlined />,
      label: 'My Schedule',
      path: '/doctor/my-schedule',
    });
  }
  // Pharmacist-specific: show only relevant items
  if (isPharmacist) {
    // Remove the dashboard item since we'll use medicines as the main dashboard
    menuItems = menuItems.filter(item => ['settings'].includes(item.key));
    
    // Add a custom pharmacy dashboard item at the top
    menuItems.unshift({
      key: 'pharmacy-dashboard',
      icon: <MedicineBoxOutlined />,
      label: 'Pharmacy',
      path: '/pharmacy',
    });
  }
  // Lab Tech-specific: show only lab-related items
  if (isLabTech) {
    menuItems = menuItems.filter(item => ['dashboard', 'laboratory', 'settings'].includes(item.key));
  }
  // Patient-specific: keep only relevant items and map Dashboard to Portal
  if (isPatient) {
    // Filter to allowed
    const allow = new Set(['dashboard','appointments','book-appointment','settings']);
    menuItems = menuItems.filter(item => allow.has(item.key));
    // Remap Dashboard to point at /portal and label it nicely
    menuItems = menuItems.map(mi => mi.key === 'dashboard' ? { ...mi, label: 'My Portal', path: '/portal' } : mi);
    
    // Add Access Requests menu item after appointments
    const appointmentsIndex = menuItems.findIndex(item => item.key === 'appointments');
    if (appointmentsIndex !== -1) {
      menuItems.splice(appointmentsIndex + 1, 0, {
        key: 'access-requests',
        icon: <LockOutlined />,
        label: 'Access Requests',
        path: '/portal/access-requests',
      });
    }
  }

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">Profile</Link> },
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: logout },
    ]
  };

  // Determine active key from current pathname
  const p = location.pathname;
  const activeKey = (
    p === '/' ? 'dashboard' :
    // For patients, treat /portal/access-requests specifically
    p.startsWith('/portal/access-requests') ? 'access-requests' :
    // For patients, treat /portal as dashboard
    (isPatient && p.startsWith('/portal')) ? 'dashboard' :
    // For pharmacists, highlight pharmacy-dashboard for /pharmacy
    (isPharmacist && p.startsWith('/pharmacy')) ? 'pharmacy-dashboard' :
    p.startsWith('/appointments/new') ? 'book-appointment' :
    p.startsWith('/appointments') ? 'appointments' :
    p.startsWith('/doctor/my-patients') ? 'my-patients' :
    p.startsWith('/doctor/shared-patients') ? 'shared-patients' :
    p.startsWith('/doctor/my-schedule') ? 'my-schedule' :
    p.startsWith('/patients') ? 'patients' :
    p.startsWith('/records') ? 'records' :
    p.startsWith('/pharmacy') ? 'medicines' :
    p.startsWith('/portal') ? 'portal' :
    p.startsWith('/availability') ? 'availability' :
    p.startsWith('/settings') ? 'settings' :
    p.startsWith('/admin/appointments') ? 'all-appointments' :
    p.startsWith('/admin/services') ? 'manage-services' :
    p.startsWith('/admin/doctors') ? 'staff' :
    p.startsWith('/admin/departments') ? 'departments-admin' :
    p.startsWith('/admin/emergency-requests') ? 'emergency-requests' :
    p.startsWith('/admin/callback-requests') ? 'callback-requests' :
    p.startsWith('/admin/inpatient/wards') ? 'inpatient-wards' :
    p.startsWith('/admin/inpatient/rooms') ? 'inpatient-rooms' :
    p.startsWith('/inpatient/beds') ? 'inpatient-beds' :
    undefined
  );

  return (
    <StyledLayout className="app-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        theme="light"
        breakpoint="lg"
        collapsedWidth={60}
        onBreakpoint={(broken) => { if (broken) setCollapsed(true); }}
      >
        <style>{`
          .ant-menu-light .ant-menu-item-selected {
            background-color: rgba(14,165,165,0.10) !important;
            color: ${token.colorPrimary} !important;
          }
          .ant-menu-light .ant-menu-item:hover {
            color: ${token.colorPrimary} !important;
          }
          .ant-menu-light .ant-menu-item-selected .ant-menu-item-icon,
          .ant-menu-light .ant-menu-item-selected a { color: ${token.colorPrimary} !important; }
          .ant-menu-light .ant-menu-item-selected::before {
            content: '';
            position: absolute;
            left: 0; top: 6px; bottom: 6px;
            width: 3px; border-radius: 3px; background: ${token.colorPrimary};
          }
        `}</style>
        <Logo>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px' }}>
              <img 
                src="/logo.png" 
                alt="Ayphen Hospital" 
                style={{ height: 40, width: 40, objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://ayphen-backend-bucket-test2.s3.eu-west-1.amazonaws.com/Vector.png';
                }}
              />
              <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>Ayphen Hospital</Title>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
              <img 
                src="/logo.png" 
                alt="A" 
                style={{ height: 32, width: 32, objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://ayphen-backend-bucket-test2.s3.eu-west-1.amazonaws.com/Vector.png';
                }}
              />
            </div>
          )}
        </Logo>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={activeKey ? [activeKey] : []}
          onClick={(info) => {
            // Find item in menuItems or in children
            let targetItem: any = menuItems.find(mi => mi.key === info.key);
            if (!targetItem) {
              // Check in children
              for (const item of menuItems) {
                if ((item as any).children) {
                  targetItem = (item as any).children.find((child: any) => child.key === info.key);
                  if (targetItem) break;
                }
              }
            }
            if (targetItem && targetItem.path) navigate(targetItem.path);
          }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: <span title={item.label}>{item.label}</span>,
            children: (item as any).children?.map((child: any) => ({
              key: child.key,
              label: <span title={child.label}>{child.label}</span>,
            })),
          }))}
        />
      </Sider>
      <Layout>
        <StyledHeader>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            <NotificationBell />
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              onClick={() => navigate('/settings')}
            />
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar src={(user as any)?.profileImage} icon={<UserOutlined />} />
                <span>{user?.firstName} {user?.lastName}</span>
              </Space>
            </Dropdown>
          </div>
        </StyledHeader>
        <div style={{ padding: '0 24px' }}>
          <Breadcrumb
            items={((): { title: React.ReactNode }[] => {
              const p = location.pathname;
              if (p === '/' || p === '') return [{ title: 'Dashboard' }];
              if (p.startsWith('/admin/')) {
                if (p.startsWith('/admin/appointments')) return [{ title: 'Admin' }, { title: 'Appointments' }];
                if (p.startsWith('/admin/services')) return [{ title: 'Admin' }, { title: 'Services' }];
                if (p.startsWith('/admin/doctors')) return [{ title: 'Admin' }, { title: 'Doctors' }];
                if (p.startsWith('/admin/departments')) return [{ title: 'Admin' }, { title: 'Departments' }];
                if (p.startsWith('/admin/emergency-requests')) return [{ title: 'Admin' }, { title: 'Emergency Requests' }];
                if (p.startsWith('/admin/callback-requests')) return [{ title: 'Admin' }, { title: 'Callback Requests' }];
              }
              if (p.startsWith('/appointments')) return [{ title: 'Appointments' }];
              if (p.startsWith('/patients/')) return [{ title: 'Patients' }, { title: 'Detail' }];
              if (p.startsWith('/patients')) return [{ title: 'Patients' }];
              if (p.startsWith('/records')) return [{ title: 'Medical Records' }];
              if (p.startsWith('/pharmacy')) return [{ title: 'Pharmacy' }];
              if (p.startsWith('/portal')) return [{ title: 'Patient Portal' }];
              if (p.startsWith('/settings')) return [{ title: 'Settings' }];
              return [];
            })()}
          />
        </div>
        <StyledContent>
          {children || <Outlet />}
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default AppLayout;
