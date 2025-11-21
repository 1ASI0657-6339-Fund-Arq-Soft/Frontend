export interface User {
  id: string
  email: string
  name: string
  role: "familiar" | "cuidador" | "doctor"
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: "familiar" | "cuidador" | "doctor"
}
