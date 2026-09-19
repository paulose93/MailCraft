import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Save, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const toneOptions = ['professional', 'casual', 'friendly', 'formal', 'humorous', 'inspirational'];

const BrandKitPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const { isLoading } = useQuery({
    queryKey: ['brand-kit'],
    queryFn: async () => {
      const { data } = await api.get('/brand-kit');
      setForm(data.brandKit);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/brand-kit', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-kit'] });
      toast.success('Brand kit updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return data;
    },
    onSuccess: (data) => {
      setForm({ ...form, logoUrl: data.url });
      toast.success('Logo uploaded');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to upload logo');
    },
  });

  if (isLoading || !form) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" /> Brand Kit
        </h1>
        <p className="text-muted-foreground text-sm">Define your brand identity for AI-generated content</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand Identity</CardTitle>
          <CardDescription>This information will be used by AI to generate brand-consistent newsletters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                  <Palette className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <input type="file" accept="image/*" id="logo-upload" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadMutation.mutate(f); }} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 w-4 h-4" />}
                  Upload Logo
                </Button>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={form.companyName || ''} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <Input value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="flex-1" />
              </div>
            </div>
          </div>

          {/* Brand Description */}
          <div className="space-y-2">
            <Label>Brand Description</Label>
            <Textarea placeholder="Describe your brand in a few sentences..." rows={3}
              value={form.brandDescription || ''} onChange={(e) => setForm({ ...form, brandDescription: e.target.value })} />
          </div>

          {/* Writing Tone */}
          <div className="space-y-2">
            <Label>Writing Tone</Label>
            <div className="flex gap-2 flex-wrap">
              {toneOptions.map((t) => (
                <Button key={t} variant={form.writingTone === t ? 'default' : 'outline'} size="sm" onClick={() => setForm({ ...form, writingTone: t })} className="capitalize">
                  {t}
                </Button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input placeholder="e.g. Tech professionals, small business owners"
              value={form.audience || ''} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
          </div>

          {/* Mission */}
          <div className="space-y-2">
            <Label>Mission Statement</Label>
            <Textarea placeholder="Your company's mission..." rows={2}
              value={form.mission || ''} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <Label>Brand Preview</Label>
            <div className="rounded-lg overflow-hidden border border-border">
              <div style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }} className="h-20 flex flex-col items-center justify-center gap-2">
                {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="h-8 object-contain" />}
                <span className="text-white font-bold text-lg">{form.companyName}</span>
              </div>
              <div className="p-4 bg-white">
                <p className="text-gray-800 text-sm">This is how your brand colors will look in newsletters.</p>
                <button style={{ backgroundColor: form.primaryColor }} className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium">
                  Sample CTA Button
                </button>
              </div>
            </div>
          </div>

          <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="w-full">
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
            Save Brand Kit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandKitPage;
