import { Teacher } from './teacher.model';
import { SchoolClass } from './class.model';

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  teacherId?: Teacher | string;
  classId?: SchoolClass | string;
  createdAt?: string;
}
