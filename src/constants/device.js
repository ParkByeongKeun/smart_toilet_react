export const DEFAULT_DEVICE_ID = 'toilet-r01';

export const broadcastDeviceIdChange = (nextId) => {
  if (typeof window === 'undefined' || !nextId) {
    return;
  }
  window.dispatchEvent(new CustomEvent('deviceIdChange', { detail: nextId }));
};

