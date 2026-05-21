interface SubtypeData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subtypeData: Record<PropertyKey, any>;
}

interface KeyValue {
  code: string;
  full: string | number;
}

export type { SubtypeData, KeyValue };
