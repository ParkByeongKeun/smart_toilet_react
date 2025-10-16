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

function Home() {
  const [inputValue, setInputValue] = useState('');
  const [sensorData, setSensorData] = useState({
    temperature: 0, // °C
    humidity: 0,    // %
    pm10: '',       // 좋음/보통/나쁨
  });
  const client = useRef(null);
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  const MQTT_BROKER_URL = `${protocol}//${window.location.host}/mqtt`; //raspberry pi test
  // const MQTT_BROKER_URL = `wss://ijoon.iptime.org:25813/mqtt`;
  useEffect(() => {
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
      message.success('MQTT 연결됨');
      
      // retain 메시지를 받기 위해 QoS 1로 구독하고 약간의 지연 추가
      const topics = [
        'device_1_ac/data/temp',
        'device_1_ac/data/humidity', 
        'device_1_ac/data/pm10'
      ];
      
      // 연결 후 약간의 지연을 두고 구독 (retain 메시지 수신을 위해)
      setTimeout(() => {
        topics.forEach((topic, index) => {
          // 각 토픽을 순차적으로 구독 (retain 메시지 수신을 위해)
          setTimeout(() => {
            client.current.subscribe(topic, { qos: 1 }, (err) => {
              if (err) {
                console.error(`${topic} 구독 실패:`, err);
              } else {
                console.log(`${topic} 구독 성공 (QoS 1) - retain 메시지 대기중`);
              }
            });
          }, index * 50); // 각 토픽마다 50ms씩 지연
        });
        console.log('센서 토픽 구독 시작');
      }, 200); // 200ms 지연
    });

    client.current.on('message', (topic, payload, packet) => {
      console.log('메시지 수신됨!');
      console.log('원본 토픽:', topic);
      console.log('원본 페이로드:', payload.toString());
      console.log('Retain 플래그:', packet.retain);
      console.log('QoS:', packet.qos);
      
      switch (topic) {
        case 'device_1_ac/data/temp':
          const tempData = parseFloat(payload.toString());
          console.log('온도 데이터 업데이트:', tempData);
          setSensorData(prev => ({ ...prev, temperature: tempData }));
          break;
        case 'device_1_ac/data/humidity':
          const humidityData = parseFloat(payload.toString());
          console.log('습도 데이터 업데이트:', humidityData);
          setSensorData(prev => ({ ...prev, humidity: humidityData }));
          break;
        case 'device_1_ac/data/pm10':
          const pm10Data = payload.toString(); // 한글 텍스트 그대로 사용
          console.log('PM10 데이터 업데이트:', pm10Data);
          setSensorData(prev => ({ ...prev, pm10: pm10Data }));
          break;
        default:
          console.log('알 수 없는 토픽:', topic);
      }
    });

    client.current.on('error', (err) => {
      console.error('MQTT 에러:', err);
      message.error('MQTT 연결 오류');
    });

    client.current.on('close', () => {
      console.log('MQTT 연결 종료');
      message.warning('MQTT 연결 종료됨');
    });

    client.current.on('offline', () => {
      console.log('MQTT 오프라인');
      message.warning('MQTT 오프라인');
    });

    client.current.on('reconnect', () => {
      console.log('MQTT 재연결 중...');
      message.info('MQTT 재연결 중...');
    });

    client.current.on('disconnect', () => {
      console.log('MQTT 연결 끊김');
      message.warning('MQTT 연결 끊김');
    });
    return () => {
      if (client.current) {
        client.current.end();
      }
    };
  }, []);

  const publishMessage = (topic, payload) => {
    if (client.current && client.current.connected) {
      client.current.publish(topic, JSON.stringify(payload));
      message.success('메시지 전송 성공');
    } else {
      message.error('MQTT가 연결되어 있지 않습니다');
    }
  };

  const handleSubmit = async () => {
    console.log("입력값:", inputValue);
    
    // 텍스트 길이 검증 (최소 1자, 최대 30자)
    if (inputValue.length < 1) {
      message.error("⚠️ 텍스트를 입력해주세요! (최소 1자 이상 필요)");
      return;
    }
    
    if (inputValue.length > 30) {
      message.error("⚠️ 텍스트가 너무 깁니다! (현재: " + inputValue.length + "자, 최대 30자까지)");
      return;
    }
    
    console.log("Modal.confirm 호출 시도");
    
    const confirmed = window.confirm(`"${inputValue}" 텍스트를 전광판에 전송하시겠습니까?`);
    if (confirmed) {
      console.log("Modal 확인 버튼 클릭됨");
      const mqttPayload = { action: inputValue };
      try {
        const topic = `device_1_ac/lb`;
        publishMessage(topic, mqttPayload);
      } catch {
        message.error("MQTT 연결 안됨");
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
      const topic = "device_1_ac/control";
      const payload = { command: cmd };
      if (client.current && client.current.connected) {
        client.current.publish(topic, JSON.stringify(payload));
        message.success(`${commandName} 명령 전송 성공`);
      } else {
        message.error("MQTT 연결이 되어있지 않습니다");
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

  return (
    <div style={{ minHeight: '100vh' }}>
      <HeaderComponent />
      <div 
        className="bg-gradient-to-b from-gray-50 to-gray-100"
        style={{ 
          padding: window.innerWidth < 768 ? '16px 12px' : '24px',
          paddingTop: window.innerWidth < 768 ? '16px' : '24px',
          minHeight: 'calc(100vh - 120px)'
        }}
      >
      {/* Input and Button Section */}
      <div className="mb-6">
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

      {/* Sensor Data Section - Enhanced Visibility */}
      <div className="mb-6">
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            margin: 0,
            marginBottom: '8px'
          }}>
            실시간 환경 데이터
          </h2>
          <div style={{ 
            width: '60px', 
            height: '3px', 
            backgroundColor: '#3b82f6',
            borderRadius: '2px'
          }}></div>
        </div>
        <Row gutter={[20, 20]}>
          {/* 온도 카드 */}
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card 
              className="text-center shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '200px',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Progress
                  type="circle"
                  percent={Math.min(((sensorData.temperature + 10) / 60) * 100, 100)}
                  size={100}
                  strokeColor={{
                    '0%': '#3b82f6',
                    '100%': '#3b82f6',
                  }}
                  trailColor="rgba(59, 130, 246, 0.2)"
                  strokeWidth={8}
                  format={() => (
                    <div style={{ color: '#374151', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', lineHeight: 1 }}>{sensorData.temperature}</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>°C</div>
                    </div>
                  )}
                />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>온도</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Temperature</div>
            </Card>
          </Col>

          {/* 습도 카드 */}
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card 
              className="text-center shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '200px',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <Progress
                  type="circle"
                  percent={sensorData.humidity}
                  size={100}
                  strokeColor={{
                    '0%': '#3b82f6',
                    '100%': '#3b82f6',
                  }}
                  trailColor="rgba(59, 130, 246, 0.2)"
                  strokeWidth={8}
                  format={() => (
                    <div style={{ color: '#374151', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', lineHeight: 1 }}>{sensorData.humidity}</div>
                      <div style={{ fontSize: '16px', fontWeight: '500' }}>%</div>
                    </div>
                  )}
                />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>습도</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Humidity</div>
            </Card>
          </Col>

          {/* 미세먼지 카드 */}
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card 
              className="text-center shadow-lg hover:shadow-xl transition-all duration-300"
              style={{
                borderRadius: '20px',
                border: 'none',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '200px',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: `linear-gradient(135deg, ${getDustColor(sensorData.pm10)} 0%, ${getDustColor(sensorData.pm10)}aa 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>{sensorData.pm10 || '대기중'}</div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>미세먼지</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>PM10</div>
            </Card>
          </Col>

        </Row>
      </div>

      <Divider style={{ margin: window.innerWidth < 768 ? '24px 0' : '40px 0' }} />

      {/* 제어 명령 버튼 영역 - Icon Card Style */}
      <div className="mb-6">
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            margin: 0,
            marginBottom: '8px'
          }}>
            시스템 제어
          </h2>
          <div style={{ 
            width: '60px', 
            height: '3px', 
            backgroundColor: '#3b82f6',
            borderRadius: '2px'
          }}></div>
        </div>
        <Row gutter={[16, 16]}>
          {/* 소독액 분사 버튼들 */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => {
                console.log("소독액 분사(여) 버튼 클릭됨");
                publishCommand("spray_female");
              }}
            >
              <WomanOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>소독액 분사</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>(여)</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("spray_male")}
            >
              <ManOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>소독액 분사</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>(남)</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("spray_both")}
            >
              <TeamOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>소독액 분사</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>(남&여)</div>
            </Card>
          </Col>

          {/* 환풍기 버튼들 */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("fan_female")}
            >
              <ThunderboltOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>환풍기</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>(여)</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("fan_male")}
            >
              <ThunderboltOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>환풍기</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>(남)</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("fan_both")}
            >
              <TeamOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>환풍기</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>(남&여)</div>
            </Card>
          </Col>

          {/* 중단 버튼 */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("stop_all")}
            >
              <StopOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>모두 중단</div>
            </Card>
          </Col>

          {/* 모터 컨트롤 버튼들 */}
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_start")}
            >
              <PlayCircleOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>모터 시작</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_stop")}
            >
              <PauseCircleOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>모터 정지</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_speed_up")}
            >
              <PlusOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>속도 증가</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card
              hoverable
              className="text-center shadow-md hover:shadow-lg transition-all duration-300"
              style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                color: '#374151',
                minHeight: '120px'
              }}
              bodyStyle={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => publishCommand("motor_speed_down")}
            >
              <MinusOutlined style={{ fontSize: '32px', marginBottom: '12px', color: '#374151' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>속도 감소</div>
            </Card>
          </Col>
        </Row>
      </div>
      </div>
    </div>
  );
}

export default Home;
