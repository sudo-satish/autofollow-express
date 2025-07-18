import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Toaster } from 'react-hot-toast';
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
import Knowledge from './dashboard/knowledge/index.jsx';
import KnowledgeForm from './dashboard/knowledge/form.jsx';
import KnowledgeView from './dashboard/knowledge/view.jsx';
import Playground from './playground/index.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/playground',
    Component: Playground,
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
      {
        path: '/dashboard/knowledge',
        children: [
          {
            index: true,
            Component: Knowledge,
          },
          {
            path: '/dashboard/knowledge/new',
            Component: KnowledgeForm,
          },
          {
            path: '/dashboard/knowledge/:id',
            Component: KnowledgeView,
          },
          {
            path: '/dashboard/knowledge/:id/edit',
            Component: KnowledgeForm,
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
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ClerkProvider>
  </StrictMode>
);
