import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Send, FileText, BarChart3, Mail, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const OrgDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Subscribers', value: data?.overview?.totalSubscribers || 0, icon: Users, color: 'from-blue-500 to-cyan-500', href: '/subscribers' },
    { label: 'Campaigns Sent', value: data?.overview?.sentCampaigns || 0, icon: Send, color: 'from-primary to-accent', href: '/campaigns' },
    { label: 'Emails Delivered', value: data?.overview?.totalEmailsSent || 0, icon: Mail, color: 'from-emerald-500 to-green-500', href: '/analytics' },
    { label: 'Draft Campaigns', value: data?.overview?.draftCampaigns || 0, icon: FileText, color: 'from-amber-500 to-orange-500', href: '/campaigns' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">
          Welcome back, <span className="gradient-text">{user?.firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your newsletters today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={stat.href}>
              <Card className="hover:border-primary/30 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campaign Performance Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Campaign Performance</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data?.monthlyData && data.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }}
                    />
                    <Bar dataKey="sent" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No campaign data yet</p>
                    <p className="text-xs mt-1">Send your first campaign to see stats</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscriber Growth Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Email Analytics</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data?.monthlyData && data.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa' }}
                    />
                    <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No analytics yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Campaigns</CardTitle>
          <Link to="/campaigns">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data?.recentCampaigns && data.recentCampaigns.length > 0 ? (
            <div className="space-y-3">
              {data.recentCampaigns.slice(0, 5).map((campaign: any) => (
                <Link
                  key={campaign.id}
                  to={`/campaigns/${campaign.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      campaign.status === 'SENT' ? 'bg-emerald-500' :
                      campaign.status === 'DRAFT' ? 'bg-amber-500' :
                      campaign.status === 'SENDING' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{campaign.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      campaign.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' :
                      campaign.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-500' :
                      campaign.status === 'SENDING' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {campaign.status}
                    </span>
                    {campaign.sentCount > 0 && (
                      <span>{campaign.sentCount} sent</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No campaigns yet</p>
              <Link to="/campaigns">
                <Button variant="outline" size="sm" className="mt-3">
                  Create your first campaign
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrgDashboard;
