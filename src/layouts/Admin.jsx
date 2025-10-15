// src/layouts/Admin.jsx
import { Layout, Spin } from 'antd';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from 'src/components/Sidebar';
import HeaderComponent from 'src/components/HeaderComponent';
import { routes } from 'src/routes';

const { Header, Content } = Layout;

function Admin() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <HeaderComponent />
        </Header>
        <Content style={{ margin: '16px' }}>
          <Routes>
            {routes.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Admin;