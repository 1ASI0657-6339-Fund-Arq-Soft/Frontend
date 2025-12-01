export const API_CONFIG = {
  residentsBaseUrl: 'http://localhost:8081/api/v1',
  appointmentsBaseUrl: 'http://localhost:8085/api/v1',
  usersBaseUrl: 'http://localhost:8083/api/v1',
  notificationsBaseUrl: 'http://localhost:8084/api/v1',
  paymentsBaseUrl: 'http://localhost:8082/api/v1',
  foodBaseUrl: 'http://localhost:8086/api/v1', // Added food base URL
  iamBaseUrl: 'http://localhost:8080/api/v1',
  // feature toggles
  useBackendServices: true, // set to false to keep using local/mock services
  useRemoteAuth: true, // if true, LoginComponent will use IAM sign-in instead of local mock
}

export type ServiceBaseUrlKey = keyof typeof API_CONFIG

export const DEFAULT_TIMEOUT_MS = 15000
