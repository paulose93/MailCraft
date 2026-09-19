import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Trash2, Loader2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const categories = ['all', 'general', 'welcome', 'product', 'digest', 'events'];

const TemplatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [category, setCategory] = React.useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['templates', category],
    queryFn: async () => { const { data } = await api.get('/templates', { params: { category } }); return data; },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template: any) => {
      return api.post('/templates', {
        name: `${template.name} (Copy)`,
        description: template.description,
        content: template.content,
        designJson: template.designJson,
        category: template.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template duplicated');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground text-sm">Reusable newsletter templates</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(cat)}
            className="capitalize"
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : data?.templates?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No templates found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.templates?.map((template: any, i: number) => (
            <motion.div key={template.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-primary/30 transition-all group overflow-hidden">
                {/* Template preview */}
                <div className="h-48 bg-white rounded-t-xl overflow-hidden">
                  <div
                    className="transform scale-[0.35] origin-top-left w-[286%] h-[286%] pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: template.content || '<p style="color:#999;text-align:center;padding:40px;">No preview</p>' }}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{template.description || 'No description'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary capitalize">{template.category}</span>
                        {template.isBuiltIn && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Built-in</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => duplicateMutation.mutate(template)} title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </Button>
                      {!template.isBuiltIn && (
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(template.id)} className="text-destructive" title="Delete">
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
    </div>
  );
};

export default TemplatesPage;
