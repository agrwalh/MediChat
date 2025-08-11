
'use server';
/**
 * @fileOverview An AI agent that translates health reports into different languages.
 *
 * - translateHealthReport - A function that handles the translation process.
 * - HealthReportTranslatorInput - The input type for the translateHealthReport function.
 * - HealthReportTranslatorOutput - The return type for the translateHealthReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SupportedLanguages } from '@/ai/schemas';

const HealthReportTranslatorInputSchema = z.object({
  text: z.string().describe('The health report text to be translated.'),
  targetLanguage: SupportedLanguages.describe('The language to translate the text into.'),
});
export type HealthReportTranslatorInput = z.infer<typeof HealthReportTranslatorInputSchema>;

const HealthReportTranslatorOutputSchema = z.object({
  translatedText: z.string().describe('The translated health report text.'),
});
export type HealthReportTranslatorOutput = z.infer<typeof HealthReportTranslatorOutputSchema>;

export async function translateHealthReport(input: HealthReportTranslatorInput): Promise<HealthReportTranslatorOutput> {
  return healthReportTranslatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'healthReportTranslatorPrompt',
  input: { schema: HealthReportTranslatorInputSchema },
  output: { schema: HealthReportTranslatorOutputSchema },
  prompt: `You are an expert medical translator. Your task is to translate the provided health report text into the specified target language accurately. Maintain the original formatting and medical terminology as much as possible.

  Target Language: {{{targetLanguage}}}
  
  Report Text to Translate:
  ---
  {{{text}}}
  ---
  `,
});

const healthReportTranslatorFlow = ai.defineFlow(
  {
    name: 'healthReportTranslatorFlow',
    inputSchema: HealthReportTranslatorInputSchema,
    outputSchema: HealthReportTranslatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Translation failed to generate a response.');
    }
    return output;
  }
);
