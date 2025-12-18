const WINDOW_ORIGIN = (typeof window !== 'undefined' ? window.location.origin : '') || '';
const FALLBACK_API_BASE_URL = 'http://192.168.13.5:25124';
// Prefer explicit env, then same-origin (for dev proxy), then fallback IP.
const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || WINDOW_ORIGIN || FALLBACK_API_BASE_URL).replace(/\/$/, '');
const SMART_TOILET_LIST_PATH = (import.meta?.env?.VITE_SMART_TOILET_ENDPOINT || '/api/main/v1/smart_toilet_list').replace(/^\/?/, '/');

const normalizeSmartToiletList = (payload) => {
  if (!payload) {
    return [];
  }

  const candidates = [
    payload,
    payload.smart_toilet_list,
    payload.smartToiletList,
    payload.smart_toilet,
    payload.smartToilet,
    payload.data,
    payload.items,
    payload.result,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

export const fetchSmartToiletList = async () => {
  const endpoint = `${API_BASE_URL}${SMART_TOILET_LIST_PATH}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    const error = new Error(`Failed to load smart toilet list (${response.status})`);
    error.status = response.status;
    throw error;
  }
  const payload = await response.json();
  return normalizeSmartToiletList(payload);
};

