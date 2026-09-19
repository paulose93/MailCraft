import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Send, Plus, Trash2, Edit, Loader2, ArrowLeft, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CampaignsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', subject: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => { const { data } = await api.get('/campaigns'); return data; },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/campaigns', d),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowCreateDialog(false);
      navigate(`/campaigns/${res.data.campaign.id}`);
      toast.success('Campaign created');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground text-sm">Create and manage your email campaigns</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : data?.campaigns?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Send className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No campaigns yet</p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>Create your first campaign</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {data?.campaigns?.map((campaign: any, i: number) => (
            <motion.div key={campaign.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-primary/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium truncate">{campaign.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                          campaign.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' :
                          campaign.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-500' :
                          campaign.status === 'SENDING' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">{campaign.subject}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {campaign.sentCount > 0 && <span>{campaign.sentCount} sent</span>}
                        {campaign.failedCount > 0 && <span className="text-red-400">{campaign.failedCount} failed</span>}
                        <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      <Link to={`/campaigns/${campaign.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                      </Link>
                      {campaign.status === 'DRAFT' && (
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(campaign.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Give your campaign a name and subject line</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(newCampaign); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name *</Label>
              <Input placeholder="e.g. March Newsletter" value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Subject Line *</Label>
              <Input placeholder="e.g. Your March update is here!" value={newCampaign.subject} onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Edit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsPage;
