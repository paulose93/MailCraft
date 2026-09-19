import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { BarChart3, Mail, Users, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const AnalyticsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => { const { data } = await api.get('/analytics/dashboard'); return data; },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const overview = data?.overview || {};

  const pieData = [
    { name: 'Delivered', value: overview.totalEmailsSent || 0 },
    { name: 'Failed', value: overview.totalEmailsFailed || 0 },
  ].filter(d => d.value > 0);

  const statsCards = [
    { label: 'Total Emails Sent', value: overview.totalEmailsSent || 0, icon: Mail, color: 'from-primary to-accent' },
    { label: 'Delivery Rate', value: overview.totalEmailsSent > 0 ? `${((overview.totalEmailsSent / (overview.totalEmailsSent + overview.totalEmailsFailed)) * 100).toFixed(1)}%` : 'N/A', icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
    { label: 'Failed Emails', value: overview.totalEmailsFailed || 0, icon: XCircle, color: 'from-red-500 to-rose-500' },
    { label: 'Active Subscribers', value: overview.activeSubscribers || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your newsletter performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Campaign Performance */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Monthly Campaign Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              {data?.monthlyData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }} />
                    <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} name="Sent" />
                    <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} name="Failed" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No data available yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Pie Chart */}
        <Card>
          <CardHeader><CardTitle className="text-base">Delivery Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={idx === 0 ? '#6366f1' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No delivery data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns Performance */}
      <Card>
        <CardHeader><CardTitle className="text-base">Campaign History</CardTitle></CardHeader>
        <CardContent>
          {data?.recentCampaigns?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">CAMPAIGN</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">STATUS</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">SENT</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">FAILED</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">RATE</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCampaigns.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-emerald-500">{c.sentCount}</td>
                      <td className="px-4 py-3 text-sm text-red-500">{c.failedCount}</td>
                      <td className="px-4 py-3 text-sm">{c.totalRecipients > 0 ? `${((c.sentCount / c.totalRecipients) * 100).toFixed(1)}%` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{c.sentAt ? new Date(c.sentAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground"><p>No campaigns sent yet</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
