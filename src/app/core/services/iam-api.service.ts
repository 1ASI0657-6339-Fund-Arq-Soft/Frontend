import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { API_CONFIG } from '../config/api-config'
import type { SignInResource, SignUpResource, AuthenticatedUserResource, UserResource, RoleResource } from '../models/generated/iam.types'
import type { ApiError } from '../models/api/api-error.model'

@Injectable({ providedIn: 'root' })
export class IamApiService {
  private base = API_CONFIG.iamBaseUrl

  constructor(private http: HttpClient) {}

  signIn(payload: SignInResource): Observable<AuthenticatedUserResource> {
    return this.http.post<AuthenticatedUserResource>(`${this.base}/authentication/sign-in`, payload).pipe(
      catchError((err) => throwError(this.normalizeError(err)))
    )
  }

  signUp(payload: SignUpResource): Observable<UserResource> {
    return this.http.post<UserResource>(`${this.base}/authentication/sign-up`, payload).pipe(
      catchError((err) => throwError(this.normalizeError(err)))
    )
  }

  getUsers(): Observable<UserResource[]> {
    return this.http.get<UserResource[]>(`${this.base}/users`).pipe(catchError((err) => throwError(this.normalizeError(err))))
  }

  getRoles(): Observable<RoleResource[]> {
    return this.http.get<RoleResource[]>(`${this.base}/roles`).pipe(catchError((err) => throwError(this.normalizeError(err))))
  }

  private normalizeError(err: any): ApiError {
    return { status: err?.status, message: err?.error?.message ?? err?.message ?? 'Unknown error', details: err }
  }
}
