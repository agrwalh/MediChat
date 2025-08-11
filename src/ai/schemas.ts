
import { z } from 'zod';

export const SupportedLanguages = z.enum([
    "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Hindi", "Arabic", "Russian"
]);
