import React, { useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Wand2, Type, Target, MessageSquare, RefreshCw, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const tones = ['professional', 'casual', 'friendly', 'formal', 'humorous', 'inspirational', 'urgent'];

function useSessionState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  React.useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

const AIStudioPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useSessionState('ai-studio-result', '');
  const [subjects, setSubjects] = useSessionState<string[]>('ai-studio-subjects', []);
  const [ctas, setCtas] = useSessionState<string[]>('ai-studio-ctas', []);
  const [copied, setCopied] = useState<string | null>(null);

  // Rewrite
  const [rewriteContent, setRewriteContent] = useSessionState('ai-studio-rewriteContent', '');
  const [rewriteInstruction, setRewriteInstruction] = useSessionState('ai-studio-rewriteInstruction', '');

  // Grammar
  const [grammarContent, setGrammarContent] = useSessionState('ai-studio-grammarContent', '');

  // Tone
  const [toneContent, setToneContent] = useSessionState('ai-studio-toneContent', '');
  const [selectedTone, setSelectedTone] = useSessionState('ai-studio-selectedTone', 'professional');

  // Subject
  const [subjectContent, setSubjectContent] = useSessionState('ai-studio-subjectContent', '');

  // CTA
  const [ctaContent, setCtaContent] = useSessionState('ai-studio-ctaContent', '');
  const [ctaGoal, setCtaGoal] = useSessionState('ai-studio-ctaGoal', '');

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleRewrite = async () => {
    setLoading('rewrite');
    try {
      const { data } = await api.post('/ai/rewrite', { content: rewriteContent, instruction: rewriteInstruction });
      setResult(data.content);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(null); }
  };

  const handleGrammar = async () => {
    setLoading('grammar');
    try {
      const { data } = await api.post('/ai/grammar', { content: grammarContent });
      setResult(data.content);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(null); }
  };

  const handleTone = async () => {
    setLoading('tone');
    try {
      const { data } = await api.post('/ai/tone', { content: toneContent, tone: selectedTone });
      setResult(data.content);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(null); }
  };

  const handleSubject = async () => {
    setLoading('subject');
    try {
      const { data } = await api.post('/ai/subject', { content: subjectContent, count: 5 });
      setSubjects(data.subjects);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(null); }
  };

  const handleCTA = async () => {
    setLoading('cta');
    try {
      const { data } = await api.post('/ai/cta', { content: ctaContent, goal: ctaGoal });
      setCtas(data.ctas);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> AI Studio
        </h1>
        <p className="text-muted-foreground text-sm">AI-powered content creation tools for your newsletters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div>
          <Tabs defaultValue="rewrite" className="w-full">
            <TabsList className="w-full grid grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
              <TabsTrigger value="grammar">Grammar</TabsTrigger>
              <TabsTrigger value="tone">Tone</TabsTrigger>
              <TabsTrigger value="subject">Subject</TabsTrigger>
              <TabsTrigger value="cta">CTA</TabsTrigger>
            </TabsList>

            <TabsContent value="rewrite">
              <Card>
                <CardHeader><CardTitle className="text-base">Rewrite Content</CardTitle><CardDescription>Improve or rewrite existing content</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea placeholder="Paste your content here..." rows={6} value={rewriteContent} onChange={(e) => setRewriteContent(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Instruction</Label>
                    <Input placeholder="e.g. Make it more engaging" value={rewriteInstruction} onChange={(e) => setRewriteInstruction(e.target.value)} />
                  </div>
                  <Button onClick={handleRewrite} disabled={!rewriteContent || loading === 'rewrite'} className="w-full">
                    {loading === 'rewrite' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 w-4 h-4" />}
                    Rewrite
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="grammar">
              <Card>
                <CardHeader><CardTitle className="text-base">Fix Grammar</CardTitle><CardDescription>Fix spelling and grammar errors</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea placeholder="Paste content with errors..." rows={8} value={grammarContent} onChange={(e) => setGrammarContent(e.target.value)} />
                  </div>
                  <Button onClick={handleGrammar} disabled={!grammarContent || loading === 'grammar'} className="w-full">
                    {loading === 'grammar' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Type className="mr-2 w-4 h-4" />}
                    Fix Grammar
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tone">
              <Card>
                <CardHeader><CardTitle className="text-base">Change Tone</CardTitle><CardDescription>Rewrite content in a different tone</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea placeholder="Paste your content..." rows={6} value={toneContent} onChange={(e) => setToneContent(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Tone</Label>
                    <div className="flex gap-2 flex-wrap">
                      {tones.map((t) => (
                        <Button key={t} variant={selectedTone === t ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTone(t)} className="capitalize">{t}</Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleTone} disabled={!toneContent || loading === 'tone'} className="w-full">
                    {loading === 'tone' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 w-4 h-4" />}
                    Change Tone
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subject">
              <Card>
                <CardHeader><CardTitle className="text-base">Generate Subject Lines</CardTitle><CardDescription>AI-generated email subject lines</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Newsletter Content / Topic</Label>
                    <Textarea placeholder="Describe your newsletter content..." rows={4} value={subjectContent} onChange={(e) => setSubjectContent(e.target.value)} />
                  </div>
                  <Button onClick={handleSubject} disabled={loading === 'subject'} className="w-full">
                    {loading === 'subject' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 w-4 h-4" />}
                    Generate Subjects
                  </Button>
                  {subjects.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {subjects.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                          <span className="text-sm">{s}</span>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(s, `sub-${i}`)}>
                            {copied === `sub-${i}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cta">
              <Card>
                <CardHeader><CardTitle className="text-base">Generate CTAs</CardTitle><CardDescription>Call-to-action button text ideas</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Newsletter Content / Topic</Label>
                    <Textarea placeholder="Describe your newsletter..." rows={4} value={ctaContent} onChange={(e) => setCtaContent(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal</Label>
                    <Input placeholder="e.g. Drive sign-ups" value={ctaGoal} onChange={(e) => setCtaGoal(e.target.value)} />
                  </div>
                  <Button onClick={handleCTA} disabled={loading === 'cta'} className="w-full">
                    {loading === 'cta' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 w-4 h-4" />}
                    Generate CTAs
                  </Button>
                  {ctas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {ctas.map((c, i) => (
                        <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                          onClick={() => copyToClipboard(c, `cta-${i}`)}
                          className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                          {c}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Result Panel */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Result Preview</CardTitle>
              {result && (
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result, 'result')}>
                  {copied === 'result' ? <Check className="mr-1 w-3 h-3 text-emerald-500" /> : <Copy className="mr-1 w-3 h-3" />}
                  Copy HTML
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <div className="relative">
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="mt-4 text-sm">AI is generating content...</p>
                  </motion.div>
                ) : result ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-white rounded-lg p-4 max-h-[600px] overflow-y-auto text-gray-900"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">AI-generated content will appear here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIStudioPage;
