import { z } from "zod";

export type ElementType = 'text' | 'shape' | 'image';
export type ShapeKind = 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'star' | 'line';

export interface BaseElement {
  id: string;
  name?: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  shadowEnabled?: boolean;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fill: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  underline: boolean;
  italic: boolean;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeKind: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number; // for rectangles
  strokeStyle?: 'solid' | 'dashed';
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  cropX?: number;
  cropY?: number;
  aspectRatio: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  grayscale?: boolean;
  flipX?: boolean;
  flipY?: boolean;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export interface CanvasDocument {
  id: string;
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  elements: CanvasElement[];
}

// Zod Schemas for Validation
export const BaseElementSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.enum(['text', 'shape', 'image']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  zIndex: z.number().default(0),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
  shadowEnabled: z.boolean().optional().default(false),
  shadowBlur: z.number().optional().default(10),
  shadowOffsetX: z.number().optional().default(5),
  shadowOffsetY: z.number().optional().default(5),
  shadowColor: z.string().optional().default('rgba(0,0,0,0.5)'),
});

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  content: z.string().default('Double click to edit'),
  fontFamily: z.string().default('Inter'),
  fontSize: z.number().default(36),
  fontWeight: z.union([z.number(), z.string()]).default(400),
  fill: z.string().default('#F5F5F0'),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  lineHeight: z.number().default(1.2),
  letterSpacing: z.number().default(0),
  underline: z.boolean().default(false),
  italic: z.boolean().default(false),
});

export const ShapeElementSchema = BaseElementSchema.extend({
  type: z.literal('shape'),
  shapeKind: z.enum(['rectangle', 'circle', 'ellipse', 'triangle', 'star', 'line']),
  fill: z.string().default('#27272a'),
  stroke: z.string().default('#F59E0B'),
  strokeWidth: z.number().default(2),
  cornerRadius: z.number().optional().default(0),
  strokeStyle: z.enum(['solid', 'dashed']).optional().default('solid'),
});

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  cropX: z.number().optional(),
  cropY: z.number().optional(),
  aspectRatio: z.number().default(1),
  blur: z.number().optional().default(0),
  brightness: z.number().optional().default(0),
  contrast: z.number().optional().default(0),
  saturation: z.number().optional().default(0),
  grayscale: z.boolean().optional().default(false),
  flipX: z.boolean().optional().default(false),
  flipY: z.boolean().optional().default(false),
});

export const CanvasElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  ShapeElementSchema,
  ImageElementSchema,
]);

export const CanvasDocumentSchema = z.object({
  id: z.string(),
  title: z.string().default('Untitled Studio Design'),
  width: z.number().default(1080),
  height: z.number().default(1080),
  backgroundColor: z.string().default('#18181B'),
  elements: z.array(CanvasElementSchema).default([]),
});
