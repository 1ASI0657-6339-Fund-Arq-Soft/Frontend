export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone: string;
  email?: string;
}
