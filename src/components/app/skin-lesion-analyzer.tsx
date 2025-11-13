
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ImageIcon, Loader2, ScanSearch, Upload } from 'lucide-react';
import Image from 'next/image';

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
import { analyzeSkinLesionAction } from '@/app/actions';
import type { SkinLesionAnalyzerOutput } from '@/ai/flows/skin-lesion-analyzer';
import { FeatureHeader } from './feature-header';

const FormSchema = z.object({
  image: z.custom<File>((v) => v instanceof File, {
    message: 'Please upload an image file.',
  }),
});

export default function SkinLesionAnalyzer() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<SkinLesionAnalyzerOutput | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }


  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setResult(null);

    const imageDataUri = await fileToBase64(data.image);

    const { data: resultData, error } = await analyzeSkinLesionAction(imageDataUri);
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
        icon={ScanSearch}
        subtitle="Dermatology Preview"
        title="Upload a photo—AidFusion highlights patterns worth sharing with a dermatologist."
        description="Early awareness matters. Our skin model reviews lighting, symmetry, border sharpness, and color variance to flag potential concerns. Use it to prepare questions for your skin specialist."
        accent="violet"
        stats={[
          { label: 'Ideal photo', value: 'Natural light, 20cm distance' },
          { label: 'Review time', value: '< 5 seconds' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Analyze a skin lesion</CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
            Upload a clear, well-lit photo of a mole, rash, or mark. AidFusion suggests next steps—always consult a clinician for diagnosis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Upload lesion photo
                    </FormLabel>
                    <FormControl>
                      <div
                        className="relative flex h-72 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-violet-400/60 bg-white/80 text-center shadow-inner shadow-violet-100/40 transition hover:border-violet-500 hover:bg-violet-50/60 dark:border-violet-500/40 dark:bg-slate-900/70"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/png, image/jpeg, image/webp"
                        />
                        {preview ? (
                          <Image
                            src={preview}
                            alt="Image preview"
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-300">
                            <Upload className="h-12 w-12 text-violet-500" />
                            <div className="text-sm font-semibold">
                              Click to upload or drag and drop
                            </div>
                            <p className="text-xs text-slate-400">
                              JPEG, PNG, WEBP • Keep background matte for best results
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading || !preview}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-rose-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200/60 transition hover:shadow-violet-300/70 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Lesion
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScanSearch className="h-6 w-6 text-primary"/>
                    <span>Analysis Report</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted"></div>
                 <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted"></div>
            </CardContent>
         </Card>
      )}

      {result && (
        <Card className="animate-in fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <ScanSearch className="h-6 w-6 text-primary" />
              Analysis Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
                This analysis is generated by an AI and is for informational purposes only. It is not a medical diagnosis. Please consult a qualified healthcare professional for any health concerns.
            </p>
            <div className="space-y-4">
                 <div>
                    <h3 className="font-semibold mb-1">Potential Condition</h3>
                    <p className="prose prose-sm max-w-none text-foreground">{result.potentialCondition}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold mb-1">Description & Urgency</h3>
                    <p className="prose prose-sm max-w-none text-foreground">{result.description}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold mb-1">Recommended Next Steps</h3>
                    <p className="prose prose-sm max-w-none text-foreground">{result.nextSteps}</p>
                 </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
