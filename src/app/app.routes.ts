import { Routes } from '@angular/router';
import { clientGuard, guestGuard } from './iam/guards/client.guard';
import { AccessPage } from './iam/pages/access/access.page';
import { Shell } from './shared/ui/shell';

export const routes: Routes = [
  { path: 'sign-in', component: AccessPage, canActivate: [guestGuard], data: { mode: 'sign-in' }, title: 'Chambita' },
  { path: 'sign-up', component: AccessPage, canActivate: [guestGuard], data: { mode: 'sign-up' }, title: 'Chambita' },
  {
    path: '',
    component: Shell,
    canActivate: [clientGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./projects/pages/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      { path: 'projects/new', loadComponent: () => import('./projects/pages/publish-project/publish-project.page').then((m) => m.PublishProjectPage) },
      { path: 'projects/:projectId/proposals', loadComponent: () => import('./projects/pages/proposals/proposals.page').then((m) => m.ProposalsPage) },
      { path: 'students/:studentId', loadComponent: () => import('./profiles/pages/student-profile/student-profile.page').then((m) => m.StudentProfilePage) },
      { path: 'engagements', loadComponent: () => import('./engagements/pages/engagements-list/engagements-list.page').then((m) => m.EngagementsListPage) },
      { path: 'engagements/:engagementId', loadComponent: () => import('./engagements/pages/engagement-detail/engagement-detail.page').then((m) => m.EngagementDetailPage) },
      { path: 'engagements/:engagementId/payment', loadComponent: () => import('./payments/pages/payment/payment.page').then((m) => m.PaymentPage) },
      { path: 'engagements/:engagementId/review', loadComponent: () => import('./engagements/pages/review-delivery/review-delivery.page').then((m) => m.ReviewDeliveryPage) },
      { path: 'engagements/:engagementId/rating', loadComponent: () => import('./reputation/pages/rate-student/rate-student.page').then((m) => m.RateStudentPage) },
      { path: 'profile', loadComponent: () => import('./profiles/pages/client-profile/client-profile.page').then((m) => m.ClientProfilePage) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
