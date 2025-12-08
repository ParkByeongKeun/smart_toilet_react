export const DEFAULT_DEVICE_ID = 'toilet-r01';

export const SERIAL_OPTIONS = [
  { value: 'toilet-r01', label: '대전 학하동' },
  { value: 'toilet-r02', label: '세종' },
];

export const getSerialLabel = (deviceId) => {
  if (!deviceId) {
    return '';
  }
  const match = SERIAL_OPTIONS.find((option) => option.value === deviceId);
  return match ? match.label : deviceId;
};

export const broadcastDeviceIdChange = (nextId) => {
  if (typeof window === 'undefined' || !nextId) {
    return;
  }
  window.dispatchEvent(new CustomEvent('deviceIdChange', { detail: nextId }));
};

