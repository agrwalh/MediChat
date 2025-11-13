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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Video,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const consultationFormSchema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required'),
  doctorEmail: z.string().email('Invalid email address'),
  consultationDate: z.string(),
  consultationTime: z.string(),
  duration: z.coerce.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().optional(),
});

type ConsultationFormValues = z.infer<typeof consultationFormSchema>;

interface Consultation {
  _id: string;
  doctorName: string;
  patientName: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  roomId: string;
}

export default function TelemedicineConsultations() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [consultations, setConsultations] = React.useState<Consultation[]>([]);
  const [showBooking, setShowBooking] = React.useState(false);

  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      doctorName: '',
      doctorEmail: '',
      consultationDate: '',
      consultationTime: '',
      duration: 30,
      notes: '',
    },
  });

  React.useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await fetch('/api/consultations?upcoming=true');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations || []);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const onSubmit = async (data: ConsultationFormValues) => {
    setIsLoading(true);
    try {
      const scheduledAt = new Date(`${data.consultationDate}T${data.consultationTime}`);

      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: `doc-${Math.random().toString(36).substr(2, 9)}`,
          doctorName: data.doctorName,
          doctorEmail: data.doctorEmail,
          scheduledAt: scheduledAt.toISOString(),
          duration: data.duration,
          notes: data.notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to schedule consultation');

      toast({
        title: 'Success',
        description: 'Consultation scheduled successfully!',
      });

      form.reset();
      setShowBooking(false);
      await fetchConsultations();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to schedule consultation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Video className="h-4 w-4 animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Telemedicine</h1>
        <p className="text-muted-foreground mt-2">
          Schedule and manage video consultations with healthcare providers
        </p>
      </div>

      {/* Book New Consultation */}
      {showBooking ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                <div>
                  <CardTitle>Schedule a Consultation</CardTitle>
                  <CardDescription>Book a video call with a healthcare provider</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowBooking(false)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="doctorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. Jane Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="doctor@clinic.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="consultationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consultationTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min="15" step="15" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any consultation notes or chief complaints..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your symptoms, concerns, or reason for consultation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Scheduling...' : 'Schedule Consultation'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBooking(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setShowBooking(true)} className="w-full md:w-auto">
          <Video className="mr-2 h-4 w-4" />
          Schedule Consultation
        </Button>
      )}

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Consultations</CardTitle>
          <CardDescription>
            {consultations.length} upcoming consultation{consultations.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No scheduled consultations. Book one now to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => {
                const scheduledDate = new Date(consultation.scheduledAt);
                const isUpcoming = scheduledDate > new Date();

                return (
                  <div
                    key={consultation._id}
                    className="p-4 border rounded-lg hover:bg-slate-50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{consultation.doctorName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Consultation with Healthcare Provider
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(consultation.status)}>
                        <span className="mr-1">{getStatusIcon(consultation.status)}</span>
                        {consultation.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{scheduledDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {scheduledDate.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' '}
                          ({consultation.duration} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <span>Room: {consultation.roomId}</span>
                      </div>
                    </div>

                    {isUpcoming && consultation.status === 'scheduled' && (
                      <Button className="w-full" variant="default">
                        <Video className="mr-2 h-4 w-4" />
                        Join Consultation
                      </Button>
                    )}

                    {consultation.status === 'completed' && (
                      <Button className="w-full" variant="outline">
                        View Recording
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            AidFusion uses Jitsi Meet for secure, end-to-end encrypted video consultations. No downloads required.
          </p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Schedule a consultation with a healthcare provider</li>
            <li>Receive a confirmation email with meeting details</li>
            <li>Join the video call at the scheduled time</li>
            <li>Consultations are recorded for your records (with permission)</li>
            <li>Access medical records and notes from the consultation</li>
          </ul>
          <p className="text-xs text-slate-600">
            All consultations are encrypted and HIPAA-compliant. Your privacy is our priority.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
