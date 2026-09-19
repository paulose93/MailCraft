import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CreateOrganizationDialog } from '@/components/CreateOrganizationDialog';
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Sparkles,
  BarChart3,
  Palette,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Send,
  Shield,
  Building2,
} from 'lucide-react';

const orgNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Subscribers', href: '/subscribers', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Templates', href: '/templates', icon: FileText },
  { name: 'AI Studio', href: '/ai-studio', icon: Sparkles },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Brand Kit', href: '/brand-kit', icon: Palette },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const adminNavItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { name: 'Campaigns', href: '/admin/campaigns', icon: Mail },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const DashboardLayout: React.FC = () => {
  const { user, logout, switchOrganization } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const navItems = isAdmin ? adminNavItems : orgNavItems;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold gradient-text whitespace-nowrap">
                NewsletterAI
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center ml-auto w-7 h-7 rounded-md hover:bg-secondary transition-colors cursor-pointer"
          >
            <ChevronLeft className={cn("w-4 h-4 text-muted-foreground transition-transform", collapsed && "rotate-180")} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin badge */}
        {isAdmin && !collapsed && (
          <div className="mx-3 mt-3 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Platform Admin</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3">
          {!collapsed && (
            <div className="flex flex-col gap-3 px-3 py-2 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role === 'SUPER_ADMIN' ? 'Platform Admin' : user?.organization?.name || 'No Organization'}
                  </p>
                </div>
              </div>
              
              {user?.organizations && user.organizations.length > 0 && (
                <div className="mt-1">
                  <select
                    className="w-full bg-secondary border border-border text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                    value={user.organization?.id || ''}
                    onChange={(e) => switchOrganization(e.target.value)}
                  >
                    {user.organizations.map((orgMem) => (
                      <option key={orgMem.organization.id} value={orgMem.organization.id}>
                        {orgMem.organization.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <CreateOrganizationDialog className="w-full mt-1" />
            </div>
          )}
          <Button
            variant="ghost"
            onClick={logout}
            className={cn("w-full text-muted-foreground hover:text-destructive", collapsed ? "px-0 justify-center" : "justify-start")}
          >
            <LogOut className="w-4 h-4 mr-2 shrink-0" />
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-16 px-4 lg:px-6 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-secondary cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {user?.organization && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{user.organization.name}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
