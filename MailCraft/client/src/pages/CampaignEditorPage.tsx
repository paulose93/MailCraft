import React, { useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Save, Send, Loader2, Sparkles, Bot, User, Check } from 'lucide-react';
import { toast } from 'sonner';
import EmailEditor, { EditorRef } from 'react-email-editor';

const CampaignEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const emailEditorRef = useRef<EditorRef>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [subject, setSubject] = useState('');
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string, designJson?: any }[]>([
    { role: 'ai', text: 'Hi! I am your AI Design Assistant. Describe the email you want to create, and I will generate it for you to edit.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data } = await api.get(`/campaigns/${id}`);
      setSubject(data.campaign.subject);
      return data;
    },
  });

  const campaign = data?.campaign;
  const isSent = campaign?.status === 'SENT' || campaign?.status === 'SENDING';

  const saveMutation = useMutation({
    mutationFn: async (isAutosave?: boolean) => {
      return new Promise<void>((resolve, reject) => {
        emailEditorRef.current?.editor?.exportHtml(async (htmlData) => {
          try {
            const { design, html } = htmlData;
            await api.put(`/campaigns/${id}`, {
              subject,
              content: html,
              designJson: design,
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
    },
    onSuccess: (_, isAutosave) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      if (!isAutosave) {
        toast.success('Campaign saved');
      }
    },
    onError: () => toast.error('Failed to save'),
  });

  const triggerAutosave = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      saveMutation.mutate(true);
    }, 3000);
  }, [saveMutation]);

  const onEditorReady = useCallback(() => {
    setEditorReady(true);
    const attachListener = () => {
      emailEditorRef.current?.editor?.addEventListener('design:updated', () => {
        triggerAutosave();
      });
    };

    if (campaign?.designJson) {
      setTimeout(() => {
        emailEditorRef.current?.editor?.loadDesign(campaign.designJson);
        attachListener();
      }, 500);
    } else {
      attachListener();
    }
  }, [campaign, triggerAutosave]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      // Save first, then send
      await new Promise<void>((resolve, reject) => {
        emailEditorRef.current?.editor?.exportHtml(async (htmlData) => {
          try {
            const { design, html } = htmlData;
            await api.put(`/campaigns/${id}`, { subject, content: html, designJson: design });
            resolve();
          } catch (err) { reject(err); }
        });
      });
      return api.post(`/campaigns/${id}/send`);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      setShowSendDialog(false);
      toast.success(res.data.message);
      navigate('/campaigns');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Send failed'),
  });

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const history = chatMessages.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const { data } = await api.post('/ai/chat', { prompt: userMessage, history });
      
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: data.message, designJson: data.designJson },
      ]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to get AI response');
      setChatMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const applyAiDesign = (designJson: any) => {
    if (!emailEditorRef.current?.editor) return;
    emailEditorRef.current.editor.loadDesign(designJson);
    toast.success('Design applied! You can now edit it.');
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{campaign?.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              campaign?.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {campaign?.status}
            </span>
          </div>
        </div>
        {!isSent && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => saveMutation.mutate(false)} disabled={saveMutation.isPending || !editorReady}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
              Save Draft
            </Button>
            <Button onClick={() => setShowSendDialog(true)} disabled={!editorReady}>
              <Send className="mr-2 w-4 h-4" /> Send Campaign
            </Button>
          </div>
        )}
      </div>

      {/* Subject line editor */}
      {!isSent && (
        <div className="flex items-center gap-3">
          <Label className="shrink-0">Subject:</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject line..."
            className="max-w-lg"
          />
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex gap-4 h-[calc(100vh-280px)]">
        {/* Email Editor */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full">
            <EmailEditor
              ref={emailEditorRef}
              onReady={onEditorReady}
              minHeight="100%"
              options={{
                appearance: { theme: 'dark' },
                features: { stockImages: { enabled: true, safeSearch: true, defaultSearchTerm: 'newsletter' } },
              }}
            />
          </CardContent>
        </Card>

        {/* AI Chatbot Panel */}
        {!isSent && (
          <Card className="w-80 flex flex-col overflow-hidden border-primary/20 bg-card/50 backdrop-blur">
            <div className="p-3 border-b border-border/50 bg-primary/5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">AI Assistant</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-2 rounded-lg text-sm ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {msg.text}
                    </div>
                    {msg.designJson && (
                      <Button size="sm" variant="outline" className="text-xs h-7 bg-background" onClick={() => applyAiDesign(msg.designJson)}>
                        <Check className="mr-1 w-3 h-3" /> Apply to Editor
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="p-2 rounded-lg bg-secondary text-secondary-foreground flex gap-1">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="p-3 border-t border-border/50 bg-background/50 flex gap-2">
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to write..." 
                className="text-sm h-9"
                disabled={isChatLoading || !editorReady}
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={!chatInput.trim() || isChatLoading || !editorReady}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        )}
      </div>

      {/* Send Confirmation Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              This will send "{campaign?.name}" to all active subscribers. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
            ⚠️ Make sure you've reviewed the content before sending.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>Cancel</Button>
            <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 w-4 h-4" />}
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignEditorPage;
