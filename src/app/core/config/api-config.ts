export const API_CONFIG = {
  residentsBaseUrl: '/api/v1',
  appointmentsBaseUrl: '/api/v1', 
  usersBaseUrl: '/api/v1',
  notificationsBaseUrl: '/api/v1',
  paymentsBaseUrl: '/api/v1',
  foodBaseUrl: '/api/v1',
  iamBaseUrl: '/api/v1',
  // feature toggles
  useBackendServices: true, // set to false to keep using local/mock services
  useRemoteAuth: true, // if true, LoginComponent will use IAM sign-in instead of local mock
}

export type ServiceBaseUrlKey = keyof typeof API_CONFIG

export const DEFAULT_TIMEOUT_MS = 15000
