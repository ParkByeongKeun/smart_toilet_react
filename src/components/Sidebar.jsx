import { Layout, Menu } from 'antd';
import { HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const { Sider } = Layout;

function Sidebar({ isMobile = false, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      key: '1', 
      icon: <HomeOutlined />, 
      label: isMobile ? '홈' : <Link to="/">홈</Link>,
      onClick: isMobile ? () => { navigate('/'); onMenuClick && onMenuClick(); } : undefined
    },
    { 
      key: '2', 
      icon: <UserOutlined />, 
      label: isMobile ? '사용자' : <Link to="/users">사용자</Link>,
      onClick: isMobile ? () => { navigate('/users'); onMenuClick && onMenuClick(); } : undefined
    },
    { 
      key: '3', 
      icon: <SettingOutlined />, 
      label: isMobile ? '설정' : <Link to="/settings">설정</Link>,
      onClick: isMobile ? () => { navigate('/settings'); onMenuClick && onMenuClick(); } : undefined
    },
  ];

  const selectedKey = menuItems.find(
    (item) => {
      if (isMobile) {
        return item.key === (location.pathname === '/' ? '1' : 
                           location.pathname === '/users' ? '2' : 
                           location.pathname === '/settings' ? '3' : '1');
      }
      return item.label.props?.to === location.pathname;
    }
  )?.key;

  if (isMobile) {
    return (
      <div style={{ height: '100%', backgroundColor: '#ffffff' }}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 24,
            background: '#ffffff',
            color: '#111827',
            fontSize: 20,
            fontWeight: 'bold',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          Smart Toilet
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{
            height: 'calc(100% - 64px)',
            borderRight: 0,
            backgroundColor: '#ffffff',
          }}
          theme="light"
          items={menuItems}
        />
      </div>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={200}
      theme="light"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        backgroundColor: '#ffffff',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          paddingLeft: collapsed ? 0 : 24,
          background: '#ffffff',
          color: '#111827',
          fontSize: 20,
          fontWeight: 'bold',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {collapsed ? 'ST' : 'Smart Toilet'}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{
          height: 'calc(100% - 64px)',
          borderRight: 0,
          backgroundColor: '#ffffff',
        }}
        theme="light"
        items={menuItems}
      />
    </Sider>
  );
}

export default Sidebar;
