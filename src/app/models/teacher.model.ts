export interface TeacherContactInfo {
  phone: string;
  email: string;
  address?: string;
}

export interface Teacher {
  _id: string;
  name: string;
  subject: string;
  experience: number;
  contactInfo: TeacherContactInfo;
  qualification?: string;
  createdAt?: string;
}
