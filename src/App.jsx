// src/App.jsx
import { Layout, Spin } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HeaderComponent from './components/HeaderComponent';
import { routes } from './routes';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar />
      <Layout>
        <HeaderComponent />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            minHeight: 280,
          }}
        >
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

export default App;