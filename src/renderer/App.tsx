import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  WarningOutlined,
  SafetyOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import BoilerPage from './pages/boiler';
import ApplicationPage from './pages/application';
import SchedulePage from './pages/schedule';
import RecordPage from './pages/record';
import DefectPage from './pages/defect';
import CertificatePage from './pages/certificate';
import StatisticsPage from './pages/statistics';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: '/boiler',
      icon: <AppstoreOutlined />,
      label: '设备台账',
    },
    {
      key: '/application',
      icon: <FileTextOutlined />,
      label: '报检受理',
    },
    {
      key: '/schedule',
      icon: <CalendarOutlined />,
      label: '检验排期',
    },
    {
      key: '/record',
      icon: <FileSearchOutlined />,
      label: '检验记录',
    },
    {
      key: '/defect',
      icon: <WarningOutlined />,
      label: '缺陷处理',
    },
    {
      key: '/certificate',
      icon: <SafetyOutlined />,
      label: '证书签发',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '年度统计',
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      console.log('退出登录');
    }
  };

  const getSelectedKeys = () => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '') {
      return ['/boiler'];
    }
    return [pathname];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64, background: 'rgba(255,255,255,0.1)' }}>
          <SafetyOutlined
            style={{
              fontSize: collapsed ? 24 : 28,
              color: '#fff',
              marginRight: collapsed ? 0 : 8,
            }}
          />
          {!collapsed && (
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              锅炉检验系统
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <span style={{ color: '#4b5563', marginLeft: 16 }}>
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </span>
          </div>
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 4 }}>
              <Avatar icon={<UserOutlined />} size="small" />
              <span style={{ color: '#374151' }}>管理员</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '16px',
            overflow: 'initial',
            minHeight: 'calc(100vh - 64px - 32px)',
            background: '#f0f2f5',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/boiler" replace />} />
            <Route path="/boiler" element={<BoilerPage />} />
            <Route path="/application" element={<ApplicationPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/defect" element={<DefectPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="*" element={<Navigate to="/boiler" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
