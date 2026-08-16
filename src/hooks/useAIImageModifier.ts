import { useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAILogStore } from '@/store/useAILogStore';
import { useToastStore } from '@/store/useToastStore';
import { AIImageModification } from '@/types/ai-config';

export function useAIImageModifier() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { updateElement, document: canvasDocument } = useCanvasStore();
  const addLog = useAILogStore((s) => s.addLog);
  const addToast = useToastStore((s) => s.addToast);

  const modifyImage = async (prompt: string, imageId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/image-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI configuration');
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const config = data.config as AIImageModification;
      const element = canvasDocument.elements.find(el => el.id === imageId);
      
      if (!element || element.type !== 'image') {
        throw new Error('Invalid image selection');
      }

      // Log the AI modification
      addLog({
        prompt,
        elementId: imageId,
        config
      });

      // Map config to our element schema
      const updates: any = {};

      if (config.presetFilter && config.presetFilter !== 'none') {
        // AI presetFilter maps directly to our presetFilter or gradePreset
        const gradePresets = ['golden-hour', '90s-camcorder', 'cinematic-muted', 'vintage-fade', 'monochrome-noir'];
        if (gradePresets.includes(config.presetFilter)) {
          updates.gradePreset = config.presetFilter;
          updates.presetFilter = 'none';
        } else {
          updates.presetFilter = config.presetFilter;
          updates.gradePreset = 'none';
        }
      } else if (config.presetFilter === 'none') {
        updates.presetFilter = 'none';
        updates.gradePreset = 'none';
      }

      if (config.adjustments) {
        if (typeof config.adjustments.brightness === 'number') updates.brightness = config.adjustments.brightness;
        if (typeof config.adjustments.contrast === 'number') updates.contrast = config.adjustments.contrast;
        if (typeof config.adjustments.saturation === 'number') updates.saturation = config.adjustments.saturation;
        if (typeof config.adjustments.blur === 'number') updates.blur = config.adjustments.blur;
      }

      if (config.cropPreset && config.cropPreset !== 'none') {
        let newAspectRatio = 1;
        switch (config.cropPreset) {
          case '1:1': newAspectRatio = 1; break;
          case '16:9': newAspectRatio = 16 / 9; break;
          case '9:16': newAspectRatio = 9 / 16; break;
          case '4:5': newAspectRatio = 4 / 5; break;
        }
        
        updates.aspectRatio = newAspectRatio;
        updates.height = Math.round(element.width / newAspectRatio);
      }

      if (config.flip) {
        if (typeof config.flip.horizontal === 'boolean') updates.flipX = config.flip.horizontal;
        if (typeof config.flip.vertical === 'boolean') updates.flipY = config.flip.vertical;
      }

      updateElement(imageId, updates, true);
      addToast("AI enchantment applied");

    } catch (error: any) {
      console.error('Error in AI Image Modifier:', error);
      addToast(error.message || "AI failed to generate configuration");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    modifyImage
  };
}
