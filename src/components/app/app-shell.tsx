
'use client';

import * as React from 'react';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  Stethoscope,
  FileText,
  BookOpen,
  MessageCircle,
  ScanSearch,
  ClipboardType,
  Pill,
  ShoppingCart,
  BrainCircuit,
  Languages,
  LogOut,
  Shield,
  Settings2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import SymptomAnalyzer from '@/components/app/symptom-analyzer';
import MedicalSummarizer from '@/components/app/medical-summarizer';
import HealthResources from '@/components/app/health-resources';
import AiDoctor from '@/components/app/ai-doctor';
import SkinLesionAnalyzer from './skin-lesion-analyzer';
import PrescriptionGenerator from './prescription-generator';
import MedicineInfo from './medicine-info';
import Pharmacy from './pharmacy';
import MentalHealthCompanion from './mental-health-companion';
import HealthReportTranslator from './health-report-translator';
import AdminControls from './admin-controls';
import ProfileManagement from './profile-management';
import TwoFactorSetup from './two-factor-setup';
import MedicalRecords from './medical-records';
import TelemedicineConsultations from './telemedicine';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type Role = 'user' | 'admin';

type View =
  | 'symptoms'
  | 'summarizer'
  | 'resources'
  | 'ai-doctor'
  | 'skin-lesion'
  | 'prescription'
  | 'medicine-info'
  | 'pharmacy'
  | 'mental-health'
  | 'translator'
  | 'admin-controls'
  | 'profile'
  | '2fa'
  | 'medical-records'
  | 'telemedicine';

type AppShellUser = {
  id: string;
  email: string;
  role: string;
};

type ViewDefinition = {
  id: View;
  label: string;
  tooltip: string;
  icon: LucideIcon;
  roles: Role[];
  heading: string;
  subheading?: string;
};

const VIEW_DEFINITIONS: ViewDefinition[] = [
  {
    id: 'ai-doctor',
    label: 'AI Doctor',
    tooltip: 'AI Doctor',
    icon: MessageCircle,
    roles: ['user', 'admin'],
    heading: 'Chat with our always-on AI doctor.',
    subheading: 'Evidence-guided conversation at your pace.',
  },
  {
    id: 'mental-health',
    label: 'Mental Health Companion',
    tooltip: 'Mental Health Companion',
    icon: BrainCircuit,
    roles: ['user', 'admin'],
    heading: 'Share, reflect, and reframe your thoughts safely.',
    subheading: 'Guided coping prompts and mood-aware support.',
  },
  {
    id: 'symptoms',
    label: 'Symptom Analyzer',
    tooltip: 'Symptom Analyzer',
    icon: Stethoscope,
    roles: ['user', 'admin'],
    heading: 'Describe how you feel to surface likely causes.',
    subheading: 'Smart triage checks and urgency indicators.',
  },
  {
    id: 'translator',
    label: 'Health Report Translator',
    tooltip: 'Report Translator',
    icon: Languages,
    roles: ['user', 'admin'],
    heading: 'Convert dense clinical notes into plain language.',
    subheading: 'Break language barriers for global families.',
  },
  {
    id: 'summarizer',
    label: 'Medical Summarizer',
    tooltip: 'Medical Summarizer',
    icon: FileText,
    roles: ['user', 'admin'],
    heading: 'Decode treatments, conditions, and journal papers.',
    subheading: 'Concise insights linked to trusted sources.',
  },
  {
    id: 'medicine-info',
    label: 'Medicine Information',
    tooltip: 'Medicine Info',
    icon: Pill,
    roles: ['user', 'admin'],
    heading: 'Understand prescriptions before the next dose.',
    subheading: 'Usage, dosing, interactions, and safety cues.',
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    tooltip: 'Pharmacy',
    icon: ShoppingCart,
    roles: ['user', 'admin'],
    heading: 'Build a personalized wellness kit.',
    subheading: 'Clinically vetted over-the-counter essentials.',
  },
  {
    id: 'resources',
    label: 'Health Resources',
    tooltip: 'Health Resources',
    icon: BookOpen,
    roles: ['user', 'admin'],
    heading: 'Explore hand-picked global health libraries.',
    subheading: 'Reliable updates from WHO, CDC, NHS, and more.',
  },
  {
    id: 'prescription',
    label: 'Prescription Generator',
    tooltip: 'Prescription Generator',
    icon: ClipboardType,
    roles: ['admin'],
    heading: 'Draft professional prescriptions to review later.',
    subheading: 'Export-ready PDFs for supervised clinical use.',
  },
  {
    id: 'skin-lesion',
    label: 'Skin Lesion Analyzer',
    tooltip: 'Skin Lesion Analyzer',
    icon: ScanSearch,
    roles: ['admin'],
    heading: 'Pre-screen lesions before dermatology appointments.',
    subheading: 'Highlight asymmetries and color changes to monitor.',
  },
  {
    id: 'profile',
    label: 'My Profile',
    tooltip: 'Extended user profile',
    icon: Shield,
    roles: ['user', 'admin'],
    heading: 'Manage your health profile.',
    subheading: 'Update personal info, health metrics, and preferences.',
  },
  {
    id: '2fa',
    label: 'Two-Factor Auth',
    tooltip: 'Enable 2FA security',
    icon: Shield,
    roles: ['user', 'admin'],
    heading: 'Secure your account with 2FA.',
    subheading: 'Set up authenticator app or backup codes.',
  },
  {
    id: 'medical-records',
    label: 'Medical Records',
    tooltip: 'Upload & manage documents',
    icon: FileText,
    roles: ['user', 'admin'],
    heading: 'Organize your medical documents.',
    subheading: 'Upload, store, and categorize your health records.',
  },
  {
    id: 'telemedicine',
    label: 'Telemedicine',
    tooltip: 'Video consultations',
    icon: MessageCircle,
    roles: ['user', 'admin'],
    heading: 'Connect with healthcare providers.',
    subheading: 'Schedule and join secure video consultations.',
  },
  {
    id: 'admin-controls',
    label: 'Admin Controls',
    tooltip: 'Manage users & roles',
    icon: Settings2,
    roles: ['admin'],
    heading: 'Govern the AidFusion workspace.',
    subheading: 'Adjust user roles and review onboarding health.',
  },
];

