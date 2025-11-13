
'use client';

import * as React from 'react';
import { Send, User, Bot, Loader2, Mic, MicOff, MessageCircle, ShieldCheck, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { talkToDoctorAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { FeatureHeader } from './feature-header';

interface Message {
  role: 'user' | 'doctor';
  text: string;
  audioUrl?: string;
}

export default function AiDoctor() {
  const { toast } = useToast();
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);

  const audioRef = React.useRef<HTMLAudioElement>(null);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: "Your browser doesn't support speech recognition. Please use Chrome or Safari.",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleUserMessage(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      let description = 'An error occurred during speech recognition.';
      if (event.error === 'network') {
        description = 'Network error. Please check your internet connection and try again.';
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        description = "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (event.error === 'no-speech') {
        description = "No speech was detected. Please try again.";
      }
      
      toast({
        variant: 'destructive',
        title: 'Recognition Error',
        description: description,
      });
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    }

    recognitionRef.current = recognition;
  }, [toast]);


  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInputValue('');
    setIsLoading(true);

    const { data, error } = await talkToDoctorAction(text);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
      return;
    }

    if (data) {
      setMessages((prev) => [...prev, { role: 'doctor', text: data.response, audioUrl: data.audioUrl }]);
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.play();
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserMessage(inputValue);
  }

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e: any) {
        toast({
          variant: 'destructive',
          title: 'Could not start recording',
          description: 'Please ensure microphone permissions are granted and try again.',
        });
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <FeatureHeader
        icon={MessageCircle}
        subtitle="AI Doctor Chat"
        title="Get friendly, evidence-based guidance in conversational form."
        description="AidFusion's virtual doctor listens empathetically, shares safe next steps, and equips you with the right language to speak with your clinical team. Ask anything—symptoms, lab reports, or lifestyle tweaks."
        accent="violet"
        stats={[
          { label: 'Typical response length', value: '120 words' },
          { label: 'Voice support', value: 'Real-time mic & audio' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr),minmax(0,1fr)]">
        <Card className="flex h-[640px] flex-col border-white/40 bg-white/70 dark:bg-slate-900/70">
          <CardContent className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-6">
                {messages.length === 0 && (
                  <div className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-8 text-center text-muted-foreground shadow-inner shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-300">
                      <Bot className="h-7 w-7" />
                    </div>
                    <p className="text-base text-slate-700 dark:text-slate-200">
                      I’m your AI doctor. Ask a question, describe symptoms, or say what worries you.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      I offer general guidance, not a diagnosis. Severe symptoms? Please reach a healthcare professional immediately.
                    </p>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'doctor' && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-violet-500/15 text-violet-600 dark:text-violet-300">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow",
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-violet-500 via-sky-500 to-violet-500 text-white shadow-violet-300/50'
                          : 'border border-white/60 bg-white/80 text-slate-700 shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200'
                      )}
                    >
                      <p>{msg.text}</p>
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-violet-500/10 text-violet-600 dark:text-violet-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-violet-500/15 text-violet-600 dark:text-violet-300">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl border border-white/60 bg-white/80 p-3 shadow-inner shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60">
                      <Loader2 className="h-5 w-5 animate-spin text-violet-500 dark:text-violet-300" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60 md:flex-row md:items-center md:gap-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask the AI doctor a question..."
                disabled={isLoading}
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900/70"
              />
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  onClick={handleMicClick}
                  className={cn(
                    "h-11 w-11 rounded-xl shadow transition",
                    isRecording
                      ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-200/70 hover:shadow-rose-300/70"
                      : "bg-gradient-to-r from-violet-500 to-sky-500 shadow-violet-200/50 hover:shadow-violet-300/70"
                  )}
                  disabled={isLoading}
                >
                  {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-gradient-to-r from-violet-500 via-sky-500 to-violet-500 shadow-lg shadow-violet-200/50 transition hover:shadow-violet-300/70"
                  disabled={isLoading || !inputValue.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="space-y-5">
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <ShieldCheck className="h-5 w-5 text-violet-500" />
                Conversational guardrails
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-300">
                <li>• Emergency concerns → seek urgent care, not chat.</li>
                <li>• We summarize clinical insights, not replace your doctor.</li>
                <li>• Audio transcripts stay device-side unless you decide to save them.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <Lightbulb className="h-5 w-5 text-violet-500" />
                Quick prompts to try
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  “Translate my MRI impression into plain language.”
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  “Give me at-home care tips for a sprained ankle.”
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  “What questions should I ask my cardiologist tomorrow?”
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
