import { Layout, Typography, Button, Space, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

function HeaderComponent() {
  return (
    <Header
      style={{
        background: '#223344', // 💡 밝은 그레이블루 계열: 사이드바보다 살짝 밝음
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Title
        level={3}
        style={{
          margin: 0,
          color: '#f8fafc', // slate-50 느낌
          fontWeight: 600,
          fontSize: '20px',
        }}
      >
        스마트 화장실
      </Title>

      <Space size="middle" align="center">
        <Avatar
          icon={<UserOutlined />}
          style={{
            backgroundColor: '#3b82f6', // Tailwind sky-500 느낌
            border: '2px solid #60a5fa',
          }}
        />
        <span style={{ color: '#cbd5e1', fontWeight: 500 }}>관리자</span>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          style={{
            color: '#cbd5e1',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          로그아웃
        </Button>
      </Space>
    </Header>
  );
}

export default HeaderComponent;
