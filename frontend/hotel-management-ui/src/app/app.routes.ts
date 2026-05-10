import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Home } from './pages/home/home';
import { Rooms } from './pages/rooms/rooms';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MyBookings } from './pages/my-bookings/my-bookings';
import { Admin } from './pages/admin/admin';
import { AdminRooms } from './pages/admin-rooms/admin-rooms';
import { AdminBookings } from './pages/admin-bookings/admin-bookings';
import { NotFound } from './pages/not-found/not-found';

import { adminGuard, userGuard } from './core/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'rooms',
        component: Rooms,
      },
      {
        path: 'my-bookings',
        component: MyBookings,
        canActivate: [userGuard],
      },
      {
        path: 'login',
        component: Login,
      },
      {
        path: 'register',
        component: Register,
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        component: Admin,
      },
      {
        path: 'rooms',
        component: AdminRooms,
      },
      {
        path: 'bookings',
        component: AdminBookings,
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];