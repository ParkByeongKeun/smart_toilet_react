import { useEffect, useState } from 'react';
import { Layout, Select, message } from 'antd';
import { DEFAULT_DEVICE_ID, SERIAL_OPTIONS, broadcastDeviceIdChange } from '../constants/device';

const { Header } = Layout;

function HeaderComponent() {
  const [deviceId, setDeviceId] = useState(() => {
    return localStorage.getItem('deviceId') || DEFAULT_DEVICE_ID;
  });

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  useEffect(() => {
    const handleStorageChange = () => {
      const storedDeviceId = localStorage.getItem('deviceId') || DEFAULT_DEVICE_ID;
      setDeviceId(storedDeviceId);
    };

    const handleDeviceIdChange = (event) => {
      if (event?.detail) {
        setDeviceId(event.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('deviceIdChange', handleDeviceIdChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('deviceIdChange', handleDeviceIdChange);
    };
  }, []);

  const handleSelectChange = (value) => {
    if (!value) {
      return;
    }
    localStorage.setItem('deviceId', value);
    setDeviceId(value);
    broadcastDeviceIdChange(value);
    const label = SERIAL_OPTIONS.find((option) => option.value === value)?.label || value;
    message.success(`${label} 시리얼이 적용되었습니다.`);
  };

  const selectedValue = SERIAL_OPTIONS.find((option) => option.value === deviceId)
    ? deviceId
    : undefined;

  return (
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
        overflow: 'hidden',
        gap: '16px'
      }}
    >
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flex: 1
        }}
      >
        <Select
          value={selectedValue}
          placeholder="지역 선택"
          options={SERIAL_OPTIONS}
          onChange={handleSelectChange}
          style={{
            minWidth: isMobile ? '140px' : '220px',
            fontWeight: 600
          }}
          dropdownMatchSelectWidth={false}
        />
      </div>
    </Header>
  );
}

export default HeaderComponent;
