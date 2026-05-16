import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabaseService = inject(SupabaseService);

  // Solo agregar token a peticiones a nuestra API
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  return from(supabaseService.getSession()).pipe(
    switchMap(session => {
      if (session?.access_token) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        return next(clonedRequest);
      }
      return next(req);
    })
  );
};

// Made with Bob