
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FileText, Link as LinkIcon, Loader2, BookOpenCheck, BookmarkPlus } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { summarizeTopicAction } from '@/app/actions';
import type { MedicalSummarizerOutput } from '@/ai/flows/medical-summarizer';
import { Separator } from '../ui/separator';
import { FeatureHeader } from './feature-header';

const FormSchema = z.object({
  topic: z.string().min(3, {
    message: 'Topic must be at least 3 characters.',
  }),
});

export default function MedicalSummarizer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<MedicalSummarizerOutput | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      topic: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    const { data: resultData, error } = await summarizeTopicAction(data.topic);
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
        icon={BookOpenCheck}
        subtitle="Medical Knowledge Digest"
        title="Turn complex medical language into clear, actionable insights."
        description="Whether you're reviewing a new diagnosis or researching a treatment option, AidFusion translates clinical jargon into plain language summaries backed by reputable sources."
        accent="sky"
        stats={[
          { label: 'Sources per summary', value: '5+ vetted links' },
          { label: 'Reading time saved', value: '~12 minutes' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Summarize a Medical Topic</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Ideal for discharge notes, research articles, or complex medical terminology.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        What should we decode?
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 'Type 2 Diabetes management guidelines'"
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-sky-100/40 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Enter a specific condition, therapy, lab test, or even paste a complex sentence to simplify.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-sky-200/50 transition hover:shadow-sky-300/70 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Summarize Topic
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="space-y-5">
          <CardHeader className="space-y-3">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <BookmarkPlus className="h-5 w-5 text-sky-500" />
              Try exploring…
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Popular topics other AidFusion members decode often.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 text-sm shadow-inner shadow-sky-100/50 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-700 dark:text-slate-100">Autoimmune conditions</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">e.g., systemic lupus, rheumatoid arthritis flare management.</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 text-sm shadow-inner shadow-sky-100/50 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-700 dark:text-slate-100">Cancer therapies</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Break down combinations like chemo-immunotherapy or targeted agents.</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 text-sm shadow-inner shadow-sky-100/50 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-700 dark:text-slate-100">Diagnostics & labs</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">Clarify MRI findings, pathology reports, or genetic screening results.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary"/>
                    <span>Summary</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted"></div>
            </CardContent>
         </Card>
      )}

      {result && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileText className="h-6 w-6 text-primary" />
              Summary for "{form.getValues('topic')}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="prose prose-sm max-w-none text-foreground">{result.summary}</p>

            <Separator className="my-6" />

            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold font-headline">
              <LinkIcon className="h-5 w-5 text-primary" />
              Sources
            </h3>
            <ul className="space-y-2">
                {result.sourceLinks.map((link, index) => (
                    <li key={index}>
                        <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                            {link}
                        </a>
                    </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
