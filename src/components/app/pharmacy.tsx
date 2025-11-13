
'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Store, Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FeatureHeader } from './feature-header';

const products = [
  {
    name: 'Pain Reliever (Ibuprofen)',
    price: '$8.99',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'medicine pills',
    category: 'Pain Relief',
  },
  {
    name: 'Allergy Relief (Loratadine)',
    price: '$12.50',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'allergy medicine',
    category: 'Allergy',
  },
  {
    name: 'Cold & Flu Syrup',
    price: '$10.25',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'cough syrup',
    category: 'Cold & Flu',
  },
  {
    name: 'Digital Thermometer',
    price: '$15.00',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'digital thermometer',
    category: 'Medical Devices',
  },
  {
    name: 'Adhesive Bandages (Assorted)',
    price: '$5.49',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'adhesive bandages',
    category: 'First Aid',
  },
  {
    name: 'Vitamin C Gummies',
    price: '$9.99',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'vitamin gummies',
    category: 'Vitamins',
  },
    {
    name: 'Antiseptic Wipes',
    price: '$4.75',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'antiseptic wipes',
    category: 'First Aid',
  },
  {
    name: 'Hand Sanitizer',
    price: '$3.99',
    image: 'https://placehold.co/400x400.png',
    dataAiHint: 'hand sanitizer',
    category: 'Personal Care',
  },
];

export default function Pharmacy() {
  return (
    <div className="space-y-8">
      <FeatureHeader
        icon={Store}
        subtitle="Wellness Marketplace"
        title="Stock your home kit with AidFusion's curated pharmacy favorites."
        description="From first-aid essentials to everyday vitamins, every product is vetted for quality. Tap an item to learn how it complements your care plan."
        accent="emerald"
        stats={[
          { label: "Curated items", value: `${products.length} essentials` },
          { label: "Ships from", value: "Verified partners" },
        ]}
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card
            key={product.name}
            className="group flex h-full flex-col overflow-hidden border-white/50 bg-white/80 shadow-lg shadow-emerald-100/50 transition hover:-translate-y-1 hover:shadow-emerald-200/80 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                data-ai-hint={product.dataAiHint}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-emerald-600 shadow dark:bg-slate-900/80">
                {product.category}
              </Badge>
            </div>
            <CardContent className="flex flex-1 flex-col gap-4 p-5">
              <CardTitle className="text-lg font-headline text-slate-900 dark:text-white">
                {product.name}
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                In stock • Ships within 24h
              </CardDescription>
              <div className="mt-auto flex items-center justify-between">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{product.price}</p>
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 px-4 py-2 text-xs font-semibold shadow hover:shadow-emerald-300/70"
                  onClick={() => alert('This is a demo. No actual purchase will be made.')}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-dashed border-emerald-300/60 bg-emerald-50/60 text-emerald-700 shadow-inner shadow-emerald-100/50 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <ShieldCheck className="h-5 w-5" />
            Safety notice
          </CardTitle>
          <CardDescription className="text-sm text-emerald-700/80 dark:text-emerald-200/80">
            Online checkout is disabled in this demo. Always consult your doctor before starting a new medicine or supplement. Use these product ideas to discuss your at-home kit with your care team.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
