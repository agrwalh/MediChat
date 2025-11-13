
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Compass, BookmarkPlus, Search } from "lucide-react";
import { FeatureHeader } from "./feature-header";

const resources = [
  {
    title: "World Health Organization (WHO)",
    description: "Global public health information, research, and data from the United Nations' specialized agency.",
    link: "https://www.who.int",
    dataAiHint: "medical research",
  },
  {
    title: "Mayo Clinic",
    description: "Comprehensive guides on diseases, conditions, symptoms, tests, and procedures.",
    link: "https://www.mayoclinic.org",
    dataAiHint: "hospital building",
  },
  {
    title: "MedlinePlus",
    description: "Health information from the U.S. National Library of Medicine, the world's largest medical library.",
    link: "https://medlineplus.gov",
    dataAiHint: "library books",
  },
  {
    title: "Centers for Disease Control and Prevention (CDC)",
    description: "U.S. public health information on diseases, conditions, and wellness.",
    link: "https://www.cdc.gov",
    dataAiHint: "science laboratory",
  },
  {
    title: "NHS (National Health Service)",
    description: "The UK's largest health website, providing comprehensive information on conditions and treatments.",
    link: "https://www.nhs.uk",
    dataAiHint: "uk flag",
  },
  {
    title: "WebMD",
    description: "A popular source for medical news, information, and wellness support.",
    link: "https://www.webmd.com",
    dataAiHint: "health wellness",
  },
];

export default function HealthResources() {
  return (
    <div className="space-y-8">
      <FeatureHeader
        icon={Compass}
        subtitle="Trusted Knowledge"
        title="Bookmark reliable medical resources curated by clinicians and librarians."
        description="The AidFusion library routes you to global, evidence-based health organizations. Explore guidance, compare care pathways, and stay informed with trustworthy updates."
        accent="sky"
        stats={[
          { label: "Global sources", value: "6 verified orgs" },
          { label: "Update cadence", value: "Weekly curation" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <div className="grid gap-6 sm:grid-cols-2">
          {resources.map((resource) => (
            <Card key={resource.title} className="group flex h-full flex-col justify-between border-white/50 bg-white/75 shadow-lg shadow-sky-100/50 transition hover:-translate-y-1 hover:shadow-sky-200/80 dark:border-slate-800 dark:bg-slate-900/70">
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 flex-col"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg font-headline text-slate-900 dark:text-white">
                      {resource.title}
                    </CardTitle>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 dark:text-slate-500" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {resource.description}
                  </CardDescription>
                  <div className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-sky-500 dark:text-sky-300">
                    <span className="h-2 w-2 rounded-full bg-sky-400/80" />
                    Verified
                  </div>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>

        <Card className="space-y-6">
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-inner shadow-sky-100/40 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                <Search className="h-5 w-5 text-sky-500" />
                Resource discovery tips
              </div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Save links to your browser or password manager for quick access during appointments.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Compare the WHO dashboard with CDC updates to track global vs. local trends.
                </li>
                <li className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  Use the NHS symptom checker alongside AidFusion's Symptom Analyzer for a second opinion.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 p-5 text-sm text-slate-500 shadow-inner shadow-sky-100/40 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-100">
                <BookmarkPlus className="h-5 w-5 text-sky-500" />
                Coming soon
              </div>
              <p className="mt-3 leading-relaxed">
                We’re building saved collections so you can curate your own resource hub, share it with family, and surface updates tailored to your health goals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
