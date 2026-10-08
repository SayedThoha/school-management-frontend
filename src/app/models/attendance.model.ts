import { Student } from './student.model';
import { SchoolClass } from './class.model';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface AttendanceRecordItem {
  studentId: Student | string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface Attendance {
  _id: string;
  date: string;
  classId: SchoolClass | string;
  records: AttendanceRecordItem[];
  markedBy?: any;
  createdAt?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
}
