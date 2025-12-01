import { bootstrapApplication } from "@angular/platform-browser"
import { provideRouter } from "@angular/router"
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { HTTP_INTERCEPTORS } from "@angular/common/http"
import { AuthInterceptor } from "./app/core/interceptors/auth.interceptor"
import { AppComponent } from "./app/app.component"
import { routes } from "./app/app.routes"

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
}).catch((err) => console.error(err))
