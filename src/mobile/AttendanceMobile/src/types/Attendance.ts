export enum AttendanceMethod {
  GPS = 'GPS',
  BEACON = 'BEACON',
  FACE_RECOGNITION = 'FACE_RECOGNITION',
  BIOMETRIC = 'BIOMETRIC',
  MANUAL = 'MANUAL'
}

export enum AttendanceType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  BREAK_START = 'BREAK_START',
  BREAK_END = 'BREAK_END'
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  type: AttendanceType;
  method: AttendanceMethod;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  photoUrl?: string;
  notes?: string;
  isVerified: boolean;
  createdAt: string;
}
