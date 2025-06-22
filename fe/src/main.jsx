import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Admin from './admin/index.jsx';
import Dashboard from './dashboard/index.jsx';
import DashboardOverview from './dashboard/overview.jsx';
import Companies from './admin/companies/index.jsx';
import EditCompany from './admin/companies/edit.jsx';
import Agents from './admin/agents/index.jsx';
import AdminDashboard from './admin/dashboard/index.jsx';
import Users from './admin/companies/users/index.jsx';
import Clients from './dashboard/clients/index.jsx';
import ClientForm from './dashboard/clients/form.jsx';
import Followups from './dashboard/followups/index.jsx';
import FollowupForm from './dashboard/followups/form.jsx';
import FollowupView from './dashboard/followups/view.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/admin',
    Component: Admin,
    children: [
      {
        index: true,
        Component: AdminDashboard,
      },
      {
        path: '/admin/companies',
        children: [
          {
            index: true,
            Component: Companies,
          },
          {
            path: '/admin/companies/:id/edit',
            Component: EditCompany,
          },
          {
            path: '/admin/companies/:id/users',
            Component: Users,
          },
        ],
      },
      {
        path: '/admin/agents',
        Component: Agents,
      },
    ],
  },
  {
    path: '/dashboard',
    Component: Dashboard,
    children: [
      {
        index: true,
        Component: DashboardOverview,
      },
      {
        path: '/dashboard/clients',
        children: [
          {
            index: true,
            Component: Clients,
          },
          {
            path: '/dashboard/clients/new',
            Component: ClientForm,
          },
          {
            path: '/dashboard/clients/:id/edit',
            Component: ClientForm,
          },
        ],
      },
      {
        path: '/dashboard/followups',
        children: [
          {
            index: true,
            Component: Followups,
          },
          {
            path: '/dashboard/followups/new',
            Component: FollowupForm,
          },
          {
            path: '/dashboard/followups/:id',
            Component: FollowupView,
          },
          {
            path: '/dashboard/followups/:id/edit',
            Component: FollowupForm,
          },
        ],
      },
    ],
  },
]);

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
