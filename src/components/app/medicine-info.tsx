
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Pill, Loader2, FileText, AlertTriangle, FlaskConical, Sparkles, Stethoscope } from 'lucide-react';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getMedicineInfoAction } from '@/app/actions';
import type { MedicineInfoOutput } from '@/ai/flows/medicine-info';
import { Separator } from '../ui/separator';
import { FeatureHeader } from './feature-header';

const FormSchema = z.object({
  medicineName: z.string().min(2, {
    message: 'Medicine name must be at least 2 characters.',
  }),
});

export default function MedicineInfo() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<MedicineInfoOutput | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      medicineName: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    const { data: resultData, error } = await getMedicineInfoAction(data.medicineName);
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
        icon={FlaskConical}
        subtitle="Medication Insights"
        title="Understand prescriptions, from daily tablets to acute care therapies."
        description="Search any medicine to view indications, recommended dosing, common reactions, and safety considerations. Perfect for preparing doctor questions or double-checking instructions."
        accent="emerald"
        stats={[
          { label: 'Medication library', value: '10k+ entries' },
          { label: 'Safety watchlist', value: 'Auto highlights' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Get medicine information</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
              Enter a brand or generic name to surface usage guidance, dosage ranges, and contraindications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="medicineName"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Medicine name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Paracetamol, Metformin XR, Amoxicillin"
                          className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-emerald-100/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900/70"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:shadow-emerald-300/70 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Info
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="space-y-6">
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-emerald-100/40 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                Tips for accurate searches
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Add formulation: “Metformin ER 500mg” yields more precise dosing details.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Mention the condition you’re treating to surface relevant precautions.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Cross-check with your pharmacist before adjusting medication routines.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 text-sm text-slate-500 shadow-inner shadow-emerald-100/40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-100">
                <Stethoscope className="h-5 w-5 text-emerald-500" />
                Talk to your clinician
              </div>
              <p className="mt-2 leading-relaxed">
                AidFusion helps you prepare questions. Before changing dosages, combining medicines, or stopping a therapy, confirm with a licensed healthcare professional.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pill className="h-6 w-6 text-primary"/>
                    <span>Fetching Information...</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-24 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-24 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-24 w-full animate-pulse rounded-md bg-muted"></div>
            </CardContent>
         </Card>
      )}

      {result && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileText className="h-6 w-6 text-primary" />
              Information for "{form.getValues('medicineName')}"
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Usage</h3>
              <p className="prose prose-sm max-w-none text-muted-foreground">{result.usage}</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2 text-lg">Dosage</h3>
              <p className="prose prose-sm max-w-none text-muted-foreground">{result.dosage}</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2 text-lg">Side Effects</h3>
              <p className="prose prose-sm max-w-none text-muted-foreground">{result.sideEffects}</p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2 text-lg">Precautions</h3>
              <p className="prose prose-sm max-w-none text-muted-foreground">{result.precautions}</p>
            </div>
            <Separator />
             <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <h4 className="font-bold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5"/>
                    Disclaimer
                </h4>
                <p className="text-sm mt-2">{result.disclaimer}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
