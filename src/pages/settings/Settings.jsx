import { useState, useEffect } from 'react';
import { Card, Input, Button, message, Row, Col, Typography, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import HeaderComponent from '../../components/HeaderComponent';
import { DEFAULT_DEVICE_ID, broadcastDeviceIdChange } from '../../constants/device';

const { Title, Text } = Typography;

function Settings() {
  const [deviceId, setDeviceId] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const savedDeviceId = localStorage.getItem('deviceId') || DEFAULT_DEVICE_ID;
    setDeviceId(savedDeviceId);

    const handleDeviceIdChange = (event) => {
      if (event?.detail) {
        setDeviceId(event.detail);
      }
    };

    window.addEventListener('deviceIdChange', handleDeviceIdChange);
    return () => {
      window.removeEventListener('deviceIdChange', handleDeviceIdChange);
    };
  }, []);

  const handleSave = () => {
    if (!deviceId.trim()) {
      messageApi.error('디바이스 ID를 입력해주세요');
      return;
    }
    const nextId = deviceId.trim();
    localStorage.setItem('deviceId', nextId);
    setDeviceId(nextId);
    broadcastDeviceIdChange(nextId);
    messageApi.success(`디바이스 ID가 "${nextId}"로 저장되었습니다.`);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {contextHolder}
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
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="디바이스 ID를 입력하세요"
                  style={{
                    fontSize: '16px',
                    height: '40px',
                    borderRadius: '8px'
                  }}
                />
              </Col>
              <Col xs={24} sm={4} md={4}>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSave}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  저장
                </Button>
              </Col>
            </Row>
            
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                💡 입력한 디바이스 ID를 사용하여 정보를 받습니다.
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
