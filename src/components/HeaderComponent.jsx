import { useEffect, useState } from 'react';
import { Layout, Select, message } from 'antd';
import { DEFAULT_DEVICE_ID, broadcastDeviceIdChange } from '../constants/device';
import { fetchSmartToiletList } from '../api/smartToilet';

const { Header } = Layout;

function HeaderComponent() {
  const [deviceId, setDeviceId] = useState(() => {
    return localStorage.getItem('deviceId') || DEFAULT_DEVICE_ID;
  });
  const [serialOptions, setSerialOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

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

  useEffect(() => {
    let isMounted = true;

    const loadSmartToilets = async () => {
      setIsLoadingOptions(true);
      try {
        const list = await fetchSmartToiletList();
        if (!isMounted) {
          return;
        }
        const normalized = list
          .filter((item) => item?.serial)
          .map((item) => ({
            value: item.serial,
            label: (item.name || '').trim() || item.serial,
          }));
        setSerialOptions(normalized);
      } catch (error) {
        console.error('Failed to load smart toilet list', error);
        if (!isMounted) {
          return;
        }
        setSerialOptions([]);
        message.error('시리얼 목록을 불러오지 못했습니다. API 연결을 확인하세요.');
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    };

    loadSmartToilets();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectChange = (value, option) => {
    if (!value) {
      return;
    }
    localStorage.setItem('deviceId', value);
    setDeviceId(value);
    broadcastDeviceIdChange(value);
    const label = option?.label || value;
    message.success(`${label} 시리얼이 적용되었습니다.`);
  };

  const selectedValue = serialOptions.find((option) => option.value === deviceId)
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
          flex: 1,
          gap: isMobile ? '8px' : '16px'
        }}
      >
        {serialOptions.length > 0 ? (
          <Select
            value={selectedValue}
            placeholder="지역 선택"
            options={serialOptions}
            onChange={handleSelectChange}
            style={{
              minWidth: isMobile ? '140px' : '220px',
              fontWeight: 600
            }}
            dropdownMatchSelectWidth={false}
            loading={isLoadingOptions}
            optionLabelProp="label"
          />
        ) : (
          <div
            style={{
              minWidth: isMobile ? '140px' : '220px',
              textAlign: 'right',
              color: '#9ca3af',
              fontWeight: 600
            }}
          >
            {isLoadingOptions ? '불러오는 중...' : '정보가 없습니다.'}
          </div>
        )}
      </div>
    </Header>
  );
}

export default HeaderComponent;
