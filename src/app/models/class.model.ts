import { Teacher } from './teacher.model';

export interface SchoolClass {
  _id: string;
  name: string;
  section: string;
  teacherId?: Teacher | string;
  roomNumber?: string;
  studentCount?: number;
  createdAt?: string;
}
