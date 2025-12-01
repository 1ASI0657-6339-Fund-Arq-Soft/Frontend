import { Injectable, inject } from "@angular/core"
import { Router, type CanActivateFn, type ActivatedRouteSnapshot } from "@angular/router"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
class RoleGuardService {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(requiredRole: string): boolean {
    const currentUser = this.authService.getCurrentUser()

    if (!currentUser) {
      this.router.navigate(["/login"])
      return false
    }

    if (currentUser.role === requiredRole) {
      return true
    }

    this.router.navigate(["/dashboard"])
    return false
  }
}

export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state) => {
    const authService = inject(AuthService)
    const router = inject(Router)
    const guard = new RoleGuardService(authService, router)
    return guard.canActivate(requiredRole)
  }
}
