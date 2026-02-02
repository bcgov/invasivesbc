const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

interface SubtypeData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subtypeData: Record<PropertyKey, any>;
}

interface KeyValue {
  code: string;
  full: string | number;
}

export type { SubtypeData, KeyValue };
export { API_URL };
