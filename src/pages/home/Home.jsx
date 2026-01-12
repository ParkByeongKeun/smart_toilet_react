import { Card, Statistic, Row, Col, Input, Button, message, Divider, Space, Progress, Modal } from 'antd';
import { 
  WomanOutlined, 
  ManOutlined, 
  TeamOutlined, 
  StopOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  PlusOutlined, 
  MinusOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import HeaderComponent from '../../components/HeaderComponent';
import { DEFAULT_DEVICE_ID } from '../../constants/device';

function Home() {
  const [messageApi, contextHolder] = message.useMessage();
  const [deviceId, setDeviceId] = useState(() => localStorage.getItem('deviceId') || DEFAULT_DEVICE_ID);
  const [inputValue, setInputValue] = useState('');
  const INITIAL_SENSOR_DATA = { temperature: null, humidity: null, pm10: null };
  const [sensorData, setSensorData] = useState(INITIAL_SENSOR_DATA);
  const resetSensorData = () => setSensorData(INITIAL_SENSOR_DATA);
  const client = useRef(null);
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  const MQTT_BROKER_URL = `${protocol}//${window.location.host}/mqtt`; //raspberry pi test
  useEffect(() => {
    const handleStorageChange = () => {
      const storedDeviceId = localStorage.getItem('deviceId') || DEFAULT_DEVICE_ID;
      setDeviceId(storedDeviceId);
    };

    const handleDeviceIdChange = (event) => {
      if (event?.detail) {
        setDeviceId(event.detail);
      } else {
        const storedDeviceId = localStorage.getItem('deviceId') || DEFAULT_DEVICE_ID;
        setDeviceId(storedDeviceId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('deviceIdChange', handleDeviceIdChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('deviceIdChange', handleDeviceIdChange);
    };
  }, []);
  // const MQTT_BROKER_URL = `wss://ijoon.iptime.org:25813/mqtt`;
  useEffect(() => {
    if (!deviceId) {
      messageApi.warning('디바이스 ID가 설정되지 않아 MQTT 연결을 건너뜁니다.');
      return undefined;
    }

    // 디바이스 변경 시 이전 센서 데이터를 초기화하여 다른 시리얼 값이 보이지 않도록 함
    resetSensorData();

    const sensorTopics = {
      temperature: `${deviceId}/data/temp`,
      humidity: `${deviceId}/data/humidity`,
      pm10: `${deviceId}/data/pm10`,
    };

    client.current = mqtt.connect(MQTT_BROKER_URL, {
      clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
      username: "ijoon",
      password: "vXH5iVMqTfXB",
      keepalive: 60,
      clean: false, // 세션 유지 (retain 메시지 수신을 위해)
      reconnectPeriod: 5000, // 재연결 주기
    });

    client.current.on('connect', () => {
      console.log('MQTT 연결 성공');
      console.log('브로커 URL:', MQTT_BROKER_URL);
      
      // retain 메시지를 받기 위해 QoS 1로 구독하고 약간의 지연 추가
      const topics = Object.values(sensorTopics);
      
      setTimeout(() => {
        topics.forEach((topic, index) => {
          setTimeout(() => {
            client.current.subscribe(topic, { qos: 1 }, (err) => {
              if (err) {
                console.error(`${topic} 구독 실패:`, err);
              } else {
                console.log(`${topic} 구독 성공 (QoS 1) - retain 메시지 대기중`);
              }
            });
          }, index * 50);
        });
        console.log('센서 토픽 구독 시작');
      }, 200);
    });

    client.current.on('message', (topic, payload) => {
      switch (topic) {
        case sensorTopics.temperature: {
          const tempData = parseFloat(payload.toString());
          console.log('온도 데이터 업데이트:', tempData);
          setSensorData(prev => ({ ...prev, temperature: tempData }));
          break;
        }
        case sensorTopics.humidity: {
          const humidityData = parseFloat(payload.toString());
          console.log('습도 데이터 업데이트:', humidityData);
          setSensorData(prev => ({ ...prev, humidity: humidityData }));
          break;
        }
        case sensorTopics.pm10: {
          const pm10Data = payload.toString();
          console.log('PM10 데이터 업데이트:', pm10Data);
          setSensorData(prev => ({ ...prev, pm10: pm10Data }));
          break;
        }
        default:
          console.log('알 수 없는 토픽:', topic);
      }
    });

    client.current.on('error', (err) => {
      console.error('MQTT 에러:', err);
    });

    client.current.on('close', () => {
      console.log('MQTT 연결 종료');
      resetSensorData();
    });

    client.current.on('offline', () => {
      console.log('MQTT 오프라인');
      resetSensorData();
    });

    client.current.on('reconnect', () => {
      console.log('MQTT 재연결 중...');
    });

    client.current.on('disconnect', () => {
      console.log('MQTT 연결 끊김');
      resetSensorData();
    });
    return () => {
      if (client.current) {
        client.current.end();
        client.current = null;
      }
    };
  }, [deviceId, MQTT_BROKER_URL]);

  const publishMessage = (topic, payload) => {
    if (!client.current || !client.current.connected) {
      return Promise.reject(new Error('MQTT not connected'));
    }

    return new Promise((resolve, reject) => {
      client.current.publish(
        topic,
        JSON.stringify(payload),
        { qos: 1 },
        (err) => {
          if (err) {
            console.error('메시지 전송 실패:', err);
            messageApi.error('메시지 전송 실패');
            reject(err);
            return;
          }

          console.log('메시지 전송 성공: 토스트 호출');
          messageApi.success('문구가 변경되었습니다.');
          resolve(true);
        }
      );
    });
  };

  const handleSubmit = async () => {
    console.log("입력값:", inputValue);
    
    // 텍스트 길이 검증 (최소 1자, 최대 30자)
    if (inputValue.length < 1) {
      messageApi.error("텍스트를 입력해주세요! (최소 1자 이상 필요)");
      return;
    }
    
    if (inputValue.length > 30) {
      messageApi.error("텍스트가 너무 깁니다! (현재: " + inputValue.length + "자, 최대 30자까지)");
      return;
    }
    
    console.log("Modal.confirm 호출 시도");
    
    const confirmed = window.confirm(`"${inputValue}" 텍스트를 전광판에 전송하시겠습니까?`);
    if (confirmed) {
      console.log("Modal 확인 버튼 클릭됨");
      const mqttPayload = { action: inputValue };
      try {
        const topic = `${deviceId}/lb`;
        await publishMessage(topic, mqttPayload);
      } catch {
        messageApi.error("MQTT 연결 안됨");
      }
    } else {
      console.log("Modal 취소 버튼 클릭됨");
    }
  };

  // MQTT 제어 명령 발행 함수
  const publishCommand = (cmd) => {
    console.log("publishCommand 호출됨:", cmd);
    
    const commandNames = {
      "spray_female": "여자 화장실 소독액 분사",
      "spray_male": "남자 화장실 소독액 분사", 
      "spray_both": "남녀 화장실 소독액 분사",
      "fan_female": "여자 화장실 환풍기",
      "fan_male": "남자 화장실 환풍기",
      "fan_both": "남녀 화장실 환풍기",
      "stop_all": "모든 시스템 중단",
      "motor_start": "모터 시작",
      "motor_stop": "모터 정지",
      "motor_speed_up": "모터 속도 증가",
      "motor_speed_down": "모터 속도 감소"
    };

    const commandName = commandNames[cmd] || cmd;
    console.log("명령명:", commandName);

    console.log("Modal.confirm 호출 시도");
    
    const confirmed = window.confirm(`${commandName} 명령을 실행하시겠습니까?`);
    if (confirmed) {
      console.log("Modal 확인 버튼 클릭됨");
      const topic = `${deviceId}/control`;
      const payload = { command: cmd };
      if (client.current && client.current.connected) {
        client.current.publish(topic, JSON.stringify(payload));
        messageApi.success(`${commandName} 명령 전송 성공`);
      } else {
        messageApi.error("MQTT 연결이 되어있지 않습니다");
      }
    } else {
      console.log("Modal 취소 버튼 클릭됨");
    }
  };


  // 조건별 색상 함수
  const tempColor = (temp) =>
    temp < -8 || temp >= 33 ? '#b91c1c' : '#15803d';

  const humidityColor = (hum) =>
    hum <= 30 || hum >= 70 ? '#b91c1c' : '#15803d';

  const dustColor = (val) =>
    val >= 50 ? '#b91c1c' : '#15803d';

  const getDustColor = (text) => {
    switch (text) {
      case '좋음': return '#15803d';
      case '보통': return '#f59e0b';
      case '나쁨': return '#b91c1c';
      default: return '#6b7280';
    }
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ minHeight: '100vh' }}>
      {contextHolder}
      <HeaderComponent />
      <div 
        className="bg-gradient-to-b from-gray-50 to-gray-100"
        style={{ 
          padding: isMobile ? '12px 8px' : '24px',
          paddingTop: isMobile ? '12px' : '24px',
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '1600px',
          margin: '0 auto'
        }}>
          <Card
            style={{
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              background: '#ffffff'
            }}
            bodyStyle={{
              padding: isMobile ? '16px' : '24px'
            }}
          >
      {/* Input and Button Section - Compact */}
      <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <Input
            placeholder="전광판 데이터 입력 (1-30자)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ 
              borderRadius: '8px',
              borderColor: inputValue.length > 30 ? '#ff4d4f' : inputValue.length > 25 ? '#faad14' : '#d9d9d9',
              height: '48px',
              fontSize: '16px'
            }}
            maxLength={30}
          />
          <div 
            style={{ 
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '12px',
              color: inputValue.length > 30 ? '#ff4d4f' : inputValue.length > 25 ? '#faad14' : '#999',
              fontWeight: 'bold',
              pointerEvents: 'none'
            }}
          >
            {inputValue.length}/30
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Button
            type="primary"
            onClick={() => {
              console.log("전송 버튼 클릭됨");
              handleSubmit();
            }}
            className="rounded-lg bg-blue-600 hover:bg-blue-700"
            style={{ 
              height: '48px',
              fontSize: '16px',
              paddingLeft: '32px',
              paddingRight: '32px'
            }}
          >
            전송
          </Button>
        </div>
      </div>

      <Divider style={{ margin: window.innerWidth < 768 ? '24px 0' : '40px 0' }} />

      {/* Sensor Data Section - Compact Horizontal Layout */}
      <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
        <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
          <h2 style={{ 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            margin: 0,
            marginBottom: '4px'
          }}>
            실시간 환경 데이터
          </h2>
          <div style={{ 
            width: '50px', 
            height: '2px', 
            backgroundColor: '#3b82f6',
            borderRadius: '2px'
          }}></div>
        </div>
        <Row gutter={[isMobile ? 6 : 10, isMobile ? 6 : 10]}>
          {/* 온도 카드 */}
          <Col xs={8} sm={8} md={6} lg={3}>
            <Card 
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ marginBottom: isMobile ? '6px' : '12px' }}>
                <Progress
                  type="circle"
                  percent={
                    sensorData.temperature === null
                      ? 0
                      : Math.min(((sensorData.temperature + 10) / 60) * 100, 100)
                  }
                  size={isMobile ? 45 : 75}
                  strokeColor={{
                    '0%': '#3b82f6',
                    '100%': '#3b82f6',
                  }}
                  trailColor="rgba(59, 130, 246, 0.2)"
                  strokeWidth={6}
                  format={() => (
                    <div style={{ color: '#374151', textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? '12px' : '20px', fontWeight: 'bold', lineHeight: 1 }}>
                        {sensorData.temperature === null ? '대기중' : sensorData.temperature}
                      </div>
                      <div style={{ fontSize: isMobile ? '8px' : '12px', fontWeight: '500' }}>°C</div>
                    </div>
                  )}
                />
              </div>
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>온도</div>
            </Card>
          </Col>

          {/* 습도 카드 */}
          <Col xs={8} sm={8} md={6} lg={3}>
            <Card 
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ marginBottom: isMobile ? '6px' : '12px' }}>
                <Progress
                  type="circle"
                  percent={sensorData.humidity === null ? 0 : sensorData.humidity}
                  size={isMobile ? 45 : 75}
                  strokeColor={{
                    '0%': '#3b82f6',
                    '100%': '#3b82f6',
                  }}
                  trailColor="rgba(59, 130, 246, 0.2)"
                  strokeWidth={6}
                  format={() => (
                    <div style={{ color: '#374151', textAlign: 'center' }}>
                      <div style={{ fontSize: isMobile ? '12px' : '20px', fontWeight: 'bold', lineHeight: 1 }}>
                        {sensorData.humidity === null ? '대기중' : sensorData.humidity}
                      </div>
                      <div style={{ fontSize: isMobile ? '8px' : '12px', fontWeight: '500' }}>%</div>
                    </div>
                  )}
                />
              </div>
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>습도</div>
            </Card>
          </Col>

          {/* 미세먼지 카드 */}
          <Col xs={8} sm={8} md={6} lg={3}>
            <Card 
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ marginBottom: isMobile ? '6px' : '12px' }}>
                <div style={{ 
                  width: isMobile ? '45px' : '75px', 
                  height: isMobile ? '45px' : '75px', 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${getDustColor(sensorData.pm10)} 0%, ${getDustColor(sensorData.pm10)}aa 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    <div style={{ fontSize: isMobile ? '10px' : '16px', fontWeight: 'bold', lineHeight: 1 }}>
                      {sensorData.pm10 || '대기중'}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>미세먼지</div>
            </Card>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: isMobile ? '12px 0' : '16px 0' }} />

      {/* 제어 명령 버튼 영역 - Compact Grid */}
      <div>
        <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
          <h2 style={{ 
            fontSize: isMobile ? '18px' : '20px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            margin: 0,
            marginBottom: '8px'
          }}>
            시스템 제어
          </h2>
          <div style={{ 
            width: '50px', 
            height: '2px', 
            backgroundColor: '#3b82f6',
            borderRadius: '2px'
          }}></div>
        </div>
        <Row gutter={[isMobile ? 6 : 10, isMobile ? 6 : 10]}>
          {/* 소독액 분사 버튼들 */}
          <Col xs={8} sm={8} md={6} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => {
                console.log("소독액 분사(여) 버튼 클릭됨");
                publishCommand("spray_female");
              }}
            >
              <WomanOutlined style={{ fontSize: isMobile ? '24px' : '42px', marginBottom: isMobile ? '6px' : '12px', color: '#374151' }} />
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>소독액</div>
              <div style={{ fontSize: isMobile ? '10px' : '14px', opacity: 0.8, marginTop: '2px' }}>(여)</div>
            </Card>
          </Col>

          <Col xs={8} sm={8} md={6} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("spray_male")}
            >
              <ManOutlined style={{ fontSize: isMobile ? '24px' : '42px', marginBottom: isMobile ? '6px' : '12px', color: '#374151' }} />
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>소독액</div>
              <div style={{ fontSize: isMobile ? '10px' : '14px', opacity: 0.8, marginTop: '2px' }}>(남)</div>
            </Card>
          </Col>

          <Col xs={8} sm={8} md={6} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("spray_both")}
            >
              <TeamOutlined style={{ fontSize: isMobile ? '24px' : '42px', marginBottom: isMobile ? '6px' : '12px', color: '#374151' }} />
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>소독액</div>
              <div style={{ fontSize: isMobile ? '10px' : '14px', opacity: 0.8, marginTop: '2px' }}>(전체)</div>
            </Card>
          </Col>

          {/* 환풍기 버튼들 */}
          <Col xs={8} sm={8} md={6} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("fan_female")}
            >
              <ThunderboltOutlined style={{ fontSize: isMobile ? '24px' : '42px', marginBottom: isMobile ? '6px' : '12px', color: '#374151' }} />
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>환풍기</div>
              <div style={{ fontSize: isMobile ? '10px' : '14px', opacity: 0.8, marginTop: '2px' }}>(여)</div>
            </Card>
          </Col>

          <Col xs={8} sm={8} md={6} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("fan_male")}
            >
              <ThunderboltOutlined style={{ fontSize: isMobile ? '24px' : '42px', marginBottom: isMobile ? '6px' : '12px', color: '#374151' }} />
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>환풍기</div>
              <div style={{ fontSize: isMobile ? '10px' : '14px', opacity: 0.8, marginTop: '2px' }}>(남)</div>
            </Card>
          </Col>

          <Col xs={8} sm={8} md={6} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("fan_both")}
            >
              <TeamOutlined style={{ fontSize: isMobile ? '24px' : '42px', marginBottom: isMobile ? '6px' : '12px', color: '#374151' }} />
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>환풍기</div>
              <div style={{ fontSize: isMobile ? '10px' : '14px', opacity: 0.8, marginTop: '2px' }}>(전체)</div>
            </Card>
          </Col>

          {/* 중단 버튼 */}
          <Col xs={8} sm={8} md={6} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                color: '#374151',
                aspectRatio: '1',
                width: '100%'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("stop_all")}
            >
              <StopOutlined style={{ fontSize: isMobile ? '24px' : '42px', marginBottom: isMobile ? '6px' : '12px', color: '#dc2626' }} />
              <div style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: '600', textAlign: 'center', lineHeight: 1.2 }}>모두 중단</div>
            </Card>
          </Col>

          {/* 모터 컨트롤 버튼들
          <Col xs={8} sm={6} md={4} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: isMobile ? '90px' : '100px'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_start")}
            >
              <PlayCircleOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>모터 시작</div>
            </Card>
          </Col>

          <Col xs={8} sm={6} md={4} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: isMobile ? '90px' : '100px'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_stop")}
            >
              <PauseCircleOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>모터 정지</div>
            </Card>
          </Col>

          <Col xs={8} sm={6} md={4} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: isMobile ? '90px' : '100px'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_speed_up")}
            >
              <PlusOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>속도 증가</div>
            </Card>
          </Col>

          <Col xs={8} sm={6} md={4} lg={3}>
            <Card
              hoverable
              className="text-center shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: isMobile ? '90px' : '100px'
              }}
              bodyStyle={{ padding: isMobile ? '12px 6px' : '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_speed_down")}
            >
              <MinusOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>속도 감소</div>
            </Card>
          </Col> */}
        </Row>
      </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Home;
