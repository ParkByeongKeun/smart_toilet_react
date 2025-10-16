import { useState } from 'react';
import { Card, Input, Button, message, Row, Col, Typography, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import HeaderComponent from '../../components/HeaderComponent';

const { Title, Text } = Typography;

function Settings() {
  const [deviceId, setDeviceId] = useState('device_1_ac');

  const handleSave = () => {
    // 디바이스 ID 저장 로직 (로컬 스토리지 또는 API 호출)
    localStorage.setItem('deviceId', deviceId);
    message.success('디바이스 ID가 저장되었습니다!');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <HeaderComponent />
      <div 
        className="bg-gradient-to-b from-gray-50 to-gray-100"
        style={{ 
          padding: window.innerWidth < 768 ? '16px 12px' : '24px',
          paddingTop: window.innerWidth < 768 ? '16px' : '24px',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '32px', color: '#1f2937' }}>
            환경 설정
          </Title>

          <Card
            style={{
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8} md={6}>
                <Text strong style={{ fontSize: '16px' }}>
                  디바이스 ID:
                </Text>
              </Col>
              <Col xs={24} sm={12} md={14}>
                <Input
                  value={deviceId}
                  readOnly
                  placeholder="디바이스 ID"
                  style={{
                    fontSize: '16px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed'
                  }}
                />
              </Col>
              <Col xs={24} sm={4} md={4}>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  disabled
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                  }}
                >
                  확인
                </Button>
              </Col>
            </Row>
            
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                💡 입력 디바이스 ID를 사용하여 정보를 받습니다.
                예: {deviceId}/data/temp, {deviceId}/control
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Settings;