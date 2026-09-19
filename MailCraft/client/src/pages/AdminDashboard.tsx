import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Users, Send, Mail, Shield, Search, Ban, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'dashboard' | 'organizations' | 'campaigns'>('dashboard');

  // Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const { data } = await api.get('/admin/stats'); return data.stats; },
  });

  // Organizations
  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin-orgs', search],
    queryFn: async () => { const { data } = await api.get('/admin/organizations', { params: { search } }); return data; },
    enabled: tab !== 'campaigns',
  });

  // Campaigns
  const { data: campaignsData } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: async () => { const { data } = await api.get('/admin/campaigns'); return data; },
    enabled: tab === 'campaigns',
  });

  const reviewMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/organizations/${id}/review`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Organization under review'); },
    onError: (error: any) => toast.error(error.response?.data?.error || error.message || 'Failed to review organization'),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/organizations/${id}/approve`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Organization approved'); },
    onError: (error: any) => toast.error(error.response?.data?.error || error.message || 'Failed to approve organization'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/organizations/${id}/reject`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Organization rejected'); },
    onError: (error: any) => toast.error(error.response?.data?.error || error.message || 'Failed to reject organization'),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/organizations/${id}/suspend`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Organization suspended'); },
    onError: (error: any) => toast.error(error.response?.data?.error || error.message || 'Failed to suspend organization'),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/organizations/${id}/restore`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Organization restored'); },
    onError: (error: any) => toast.error(error.response?.data?.error || error.message || 'Failed to restore organization'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/organizations/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); queryClient.invalidateQueries({ queryKey: ['admin-stats'] }); toast.success('Organization deleted'); },
    onError: (error: any) => toast.error(error.response?.data?.error || error.message || 'Failed to delete organization'),
  });

  const statCards = [
    { label: 'Organizations', value: stats?.totalOrgs || 0, icon: Building2, color: 'from-primary to-accent' },
    { label: 'Active', value: stats?.activeOrgs || 0, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
    { label: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Subscribers', value: stats?.totalSubscribers || 0, icon: Users, color: 'from-amber-500 to-orange-500' },
    { label: 'Total Campaigns', value: stats?.totalCampaigns || 0, icon: Send, color: 'from-purple-500 to-pink-500' },
    { label: 'Emails Sent', value: stats?.totalEmailsSent || 0, icon: Mail, color: 'from-teal-500 to-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform-wide management</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {(['dashboard', 'organizations', 'campaigns'] as const).map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)} className="capitalize">{t}</Button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                      </div>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {tab === 'organizations' && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search organizations..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              {orgsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">ORGANIZATION</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">STATUS</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">USERS</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">SUBSCRIBERS</th>
                        <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">CAMPAIGNS</th>
                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgsData?.organizations?.map((org: any) => (
                        <tr key={org.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium">{org.name}</p>
                              <p className="text-xs text-muted-foreground">{org.slug}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              org.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                              org.status === 'REQUESTED' ? 'bg-blue-500/10 text-blue-500' :
                              org.status === 'UNDER_REVIEW' ? 'bg-indigo-500/10 text-indigo-500' :
                              org.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                            }`}>{org.status}</span>
                          </td>
                          <td className="px-4 py-3 text-sm">{org._count?.members || 0}</td>
                          <td className="px-4 py-3 text-sm">{org._count?.subscribers || 0}</td>
                          <td className="px-4 py-3 text-sm">{org._count?.campaigns || 0}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              {org.status === 'REQUESTED' && (
                                <Button variant="ghost" size="sm" onClick={() => reviewMutation.mutate(org.id)} className="text-blue-500 hover:text-blue-400">
                                  <Search className="w-4 h-4 mr-1" /> Review
                                </Button>
                              )}
                              {org.status === 'UNDER_REVIEW' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => approveMutation.mutate(org.id)} className="text-emerald-500 hover:text-emerald-400">
                                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => rejectMutation.mutate(org.id)} className="text-red-500 hover:text-red-400">
                                    <Ban className="w-4 h-4 mr-1" /> Reject
                                  </Button>
                                </>
                              )}
                              {org.status === 'ACTIVE' && (
                                <Button variant="ghost" size="sm" onClick={() => suspendMutation.mutate(org.id)} className="text-amber-500 hover:text-amber-400">
                                  <Ban className="w-4 h-4 mr-1" /> Suspend
                                </Button>
                              )}
                              {org.status === 'SUSPENDED' && (
                                <Button variant="ghost" size="sm" onClick={() => restoreMutation.mutate(org.id)} className="text-emerald-500 hover:text-emerald-400">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Restore
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(org.id)} className="text-destructive hover:text-destructive/80">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === 'campaigns' && (
        <Card>
          <CardHeader><CardTitle className="text-base">All Platform Campaigns</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">CAMPAIGN</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">ORGANIZATION</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">STATUS</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">SENT</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignsData?.campaigns?.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.organization?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{c.sentCount}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
