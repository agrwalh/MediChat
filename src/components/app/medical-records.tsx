'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileUp, Calendar, Download, Trash2, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const uploadFormSchema = z.object({
  file: z.any(),
  recordType: z.enum(['prescription', 'lab-report', 'discharge-summary', 'imaging', 'other']),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface MedicalRecord {
  _id: string;
  fileName: string;
  fileSize: number;
  recordType: string;
  uploadedAt: string;
  description?: string;
  tags?: string[];
}

export default function MedicalRecordsManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [records, setRecords] = React.useState<MedicalRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      recordType: 'lab-report',
      description: '',
      tags: '',
    },
  });

  React.useEffect(() => {
    fetchRecords();
  }, [selectedFilter]);

  const fetchRecords = async () => {
    try {
      const url = new URL('/api/user/medical-records', window.location.origin);
      if (selectedFilter) {
        url.searchParams.set('recordType', selectedFilter);
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!data.file || data.file.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file to upload.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', data.file[0]);
      formData.append('recordType', data.recordType);
      if (data.description) formData.append('description', data.description);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags.split(',').map((t) => t.trim())));

      const res = await fetch('/api/user/medical-records', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      toast({
        title: 'Success',
        description: 'Medical record uploaded successfully.',
      });

      form.reset();
      await fetchRecords();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload record. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRecordTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      prescription: 'Prescription',
      'lab-report': 'Lab Report',
      'discharge-summary': 'Discharge Summary',
      imaging: 'Imaging',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      prescription: 'bg-blue-100 text-blue-800',
      'lab-report': 'bg-green-100 text-green-800',
      'discharge-summary': 'bg-purple-100 text-purple-800',
      imaging: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Medical Records</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage your medical documents securely
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Medical Record</CardTitle>
          <CardDescription>Add your medical documents to your secure vault</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="recordType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="lab-report">Lab Report</SelectItem>
                          <SelectItem value="discharge-summary">Discharge Summary</SelectItem>
                          <SelectItem value="imaging">Imaging</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => field.onChange(e.target.files)}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about this document..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., cardiology, 2024, important (separate with commas)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Optional tags to help organize your records</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Record
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Records</CardTitle>
          <CardDescription>
            {records.length} document{records.length !== 1 ? 's' : ''} uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No medical records yet. Upload your first document to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{record.fileName}</span>
                      <Badge className={getRecordTypeColor(record.recordType)}>
                        {getRecordTypeLabel(record.recordType)}
                      </Badge>
                    </div>
                    {record.description && (
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{(record.fileSize / 1024).toFixed(2)} KB</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
