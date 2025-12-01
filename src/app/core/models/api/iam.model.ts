export interface SignInRequest {
  username: string
  password: string
}

export interface SignUpRequest {
  username: string
  password: string
  roles?: string[]
}

export interface AuthResponse {
  id?: number
  username?: string
  token?: string
  roles?: string[]
}

export interface ApiRole {
  id?: number
  name?: string
}
