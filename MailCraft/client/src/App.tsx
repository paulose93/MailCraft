import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrgDashboard from './pages/OrgDashboard';
import SubscribersPage from './pages/SubscribersPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignEditorPage from './pages/CampaignEditorPage';
import TemplatesPage from './pages/TemplatesPage';
import AIStudioPage from './pages/AIStudioPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BrandKitPage from './pages/BrandKitPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';
import PendingApprovalPage from './pages/PendingApprovalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Redirect based on role
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending-approval" element={<ProtectedRoute><PendingApprovalPage /></ProtectedRoute>} />

            {/* Protected routes with layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Org routes */}
              <Route path="/dashboard" element={<ProtectedRoute roles={['ORG_OWNER', 'ORG_MEMBER']}><OrgDashboard /></ProtectedRoute>} />
              <Route path="/subscribers" element={<ProtectedRoute roles={['ORG_OWNER', 'ORG_MEMBER']}><SubscribersPage /></ProtectedRoute>} />
              <Route path="/campaigns" element={<ProtectedRoute roles={['ORG_OWNER', 'ORG_MEMBER']}><CampaignsPage /></ProtectedRoute>} />
              <Route path="/campaigns/:id" element={<ProtectedRoute roles={['ORG_OWNER', 'ORG_MEMBER']}><CampaignEditorPage /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute roles={['ORG_OWNER', 'ORG_MEMBER']}><TemplatesPage /></ProtectedRoute>} />
              <Route path="/ai-studio" element={<ProtectedRoute roles={['ORG_OWNER', 'ORG_MEMBER']}><AIStudioPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute roles={['ORG_OWNER', 'ORG_MEMBER']}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/brand-kit" element={<ProtectedRoute roles={['ORG_OWNER']}><BrandKitPage /></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/organizations" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/campaigns" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>} />

              {/* Shared routes */}
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#fafafa',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
