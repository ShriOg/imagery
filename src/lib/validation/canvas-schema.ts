import { z } from "zod";

export const SemanticMetaSchema = z.object({
  role: z.string().optional(),
  tags: z.array(z.string()).optional(),
  generatedBy: z.string().optional(),
});

export const BaseElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().min(1),
  height: z.number().min(1),
  rotation: z.number().transform((val) => val % 360),
  opacity: z.number().min(0).max(1),
  zIndex: z.number(),
  visible: z.boolean(),
  locked: z.boolean(),
  semantic: SemanticMetaSchema.optional(),
});

export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal("text"),
  content: z.string(),
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(500),
  fontWeight: z.string(),
  fontStyle: z.string(),
  textAlign: z.enum(["left", "center", "right", "justify"]),
  lineHeight: z.number(),
  letterSpacing: z.number(),
  color: z.string(),
  textDecoration: z.string(),
});

export const ShapeElementSchema = BaseElementSchema.extend({
  type: z.literal("shape"),
  shapeKind: z.enum(["rectangle", "circle", "ellipse", "triangle", "line", "star"]),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number(),
  borderRadius: z.number(),
});

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal("image"),
  src: z.string(),
  objectFit: z.enum(["fill", "contain", "cover"]),
  borderRadius: z.number(),
});

export const CanvasElementSchema = z.discriminatedUnion("type", [
  TextElementSchema,
  ShapeElementSchema,
  ImageElementSchema,
]);

export const BackgroundSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), color: z.string() }),
  z.object({
    type: z.literal("gradient"),
    angle: z.number(),
    stops: z.array(z.object({ offset: z.number(), color: z.string() })),
  }),
  z.object({ type: z.literal("image"), src: z.string(), opacity: z.number() }),
]);

export const CanvasStateSchema = z.object({
  width: z.number().min(1),
  height: z.number().min(1),
  background: BackgroundSchema,
  elements: z.array(CanvasElementSchema),
});

export function validateCanvasState(raw: unknown) {
  const result = CanvasStateSchema.safeParse(raw);
  if (result.success) {
    return { success: true, data: result.data, warnings: [] };
  }
  return { success: false, errors: result.error };
}
