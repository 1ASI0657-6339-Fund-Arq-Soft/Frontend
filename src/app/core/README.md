# SeniorHub — frontend API integration (microservices)

This folder contains a small, typed integration layer for the SeniorHub frontend which talks to the 6 microservices you listed.

What I added:
- Centralized config with baseUrls: `src/app/core/config/api-config.ts`
- TypeScript interfaces (DTOs) for API models: `src/app/core/models/api/*`
- API services for each microservice: `src/app/core/services/*-api.service.ts`
- Auth interceptor that adds `Authorization: Bearer <token>` from `AuthService`
- Examples demonstrating usage: `src/app/core/examples/*-sample.component.ts`

Quick usage
1. Sign-in (remote IAM):
   const auth = await authService.signInRemote({ username, password }).subscribe(...)

2. Use a typed service (example, Residents):
   residentsApi.getAll().subscribe({ next: (list) => console.log(list), error: (e) => console.error(e) })

Notes & next steps
- AuthService still contains the in-project mock sign-in and register — `signInRemote` and `signUpRemote` call the real IAM endpoints.
- If you prefer Promises instead of Observables I can provide wrapper methods.
- For production builds you might want to move URLs to environment files and set up proper file replacements in `angular.json`.

Configuration / feature flags
-----------------------------
- `API_CONFIG.useBackendServices` — when true (default) components will try to fetch data from your backend microservices. If the backend is unreachable some components have fallbacks to local mock data.
- `API_CONFIG.useRemoteAuth` — when true (default) the login form will call `signInRemote` against the IAM service. Set to false to keep the local mock login behavior.
