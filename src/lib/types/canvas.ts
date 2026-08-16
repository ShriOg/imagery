export type ElementId = string;

export interface SemanticMeta {
  role?: string;
  tags?: string[];
  generatedBy?: string;
}

export interface BaseElement {
  id: ElementId;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  semantic?: SemanticMeta;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: "left" | "center" | "right" | "justify";
  lineHeight: number;
  letterSpacing: number;
  color: string;
  textDecoration: string;
}

export type ShapeKind = "rectangle" | "circle" | "ellipse" | "triangle" | "line" | "star";

export interface ShapeElement extends BaseElement {
  type: "shape";
  shapeKind: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  objectFit: "fill" | "contain" | "cover";
  borderRadius: number;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export type Background = 
  | { type: "solid"; color: string }
  | { type: "gradient"; angle: number; stops: Array<{ offset: number; color: string }> }
  | { type: "image"; src: string; opacity: number };

export interface CanvasState {
  width: number;
  height: number;
  background: Background;
  elements: CanvasElement[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  canvas: CanvasState;
}
