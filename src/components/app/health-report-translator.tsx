
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Languages, Loader2, FileText, ArrowRight, Globe2, Sparkles, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { translateHealthReportAction } from '@/app/actions';
import { SupportedLanguages } from '@/ai/schemas';
import type { HealthReportTranslatorOutput } from '@/ai/flows/health-report-translator';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { FeatureHeader } from './feature-header';

const FormSchema = z.object({
  text: z.string().min(10, {
    message: 'Report text must be at least 10 characters.',
  }),
  targetLanguage: SupportedLanguages,
});

export default function HealthReportTranslator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<HealthReportTranslatorOutput | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    const { data: resultData, error } = await translateHealthReportAction(data);
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

  return (
    <div className="space-y-8">
      <FeatureHeader
        icon={Globe2}
        subtitle="Report Translator"
        title="Break language barriers—understand every medical report with confidence."
        description="From discharge summaries to lab notes, convert dense clinical language into your preferred language while maintaining accuracy. Designed for global families and caregivers."
        accent="amber"
        stats={[
          { label: 'Languages supported', value: `${SupportedLanguages.options.length}+` },
          { label: 'Avg. translation time', value: '< 6 seconds' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Translate a medical report</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
              Paste any extract—lab report, specialist note, insurance summary—and receive a reader-friendly translation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Original text
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the report text here..."
                          className="min-h-[180px] resize-none rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-inner shadow-amber-100/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-900/70"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetLanguage"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Translate to
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm shadow-inner shadow-amber-100/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-900/70">
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border border-slate-200 bg-white/95 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                          {SupportedLanguages.options.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200/60 transition hover:shadow-amber-300/70 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Translate
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="space-y-6">
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-amber-100/40 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Translation tips
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Highlight tricky abbreviations like “PRN” or “bid”—we’ll expand them for clarity.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Add context: “post-surgery discharge summary” improves the tone of the translation.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Use the translated keywords to ask follow-up questions in other AidFusion tools.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 text-xs text-slate-500 shadow-inner shadow-amber-100/40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-100">
                <Shield className="h-5 w-5 text-amber-500" />
                Confidential by design
              </div>
              <p className="mt-2 leading-relaxed">
                Translations happen securely. We never store your reports, and you can clear results anytime to ensure privacy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Languages className="h-6 w-6 text-primary"/>
                    <span>Translating...</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-20 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted"></div>
            </CardContent>
         </Card>
      )}

      {result && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileText className="h-6 w-6 text-primary" />
              Translated Report
            </CardTitle>
             <CardDescription>
                Translated to {form.getValues('targetLanguage')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-4 text-foreground">
                <p>{result.translatedText}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
