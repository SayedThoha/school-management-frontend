import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const user = authService.currentUser;
  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
