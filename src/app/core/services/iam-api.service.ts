import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { SignInResource, SignUpResource, AuthenticatedUserResource, UserResource, RoleResource } from '../models/generated/iam.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class IamApiService {
  private base = API_CONFIG.iamBaseUrl

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }
  }

  signIn(payload: SignInResource): Observable<AuthenticatedUserResource> {
    console.log('IamApiService signIn called with:', payload)
    console.log('Making request to:', `${this.base}/authentication/sign-in`)
    return this.http.post<AuthenticatedUserResource>(`${this.base}/authentication/sign-in`, payload, this.getHttpOptions()).pipe(
      catchError((err) => {
        console.error('IamApiService signIn error:', err)
        return throwError(() => this.normalizeError(err))
      })
    )
  }

  signUp(payload: SignUpResource): Observable<UserResource> {
    return this.http.post<UserResource>(`${this.base}/authentication/sign-up`, payload, this.getHttpOptions()).pipe(
      catchError((err) => {
        return throwError(() => this.normalizeError(err))
      })
    )
  }

  getUsers(): Observable<UserResource[]> {
    return this.http.get<UserResource[]>(`${this.base}/users`, this.getHttpOptions()).pipe(
      catchError((err) => {
        return throwError(() => this.normalizeError(err))
      })
    )
  }

  getRoles(): Observable<RoleResource[]> {
    return this.http.get<RoleResource[]>(`${this.base}/roles`, this.getHttpOptions()).pipe(
      catchError((err) => {
        return throwError(() => this.normalizeError(err))
      })
    )
  }



  private normalizeError(err: any): ApiError {
    let message = 'Error desconocido'
    
    if (err?.error?.message) {
      message = err.error.message
    } else if (err?.message) {
      message = err.message
    } else if (err?.status === 0) {
      message = 'No se puede conectar al servidor IAM. Verifique que el servicio esté ejecutándose en ' + this.base
    } else if (err?.status === 401) {
      message = 'Credenciales inválidas'
    } else if (err?.status === 404) {
      message = 'Endpoint no encontrado'
    } else if (err?.status >= 500) {
      message = 'Error interno del servidor IAM'
    }
    
    return { 
      status: err?.status || 0, 
      message, 
      details: err 
    }
  }
}
