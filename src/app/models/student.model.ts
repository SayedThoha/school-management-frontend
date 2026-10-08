import { SchoolClass } from './class.model';

export interface StudentContactInfo {
  phone: string;
  email?: string;
  parentName: string;
  address?: string;
}

export interface Student {
  _id: string;
  name: string;
  classId: SchoolClass | string;
  rollNumber: string;
  age: number;
  contactInfo: StudentContactInfo;
  gender?: string;
  isActive: boolean;
  createdAt?: string;
}
