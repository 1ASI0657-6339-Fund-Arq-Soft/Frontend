import { Injectable } from '@angular/core'
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { AuthService } from '../services/auth.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth header for login/signup requests
    const isAuthRequest = req.url.includes('/authentication/sign-in') || req.url.includes('/authentication/sign-up')
    
    let modifiedReq = req
    
    if (!isAuthRequest) {
      const token = this.auth.getToken()
      if (token) {
        modifiedReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        })
      }
    }

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 unauthorized - could logout user here if needed
        if (error.status === 401 && !isAuthRequest) {
          // Optionally: this.auth.logout()
        }
        
        return throwError(() => error)
      })
    )
  }
}
