import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { Loading } from './components/ui/Loading';

const HomePage = lazy(() => import('./pages/public/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ProductsPage = lazy(() => import('./pages/customer/ProductsPage').then(m => ({ default: m.ProductsPage })));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <Suspense fallback={<Loading fullScreen />}>{children}</Suspense>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return <Suspense fallback={<Loading fullScreen />}>{children}</Suspense>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            <Route
              path="/"
              element={
                <MainLayout>
                  <Suspense fallback={<Loading fullScreen />}>
                    <HomePage />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/products"
              element={
                <MainLayout>
                  <Suspense fallback={<Loading fullScreen />}>
                    <ProductsPage />
                  </Suspense>
                </MainLayout>
              }
            />

            <Route
              path="/services"
              element={
                <MainLayout>
                  <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Services - Coming Soon</h1>
                  </div>
                </MainLayout>
              }
            />

            <Route
              path="/mechanics"
              element={
                <MainLayout>
                  <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Find Mechanics - Coming Soon</h1>
                  </div>
                </MainLayout>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute roles={['customer']}>
                  <MainLayout>
                    <CustomerDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/*"
              element={
                <ProtectedRoute roles={['vendor']}>
                  <MainLayout>
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <h1 className="text-3xl font-bold">Vendor Dashboard - Coming Soon</h1>
                    </div>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/mechanic/*"
              element={
                <ProtectedRoute roles={['mechanic']}>
                  <MainLayout>
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <h1 className="text-3xl font-bold">Mechanic Dashboard - Coming Soon</h1>
                    </div>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
