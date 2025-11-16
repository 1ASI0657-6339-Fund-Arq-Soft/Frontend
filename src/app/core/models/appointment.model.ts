export interface Appointment {
  id: number;
  title: string;
  start: string | Date;
  end: string | Date;
  description?: string;
}
