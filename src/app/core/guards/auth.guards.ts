import { Injectable } from "@angular/core"
import { Router, type CanActivateFn } from "@angular/router"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
class AuthGuardService {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true
    }
    this.router.navigate(["/login"])
    return false
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const authService = new AuthService()
  const router = new Router()
  const guard = new AuthGuardService(authService, router)
  return guard.canActivate()
}
