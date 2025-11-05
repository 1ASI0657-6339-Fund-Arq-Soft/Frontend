import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "../models/user.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false)
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable()

  private mockUsers = [
    {
      id: "1",
      email: "familiar@test.com",
      password: "password123",
      name: "Juan Familiar",
      role: "familiar" as const,
    },
    {
      id: "2",
      email: "cuidador@test.com",
      password: "password123",
      name: "María Cuidadora",
      role: "cuidador" as const,
    },
    {
      id: "3",
      email: "developer@test.com",
      password: "password123",
      name: "Pedro Developer",
      role: "developer" as const,
    },
  ]

  constructor() {
    this.loadUserFromStorage()
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return new Observable((observer) => {
      setTimeout(() => {
        const user = this.mockUsers.find((u) => u.email === request.email)

        if (user && user.password === request.password) {
          const authResponse: AuthResponse = {
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token: this.generateMockToken(),
          }
          this.setCurrentUser(authResponse.user, authResponse.token)
          observer.next(authResponse)
          observer.complete()
        } else {
          observer.error({ message: "Email o contraseña inválidos" })
        }
      }, 500)
    })
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return new Observable((observer) => {
      setTimeout(() => {
        const userExists = this.mockUsers.find((u) => u.email === request.email)

        if (userExists) {
          observer.error({ message: "El email ya está registrado" })
          return
        }

        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email: request.email,
          name: request.name,
          role: request.role,
        }

        this.mockUsers.push({
          ...newUser,
          password: request.password,
        })

        const authResponse: AuthResponse = {
          user: newUser,
          token: this.generateMockToken(),
        }

        this.setCurrentUser(newUser, authResponse.token)
        observer.next(authResponse)
        observer.complete()
      }, 500)
    })
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

  private generateMockToken(): string {
    return "mock_token_" + Math.random().toString(36).substr(2, 9)
  }
}
