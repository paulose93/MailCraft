import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, User, Lock, Mail, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [emailSettings, setEmailSettings] = useState<any>(null);

  useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings');
      if (data.settings) setEmailSettings(data.settings);
      return data;
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: any) => api.put('/settings/profile', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success('Profile updated'); },
    onError: () => toast.error('Failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => api.put('/settings/password', data),
    onSuccess: () => { setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }); toast.success('Password changed'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const emailMutation = useMutation({
    mutationFn: (data: any) => api.put('/settings/organization', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success('Email settings updated'); },
    onError: () => toast.error('Failed'),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground text-sm">Manage your account and organization settings</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
          <TabsTrigger value="password"><Lock className="w-4 h-4 mr-2" /> Password</TabsTrigger>
          {user?.role !== 'SUPER_ADMIN' && (
            <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Email</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); profileMutation.mutate(profile); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role?.replace('_', ' ') || ''} disabled className="opacity-60" />
                </div>
                <Button type="submit" disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
                passwordMutation.mutate({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={8} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                </div>
                <Button type="submit" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 w-4 h-4" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Settings</CardTitle>
              <CardDescription>Configure how your newsletters are sent</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); emailMutation.mutate(emailSettings); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sender Name</Label>
                    <Input value={emailSettings?.senderName || ''} onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sender Email</Label>
                    <Input type="email" value={emailSettings?.senderEmail || ''} onChange={(e) => setEmailSettings({ ...emailSettings, senderEmail: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reply-To Email</Label>
                  <Input type="email" value={emailSettings?.replyToEmail || ''} onChange={(e) => setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email Footer</Label>
                  <Input value={emailSettings?.emailFooter || ''} onChange={(e) => setEmailSettings({ ...emailSettings, emailFooter: e.target.value })} />
                </div>
                <Button type="submit" disabled={emailMutation.isPending}>
                  {emailMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                  Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
