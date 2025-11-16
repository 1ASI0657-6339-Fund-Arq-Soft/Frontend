import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nurse } from '../models/nurse.model';

@Injectable({
  providedIn: 'root'
})
export class NurseService {
  private apiUrl = '/api/nurses';

  constructor(private http: HttpClient) {}

  getNurses(): Observable<Nurse[]> {
    return this.http.get<Nurse[]>(this.apiUrl);
  }

  createNurse(nurse: Nurse): Observable<Nurse> {
    return this.http.post<Nurse>(this.apiUrl, nurse);
  }

  updateNurse(id: number, nurse: Nurse): Observable<Nurse> {
    return this.http.put<Nurse>(`${this.apiUrl}/${id}`, nurse);
  }

  deleteNurse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
