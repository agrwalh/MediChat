
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Lightbulb, Loader2, ShieldAlert, Stethoscope, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeSymptomsAction } from '@/app/actions';
import type { SymptomAnalyzerOutput } from '@/ai/flows/symptom-analyzer';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FeatureHeader } from './feature-header';

const FormSchema = z.object({
  symptoms: z.string().min(10, {
    message: 'Please describe your symptoms in at least 10 characters.',
  }),
});

export default function SymptomAnalyzer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<SymptomAnalyzerOutput | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      symptoms: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    const { data: resultData, error } = await analyzeSymptomsAction(data.symptoms);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error,
      });
      return;
    }
    setResult(resultData || null);
  }

  const getUrgencyBadgeVariant = (urgency: SymptomAnalyzerOutput['urgency']) => {
    switch (urgency) {
      case 'Low':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'High':
        return 'destructive';
      case 'Immediate':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <FeatureHeader
        icon={Stethoscope}
        subtitle="Symptom Intelligence"
        title="Explain how you're feeling, and AidFusion guides the next steps."
        description="Our AI cross-references millions of medical data points to surface likely causes, red flags, and practical actions. The more context you share, the smarter the insights."
        accent="emerald"
        stats={[
          { label: 'Avg. response time', value: '< 8s' },
          { label: 'Typical follow-ups', value: '3 personalised tips' },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card className="order-1 lg:order-none">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Describe Your Symptoms</CardTitle>
            <CardDescription className="text-sm">
              We respect your privacy. Nothing is stored unless you explicitly save it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        What’s happening today?
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., “I’ve had a mild fever for two days, dry cough, and slight chest tightness when I breathe deeply.”"
                          className="min-h-[140px] resize-none rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-inner shadow-emerald-100/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Include when it started, pain intensity, recent travel, allergies, or medication changes for a sharper interpretation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-emerald-200/50 transition hover:shadow-emerald-300/70 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analyze Symptoms
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              Pro tips for accuracy
            </CardTitle>
            <CardDescription className="text-sm">
              These lightning tips help the AI narrow down possible causes faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-inner shadow-emerald-100/40 dark:bg-slate-900/60 dark:border-slate-800">
              <p className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-200">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                  1
                </span>
                Mention when symptoms started, how they’ve changed, and anything that triggers or eases them.
              </p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-inner shadow-emerald-100/40 dark:bg-slate-900/60 dark:border-slate-800">
              <p className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-200">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                  2
                </span>
                Add relevant background (recent travel, chronic conditions, new medication, stress, or allergies).
              </p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-inner shadow-emerald-100/40 dark:bg-slate-900/60 dark:border-slate-800">
              <p className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-200">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                  3
                </span>
                If you’re feeling severe pain, difficulty breathing, or confusion—seek emergency care immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary"/>
                    <span>Analyzing Potential Causes...</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-20 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-20 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-20 w-full animate-pulse rounded-md bg-muted"></div>
            </CardContent>
         </Card>
      )}

      {result && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 font-headline">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                <span>Analysis Report</span>
              </div>
              <Badge variant={getUrgencyBadgeVariant(result.urgency)}>Urgency: {result.urgency}</Badge>
            </CardTitle>
            <CardDescription className="flex items-start gap-2 pt-2 text-sm">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{result.disclaimer}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.analysis.map((item, index) => (
                <Card key={index} className="bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex justify-between items-start font-headline">
                            {item.condition}
                            <Badge variant={item.severity === 'Critical' || item.severity === 'Severe' ? 'destructive' : 'secondary'} className="capitalize">{item.severity}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-1">Description</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-1">Next Steps</h3>
                            <p className="text-sm text-muted-foreground">{item.nextSteps}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
