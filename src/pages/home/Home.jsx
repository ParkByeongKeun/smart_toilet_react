import { Card, Statistic, Row, Col, Input, Button, message, Divider, Space } from 'antd';
import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';

function Home() {
  const [inputValue, setInputValue] = useState('');
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
    });

    client.current.on('connect', () => {
      console.log('MQTT 연결 성공');
      message.success('MQTT 연결됨');
    });

    client.current.on('error', (err) => {
      console.error('MQTT 에러:', err);
      message.error('MQTT 연결 오류');
    });

    client.current.on('close', () => {
      console.log('MQTT 연결 종료');
      message.warning('MQTT 연결 종료됨');
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
    
    const mqttPayload = { action: inputValue };
    try {
      const topic = `device_1_ac/lb`;
      publishMessage(topic, mqttPayload);
    } catch {
      message.error("MQTT 연결 안됨");
    }
  };

  // MQTT 제어 명령 발행 함수
  const publishCommand = (cmd) => {
    const topic = "device_1_ac/control";
    const payload = { command: cmd };
    if (client.current && client.current.connected) {
      client.current.publish(topic, JSON.stringify(payload));
      message.success(`${cmd} 명령 전송 성공`);
    } else {
      message.error("MQTT 연결이 되어있지 않습니다");
    }
  };

  const sensorData = {
    temperature: 0, // °C
    humidity: 0,    // %
    pm10: 0,        // µg/m³
    pm2_5: 0,       // µg/m³
    voc: 0,        // ppb
    maleOccupancy: true,
    femaleOccupancy: false,
  };

  // 조건별 색상 함수
  const tempColor = (temp) =>
    temp < -8 || temp >= 33 ? '#b91c1c' : '#15803d';

  const humidityColor = (hum) =>
    hum <= 30 || hum >= 70 ? '#b91c1c' : '#15803d';

  const dustColor = (val) =>
    val >= 50 ? '#b91c1c' : '#15803d';

  return (
    <div className="p-6 pt-12 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Input and Button Section */}
      <div className="flex justify-end mb-6 gap-4">
        <div style={{ position: 'relative', maxWidth: '1000px' }}>
          <Input
            placeholder="전광판 데이터 입력 (1-30자)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ 
              borderRadius: '8px',
              borderColor: inputValue.length > 30 ? '#ff4d4f' : inputValue.length > 25 ? '#faad14' : '#d9d9d9'
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
        <Button
          type="primary"
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 ml-4"
          style={{ marginLeft: '10px' }}
        >
          전송
        </Button>
      </div>

      <Divider className="my-10" />

      {/* Sensor Data Section with horizontal scroll */}
      <div
        style={{
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: 16,
          marginBottom: 24,
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            marginRight: 24,
            fontWeight: '700',
            fontSize: 18,
            color: '#111827',
            verticalAlign: 'middle',
          }}
        >
          온도:
        </span>
        <span
          style={{
            display: 'inline-block',
            marginRight: 40,
            fontSize: 24,
            fontWeight: '600',
            color: tempColor(sensorData.temperature),
            verticalAlign: 'middle',
          }}
        >
          {sensorData.temperature}℃ 
        </span>

        <span
          style={{
            display: 'inline-block',
            marginRight: 24,
            fontWeight: '700',
            fontSize: 18,
            color: '#111827',
            verticalAlign: 'middle',
          }}
        >
          습도:
        </span>
        <span
          style={{
            display: 'inline-block',
            marginRight: 40,
            fontSize: 24,
            fontWeight: '600',
            color: humidityColor(sensorData.humidity),
            verticalAlign: 'middle',
          }}
        >
          {sensorData.humidity}%
        </span>

        <span
          style={{
            display: 'inline-block',
            marginRight: 24,
            fontWeight: '700',
            fontSize: 18,
            color: '#111827',
            verticalAlign: 'middle',
          }}
        >
          미세먼지:
        </span>
        <span
          style={{
            display: 'inline-block',
            marginRight: 40,
            fontSize: 24,
            fontWeight: '600',
            color: dustColor(sensorData.pm10),
            verticalAlign: 'middle',
          }}
        >
          {sensorData.pm10}㎍/㎥
        </span>

        <span
          style={{
            display: 'inline-block',
            marginRight: 24,
            fontWeight: '700',
            fontSize: 18,
            color: '#111827',
            verticalAlign: 'middle',
          }}
        >
          초미세먼지:
        </span>
        <span
          style={{
            display: 'inline-block',
            marginRight: 40,
            fontSize: 24,
            fontWeight: '600',
            color: dustColor(sensorData.pm2_5),
            verticalAlign: 'middle',
          }}
        >
          {sensorData.pm2_5}㎍/㎥
        </span>

        <span
          style={{
            display: 'inline-block',
            marginRight: 24,
            fontWeight: '700',
            fontSize: 18,
            color: '#111827',
            verticalAlign: 'middle',
          }}
        >
          VOC:
        </span>
        <span
          style={{
            display: 'inline-block',
            fontSize: 24,
            fontWeight: '600',
            color: sensorData.voc < 300 ? '#15803d' : '#b91c1c',
            verticalAlign: 'middle',
          }}
        >
          {sensorData.voc}ppb
        </span>
      </div>

      <Divider className="my-10" />

      {/* Occupancy Section */}
      <Row gutter={[16, 16]} className="mt-16">
        <Col span={6} className="mt-2">
          <Card className="shadow-md hover:shadow-lg transition-shadow rounded-lg border-none">
            <Statistic
              title={<div style={{ color: '#111827', fontWeight: 'bold' }}>남자 화장실</div>}
              value={sensorData.maleOccupancy ? '재실' : '비재실'}
              valueStyle={{ color: sensorData.maleOccupancy ? '#ff0000' : '#b91c1c' }}
            />
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: sensorData.maleOccupancy ? '#ef4444' : '#6b7280',
                display: 'inline-block',
                marginLeft: '8px',
                boxShadow: sensorData.maleOccupancy ? '0 0 8px rgba(239, 68, 68, 0.5)' : '0 0 8px rgba(107, 114, 128, 0.5)',
              }}
            />
          </Card>
        </Col>
        <Col span={6} className="mt-2">
          <Card className="shadow-md hover:shadow-lg transition-shadow rounded-lg border-none">
            <Statistic
              title={<div style={{ color: '#111827', fontWeight: 'bold' }}>여자 화장실</div>}
              value={sensorData.femaleOccupancy ? '재실' : '비재실'}
              valueStyle={{ color: sensorData.femaleOccupancy ? '#15803d' : '#666666' }}
            />
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: sensorData.femaleOccupancy ? '#15803d' : '#6b7280',
                display: 'inline-block',
                marginLeft: '8px',
                boxShadow: sensorData.femaleOccupancy ? '0 0 8px rgba(21, 128, 61, 0.5)' : '0 0 8px rgba(107, 114, 128, 0.5)',
              }}
            />
          </Card>
        </Col>
      </Row>

      <Divider className="my-10" />

      {/* 제어 명령 버튼 영역 */}
      <Space wrap>
        <Button type="primary" onClick={() => publishCommand("spray_female")}>소독액 분사 (여)</Button>
        <Button type="primary" onClick={() => publishCommand("spray_male")}>소독액 분사 (남)</Button>
        <Button type="primary" onClick={() => publishCommand("fan_female")}>환풍기 (여)</Button>
        <Button type="primary" onClick={() => publishCommand("fan_male")}>환풍기 (남)</Button>
        <Button type="primary" onClick={() => publishCommand("fan_both")}>환풍기 (남&여)</Button>
        <Button type="primary" onClick={() => publishCommand("spray_both")}>소독액 분사 (남&여)</Button>
        <Button danger onClick={() => publishCommand("stop_all")}>모두 중단</Button>
      
        {/* 모터 컨트롤 */}
        <Divider type="vertical" />
        <Button type="default" onClick={() => publishCommand("motor_start")}>모터 시작</Button>
        <Button type="default" onClick={() => publishCommand("motor_stop")}>모터 정지</Button>
        <Button type="default" onClick={() => publishCommand("motor_speed_up")}>모터 속도 증가</Button>
        <Button type="default" onClick={() => publishCommand("motor_speed_down")}>모터 속도 감소</Button>
      </Space>
    </div>
  );
}

export default Home;