export function AppShell({ user }: { user: AppShellUser }) {
  const [activeView, setActiveView] = React.useState<View>('symptoms');
  const router = useRouter();

  const role: Role = user.role === 'admin' ? 'admin' : 'user';

  const accessibleViews = React.useMemo(
    () => VIEW_DEFINITIONS.filter((definition) => definition.roles.includes(role)),
    [role]
  );

  React.useEffect(() => {
    if (!accessibleViews.some((definition) => definition.id === activeView)) {
      setActiveView(accessibleViews[0]?.id ?? 'symptoms');
    }
  }, [accessibleViews, activeView]);

  const activeDefinition =
    accessibleViews.find((definition) => definition.id === activeView) ?? accessibleViews[0];

  const displayName = useMemo(() => {
    if (!user?.email) return 'Guest';
    const name = user.email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      router.replace('/login');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'symptoms':
        return <SymptomAnalyzer />;
      case 'summarizer':
        return <MedicalSummarizer />;
      case 'resources':
        return <HealthResources />;
      case 'ai-doctor':
        return <AiDoctor />;
      case 'skin-lesion':
        return <SkinLesionAnalyzer />;
      case 'prescription':
        return <PrescriptionGenerator />;
      case 'medicine-info':
        return <MedicineInfo />;
      case 'pharmacy':
        return <Pharmacy />;
      case 'mental-health':
        return <MentalHealthCompanion />;
      case 'translator':
        return <HealthReportTranslator />;
      case 'admin-controls':
        return <AdminControls />;
      case 'profile':
        return <ProfileManagement />;
      case '2fa':
        return <TwoFactorSetup />;
      case 'medical-records':
        return <MedicalRecords />;
      case 'telemedicine':
        return <TelemedicineConsultations />;
      default:
        return <SymptomAnalyzer />;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-headline font-semibold">AidFusion</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {accessibleViews.map(({ id, label, tooltip, icon: Icon }) => (
              <SidebarMenuItem key={id}>
                <SidebarMenuButton
                  onClick={() => setActiveView(id)}
                  isActive={activeView === id}
                  tooltip={tooltip}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex h-20 flex-col justify-center gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur-sm sm:px-6 md:h-24 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="md:hidden" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {activeDefinition?.label}
              </span>
              <h1 className="text-2xl font-semibold font-headline text-foreground">
                {activeDefinition?.heading}
              </h1>
              {activeDefinition?.subheading && (
                <p className="text-sm text-muted-foreground">{activeDefinition.subheading}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 md:flex">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Hi, {displayName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{user.email}</span>
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600">
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="hidden md:flex">
                <AvatarFallback className="bg-emerald-500/20 text-emerald-600">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-emerald-500 hover:text-emerald-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 sm:p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
