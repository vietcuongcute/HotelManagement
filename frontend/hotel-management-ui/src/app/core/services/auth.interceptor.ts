import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const rawUser = localStorage.getItem('hotel_auth_user');

  if (!rawUser) {
    return next(req);
  }

  try {
    const user = JSON.parse(rawUser);

    if (!user?.token) {
      return next(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    return next(authReq);
  } catch {
    return next(req);
  }
};