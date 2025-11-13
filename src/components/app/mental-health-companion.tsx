
'use client';

import * as React from 'react';
import { Send, User, Bot, Loader2, BrainCircuit, HeartPulse, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { talkToCompanionAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Badge } from '../ui/badge';
import type { MentalHealthAgentOutput } from '@/ai/flows/mental-health-agent';
import { FeatureHeader } from './feature-header';

interface Message {
  role: 'user' | 'companion';
  text: string;
}

export default function MentalHealthCompanion() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [mood, setMood] = React.useState<MentalHealthAgentOutput['mood'] | null>(null);
  
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        // @ts-ignore
      scrollAreaRef.current.children[1].scrollTop = scrollAreaRef.current.children[1].scrollHeight;
    }
  }, [messages]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const history = messages.map(m => `${m.role}: ${m.text}`);

    const { data, error } = await talkToCompanionAction(inputValue, history);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
      // remove the user message if there was an error
      setMessages(prev => prev.slice(0, prev.length -1));
      return;
    }

    if (data) {
      const companionMessage: Message = { role: 'companion', text: data.response };
      setMessages((prev) => [...prev, companionMessage]);
      setMood(data.mood);
    }
  };

  const getMoodBadgeVariant = (mood: MentalHealthAgentOutput['mood'] | null) => {
    switch (mood) {
      case 'Positive':
        return 'default';
      case 'Negative':
        return 'destructive';
      case 'Neutral':
      case 'Mixed':
        return 'secondary';
      default:
        return 'outline';
    }
  };


  return (
    <div className="space-y-8">
      <FeatureHeader
        icon={BrainCircuit}
        subtitle="Mental Health Companion"
        title="Share what's on your mind—we'll respond with empathy and gentle guidance."
        description="Built with trauma-informed language and supportive coping prompts, your AidFusion companion is here to reflect, encourage, and help you reframe the day."
        accent="rose"
        stats={[
          { label: 'Avg. check-in length', value: '5–7 exchanges' },
          { label: 'Mood detection', value: 'Positive • Neutral • Mixed • Negative' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr),minmax(0,1fr)]">
        <Card className="flex h-[620px] flex-col">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-headline">Your Companion</CardTitle>
              <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
                A safe space to talk and reflect. Conversations reset whenever you need a fresh start.
              </CardDescription>
            </div>
            {mood && (
              <Badge variant={getMoodBadgeVariant(mood)} className="rounded-xl border border-white/60 bg-white/70 px-3 py-1 text-xs capitalize shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                Mood: {mood}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-5 px-6 pb-6 pt-0 md:px-8">
            <ScrollArea className="flex-1 pr-2" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="space-y-4 rounded-3xl border border-white/60 bg-white/75 p-8 text-center text-muted-foreground shadow-inner shadow-rose-100/40 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300">
                      <HeartPulse className="h-7 w-7" />
                    </div>
                    <p className="text-base text-slate-700 dark:text-slate-200">
                      I’m here to listen. Share a win, a worry, or something you can’t say out loud elsewhere.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      This is a private, non-judgmental space. We can journal together, brainstorm coping strategies, or just sit with your feelings.
                    </p>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'companion' && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-rose-500/15 text-rose-600 dark:text-rose-300">
                          <BrainCircuit className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow",
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 text-white shadow-rose-200/50'
                          : 'border border-white/60 bg-white/80 text-slate-700 shadow-rose-100/50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200'
                      )}
                    >
                      <p>{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-rose-500/10 text-rose-600 dark:text-rose-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-rose-500/15 text-rose-600 dark:text-rose-300">
                        <BrainCircuit className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-inner shadow-rose-100/50 dark:border-slate-800 dark:bg-slate-900/60">
                      <Loader2 className="h-5 w-5 animate-spin text-rose-500 dark:text-rose-300" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/75 p-4 shadow-inner shadow-rose-100/40 dark:border-slate-800 dark:bg-slate-900/60 md:flex-row md:items-center md:gap-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="How are you feeling today?"
                disabled={isLoading}
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900/70"
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 shadow-lg shadow-rose-200/60 transition hover:shadow-rose-300/70"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="space-y-6">
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-rose-100/40 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <Sparkles className="h-5 w-5 text-rose-500" />
                Gentle prompts to explore
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  “Help me reframe an anxious thought I had this morning.”
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  “Guide me through a 1-minute grounding exercise.”
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  “Can you help me celebrate something small I achieved today?”
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 text-xs text-slate-500 shadow-inner shadow-rose-100/40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <p className="font-semibold text-slate-600 dark:text-slate-100">Safety reminder</p>
              <p className="mt-2 leading-relaxed">
                If you are in crisis or worried you might hurt yourself or others, please call local emergency services or a trusted helpline immediately. AidFusion is supportive but not a substitute for urgent care.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
