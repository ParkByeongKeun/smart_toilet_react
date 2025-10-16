import { Layout, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

function HeaderComponent() {
  const navigate = useNavigate();

  // 화면 크기에 따른 반응형 설정
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = window.innerWidth >= 1024;

  return (
    <div>
      {/* Main Header */}
      <Header
        style={{
          background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
          padding: isMobile ? '0 12px' : isTablet ? '0 20px' : '0 32px',
          height: isMobile ? '48px' : isTablet ? '60px' : '80px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
          minHeight: isMobile ? '48px' : isTablet ? '60px' : '80px',
          flexWrap: 'nowrap',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              fontSize: isMobile ? '16px' : isTablet ? '24px' : '32px',
              fontWeight: '700',
              color: '#1f2937',
              fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              letterSpacing: isMobile ? '0.2px' : isTablet ? '0.5px' : '1px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            SMART TOILET
          </div>
        </div>

        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          flexShrink: 1,
          minWidth: 0,
          overflow: isMobile ? 'auto' : 'visible'
        }}>
          <div 
            className={isMobile ? 'mobile-menu-scroll' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : isTablet ? '12px' : '16px',
              overflowX: isMobile ? 'auto' : 'visible',
              overflowY: 'hidden',
              whiteSpace: 'nowrap',
              padding: isMobile ? '0 8px' : '0',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
          <span 
            style={{ 
              color: '#374151', 
              fontWeight: 700, 
              fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.target.style.color = '#1890ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.target.style.color = '#374151';
              }
            }}
          >
            HOME
          </span>
          <span 
            style={{ 
              color: '#6b7280', 
              fontWeight: 400, 
              fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
              cursor: 'default',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            소개
          </span>
          <span 
            style={{ 
              color: '#6b7280', 
              fontWeight: 400, 
              fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
              cursor: 'default',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            문의하기
          </span>
          <span 
            style={{ 
              color: '#374151', 
              fontWeight: 700, 
              fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={() => navigate('/settings')}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.target.style.color = '#1890ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.target.style.color = '#374151';
              }
            }}
          >
            환경 설정
          </span>
          <span 
            style={{ 
              color: '#6b7280', 
              fontWeight: 500, 
              fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
              cursor: 'default',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            로그인 / 회원가입
          </span>
          </div>
        </div>
      </Header>

    </div>
  );
}

export default HeaderComponent;
