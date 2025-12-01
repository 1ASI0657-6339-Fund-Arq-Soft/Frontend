/* AUTO-GENERATED from OpenAPI: IAM Service */

export interface SignUpResource {
  username?: string
  password?: string
  roles?: string[]
}

export interface SignInResource {
  username?: string
  password?: string
}

export interface AuthenticatedUserResource {
  id?: number
  username?: string
  token?: string
}

export interface UserResource {
  id?: number
  username?: string
  roles?: string[]
}

export interface RoleResource {
  id?: number
  name?: string
}
