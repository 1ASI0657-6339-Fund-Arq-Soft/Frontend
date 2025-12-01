import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { map, switchMap } from 'rxjs/operators'
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "../models/user.model"
import { IamApiService } from './iam-api.service'
import type { AuthenticatedUserResource, SignInResource, SignUpResource } from '../models/generated/iam.types'

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false)
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable()



  constructor(private iam: IamApiService) {
    this.loadUserFromStorage()
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.iam.signIn({ username: request.email, password: request.password }).pipe(
      map((res: AuthenticatedUserResource) => {
        // AuthenticatedUserResource currently doesn't include roles in the OpenAPI spec.
        // Default to 'familiar' when no role information is available from the sign-in response.
        const user: User = { id: String(res.id ?? ''), email: res.username ?? '', name: res.username ?? '', role: 'familiar' }
        const auth: AuthResponse = { user, token: res.token ?? '' }
        this.setCurrentUser(auth.user, auth.token)
        return auth
      })
    )
  }

  // Use remote IAM service to sign-in (returns token from backend)
  signInRemote(request: SignInResource): Observable<AuthResponse> {
    return this.iam.signIn(request).pipe(
      map((res: AuthenticatedUserResource) => {
        const user: User = { id: String(res.id ?? ''), email: res.username ?? '', name: res.username ?? '', role: 'familiar' }
        const auth: AuthResponse = { user, token: res.token ?? '' }
        this.setCurrentUser(auth.user, auth.token)
        return auth
      })
    )
  }

  signUpRemote(request: SignUpResource): Observable<AuthResponse> {
    // Create the user then sign-in to obtain token
    return this.iam.signUp(request).pipe(
      switchMap(() => this.iam.signIn({ username: request.username || '', password: request.password || '' })),
      map((res: AuthenticatedUserResource) => {
        const user: User = { id: String(res.id ?? ''), email: res.username ?? '', name: res.username ?? '', role: 'familiar' }
        const auth: AuthResponse = { user, token: res.token ?? '' }
        this.setCurrentUser(auth.user, auth.token)
        return auth
      })
    )
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.iam.signUp({ username: request.email, password: request.password }).pipe(
      switchMap(() => this.iam.signIn({ username: request.email, password: request.password })),
      map((res: AuthenticatedUserResource) => {
        const user: User = { id: String(res.id ?? ''), email: res.username ?? '', name: res.username ?? '', role: request.role }
        const auth: AuthResponse = { user, token: res.token ?? '' }
        this.setCurrentUser(auth.user, auth.token)
        return auth
      })
    )
  }

  logout(): void {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
    this.currentUserSubject.next(null)
    this.isAuthenticatedSubject.next(false)
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  getToken(): string | null {
    return localStorage.getItem("authToken")
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value
  }

  private setCurrentUser(user: User, token: string): void {
    localStorage.setItem("currentUser", JSON.stringify(user))
    localStorage.setItem("authToken", token)
    this.currentUserSubject.next(user)
    this.isAuthenticatedSubject.next(true)
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        this.currentUserSubject.next(user)
        this.isAuthenticatedSubject.next(true)
      } catch (e) {
        console.error("Error loading user from storage:", e)
        this.logout()
      }
    }
  }



  getAllUsers(): Observable<User[]> {
    return this.iam.getUsers().pipe(
      map(userResources => userResources.map(res => {
        const rawRole = (res.roles && res.roles.length > 0) ? res.roles[0] : 'familiar'
        const safeRole = (rawRole === 'familiar' || rawRole === 'cuidador' || rawRole === 'doctor') ? rawRole : 'familiar'
        return {
          id: String(res.id ?? ''),
          email: res.username ?? '',
          name: res.username ?? '',
          role: safeRole as User['role']
        }
      }))
    )
  }

  getFamiliares(): Observable<User[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(u => u.role === 'familiar'))
    )
  }
}
