import { z } from 'zod';

export const AIImageModificationSchema = z.object({
  presetFilter: z.enum(['none', 'grayscale', 'negative', 'noir', 'sepia', 'polaroid', 'kodachrome', 'vintage', '8-bit', 'duotone', 'golden-hour', '90s-camcorder', 'cinematic-muted', 'vintage-fade', 'monochrome-noir']).optional(),
  adjustments: z.object({
    brightness: z.number().min(-1).max(1).optional(),
    contrast: z.number().min(-1).max(1).optional(),
    saturation: z.number().min(-1).max(1).optional(),
    blur: z.number().min(0).max(1).optional(),
  }).optional(),
  cropPreset: z.enum(['none', '1:1', '16:9', '9:16', '4:5']).optional(),
  flip: z.object({
    horizontal: z.boolean().optional(),
    vertical: z.boolean().optional()
  }).optional()
});

export type AIImageModification = z.infer<typeof AIImageModificationSchema>;
