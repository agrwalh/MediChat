
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ClipboardType, Loader2, User, HeartPulse, ShieldAlert, Download, ShoppingCart, FileSignature, PenTool } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


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
import { generatePrescriptionAction } from '@/app/actions';
import type { PrescriptionGeneratorOutput } from '@/ai/flows/prescription-generator';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FeatureHeader } from './feature-header';

const FormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(0, { message: 'Age must be a positive number.' }),
  gender: z.enum(['Male', 'Female', 'Other']),
  symptoms: z.string().min(10, {
    message: 'Symptoms must be at least 10 characters.',
  }),
});

export default function PrescriptionGenerator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<PrescriptionGeneratorOutput | null>(null);
  const prescriptionRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        name: '',
        age: '' as any,
        gender: undefined,
        symptoms: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);
    const { data: resultData, error } = await generatePrescriptionAction(data);
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

  const handleDownloadPdf = () => {
    const input = prescriptionRef.current;
    if (input) {
        // Temporarily remove download button from capture
        const downloadButton = input.querySelector('#download-button');
        const originalDisplay = downloadButton?.parentElement?.style.display;
        if(downloadButton?.parentElement) {
            downloadButton.parentElement.style.display = 'none';
        }
        
        html2canvas(input, { scale: 2, backgroundColor: null }).then((canvas) => {
            // Restore download button
            if(downloadButton?.parentElement && originalDisplay) {
                downloadButton.parentElement.style.display = originalDisplay;
            }

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
            const imgWidth = (canvasWidth * ratio) * 0.95; // add some padding
            const imgHeight = (canvasHeight * ratio) * 0.95;
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save(`prescription-${result?.patientName?.replace(/\s/g, '_') || 'sample'}.pdf`);
        });
    }
  };

  return (
    <div className="space-y-8">
      <FeatureHeader
        icon={FileSignature}
        subtitle="Prescription Studio"
        title="Produce polished, clinic-style prescriptions in seconds."
        description="Collect patient details, generate suggested medications, and export beautiful PDFs ready for a clinician’s review. Designed for training, documentation, and patient education use cases."
        accent="violet"
        stats={[
          { label: 'PDF export', value: '1-click download' },
          { label: 'Edit-ready format', value: 'Structured tables' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Generate a sample prescription</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
              Provide baseline demographics and presenting symptoms. AidFusion drafts a patient-friendly prescription you can tailor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                          Patient name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., John Doe"
                            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-violet-100/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                          Age
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 35"
                            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-inner shadow-violet-100/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900/70"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                          Gender
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm shadow-inner shadow-violet-100/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900/70">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border border-slate-200 bg-white/95 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Presenting symptoms
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., “Persistent cough for one week, mild fever, fatigue, no known allergies.”"
                          className="min-h-[140px] resize-none rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-inner shadow-violet-100/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900/70"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-slate-500">
                        Include vitals, relevant history, or lab highlights to tailor medication guidance.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-sky-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/60 transition hover:shadow-violet-300/70 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Prescription
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="space-y-6">
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <PenTool className="h-5 w-5 text-violet-500" />
                Tips for realistic drafts
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Add vitals and lab results to influence dosage recommendations.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Mention allergies or chronic conditions for personalized precautions.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Use the PDF export to brief your provider or include in patient instructions.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 text-sm text-slate-500 shadow-inner shadow-violet-100/40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-100">
                <ShieldAlert className="h-5 w-5 text-violet-500" />
                Not a substitute for medical judgment
              </div>
              <p className="mt-2 leading-relaxed">
                Generated prescriptions are educational drafts. A licensed clinician must validate medications,
                dosages, and instructions before sharing with patients.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isLoading && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardType className="h-6 w-6 text-primary"/>
                    <span>Generating Prescription...</span>
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
          <div ref={prescriptionRef}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 font-headline">
                <div className="flex items-center gap-3">
                  <ClipboardType className="h-7 w-7 text-primary" />
                  <span>Sample Prescription</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                  <div className="flex justify-between rounded-lg border p-4">
                      <div>
                          <h3 className="font-bold">{result.patientName}</h3>
                          <p className="text-sm text-muted-foreground">Age: {result.age}</p>
                          <p className="text-sm text-muted-foreground">Gender: {result.gender}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-sm font-medium">Dr. AI Assistant</p>
                          <p className="text-sm text-muted-foreground">AidFusion Digital Clinic</p>
                          <p className="text-sm text-muted-foreground">Date: {result.date}</p>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                          <HeartPulse className="h-5 w-5 text-primary" />
                          Diagnosis
                      </h3>
                      <p className="text-sm text-foreground">{result.diagnosis}</p>
                  </div>

                  <Separator />
                  
                  <div className="space-y-2">
                      <h3 className="font-semibold">Rx (Medication)</h3>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Medicine</TableHead>
                                  <TableHead>Dosage</TableHead>
                                  <TableHead>Frequency</TableHead>
                                  <TableHead>Duration</TableHead>
                                  <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {result.medicines.map((med, index) => (
                                  <TableRow key={index}>
                                      <TableCell className="font-medium">{med.name}</TableCell>
                                      <TableCell>{med.dosage}</TableCell>
                                      <TableCell>{med.frequency}</TableCell>
                                      <TableCell>{med.duration}</TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(`https://www.google.com/search?tbm=shop&q=${encodeURIComponent(med.name)}`, '_blank')}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Buy Now
                                        </Button>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                      <h3 className="font-semibold">Precautions & Advice</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                         {result.precautions.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                  </div>

                  <Separator />

                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                      <h4 className="font-bold flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5"/>
                          Important Disclaimer
                      </h4>
                      <p className="text-sm mt-2">{result.disclaimer}</p>
                  </div>
              </div>
            </CardContent>
          </div>
          <CardContent className="pt-6">
            <Button id="download-button" onClick={handleDownloadPdf} className="w-full bg-accent hover:bg-accent/90">
                <Download className="mr-2 h-4 w-4" />
                Download as PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
