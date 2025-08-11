
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Languages, Loader2, FileText, ArrowRight } from 'lucide-react';

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Health Report Translator</CardTitle>
          <CardDescription>
            Paste a health report or any medical text below and select a language to translate it into.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the report text here..."
                        className="min-h-[150px] resize-none"
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
                  <FormItem>
                    <FormLabel>Translate To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SupportedLanguages.options.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Translate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
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
