import { Layout, Menu } from 'antd';
import { HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const { Sider } = Layout;

const menuItems = [
  { key: '1', icon: <HomeOutlined />, label: <Link to="/">홈</Link> },
  { key: '2', icon: <UserOutlined />, label: <Link to="/users">사용자</Link> },
  { key: '3', icon: <SettingOutlined />, label: <Link to="/settings">설정</Link> },
];

function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = menuItems.find(
    (item) => item.label.props.to === location.pathname
  )?.key;

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={200}
      theme="light" // ✅ light 테마 설정
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        backgroundColor: '#ffffff', // ✅ 흰 배경
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
          background: '#ffffff', // ✅ 흰 배경
          color: '#111827',       // ✅ 다크 그레이 텍스트
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
        theme="light" // ✅ 메뉴도 밝은 테마
        items={menuItems}
      />
    </Sider>
  );
}

export default Sidebar;
