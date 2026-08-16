"use client";

import { useEffect, useRef, useCallback } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "@/store/useCanvasStore";
import { useToolStore } from "@/store/useToolStore";
import { CanvasDocument, CanvasElement, TextElement, ShapeElement, ImageElement } from "@/types/canvas";

// Helper to generate star coordinates
function getStarPoints(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    points.push({ x, y });
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    points.push({ x, y });
    rot += step;
  }
  return points;
}

export function useFabricCanvas(canvasElRef: React.RefObject<HTMLCanvasElement | null>) {
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const isInternalUpdateRef = useRef(false);
  const guideLinesRef = useRef<fabric.Line[]>([]);

  const document = useCanvasStore((s) => s.document);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const updateElements = useCanvasStore((s) => s.updateElements);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const commitHistory = useCanvasStore((s) => s.commitHistory);
  const addElement = useCanvasStore((s) => s.addElement);

  const activeTool = useToolStore((s) => s.activeTool);
  const activeShapeKind = useToolStore((s) => s.activeShapeKind);
  const setActiveTool = useToolStore((s) => s.setActiveTool);

  // Clear alignment guide lines
  const clearGuides = useCallback(() => {
    if (!fabricRef.current) return;
    guideLinesRef.current.forEach((line) => fabricRef.current?.remove(line));
    guideLinesRef.current = [];
    fabricRef.current.requestRenderAll();
  }, []);

  // Draw alignment guide line
  const drawGuide = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    if (!fabricRef.current) return;
    const guide = new fabric.Line([x1, y1, x2, y2], {
      stroke: "#F59E0B",
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      opacity: 0.85,
    });
    guideLinesRef.current.push(guide);
    fabricRef.current.add(guide);
  }, []);

  // Fabric Object factory
  const createFabricObject = useCallback((el: CanvasElement): fabric.FabricObject | null => {
    const commonProps = {
      left: el.x,
      top: el.y,
      angle: el.rotation,
      opacity: el.opacity,
      visible: el.visible,
      selectable: !el.locked && el.visible,
      evented: !el.locked && el.visible,
      originX: "center" as const,
      originY: "center" as const,
      transparentCorners: false,
      cornerColor: "#F59E0B",
      cornerStrokeColor: "#18181B",
      borderColor: "#F59E0B",
      cornerSize: 9,
      cornerStyle: "circle" as const,
      padding: 6,
      borderScaleFactor: 1.5,
    };

    let obj: fabric.FabricObject | null = null;

    if (el.type === "text") {
      const textEl = el as TextElement;
      obj = new fabric.Textbox(textEl.content, {
        ...commonProps,
        width: textEl.width,
        fontFamily: textEl.fontFamily,
        fontSize: textEl.fontSize,
        fontWeight: textEl.fontWeight,
        fill: textEl.fill,
        textAlign: textEl.textAlign,
        lineHeight: textEl.lineHeight,
        charSpacing: textEl.letterSpacing * 10,
        underline: textEl.underline,
        fontStyle: textEl.italic ? "italic" : "normal",
        splitByGrapheme: false,
      });
    } else if (el.type === "shape") {
      const shapeEl = el as ShapeElement;
      const strokeDashArray = shapeEl.strokeStyle === "dashed" ? [6, 6] : undefined;

      switch (shapeEl.shapeKind) {
        case "rectangle":
          obj = new fabric.Rect({
            ...commonProps,
            width: shapeEl.width,
            height: shapeEl.height,
            fill: shapeEl.fill,
            stroke: shapeEl.stroke,
            strokeWidth: shapeEl.strokeWidth,
            rx: shapeEl.cornerRadius || 0,
            ry: shapeEl.cornerRadius || 0,
            strokeDashArray,
          });
          break;
        case "circle":
          obj = new fabric.Circle({
            ...commonProps,
            radius: shapeEl.width / 2,
            fill: shapeEl.fill,
            stroke: shapeEl.stroke,
            strokeWidth: shapeEl.strokeWidth,
            strokeDashArray,
          });
          break;
        case "ellipse":
          obj = new fabric.Ellipse({
            ...commonProps,
            rx: shapeEl.width / 2,
            ry: shapeEl.height / 2,
            fill: shapeEl.fill,
            stroke: shapeEl.stroke,
            strokeWidth: shapeEl.strokeWidth,
            strokeDashArray,
          });
          break;
        case "triangle":
          obj = new fabric.Triangle({
            ...commonProps,
            width: shapeEl.width,
            height: shapeEl.height,
            fill: shapeEl.fill,
            stroke: shapeEl.stroke,
            strokeWidth: shapeEl.strokeWidth,
            strokeDashArray,
          });
          break;
        case "star": {
          const outerR = Math.min(shapeEl.width, shapeEl.height) / 2;
          const points = getStarPoints(0, 0, 5, outerR, outerR * 0.45);
          obj = new fabric.Polygon(points, {
            ...commonProps,
            fill: shapeEl.fill,
            stroke: shapeEl.stroke,
            strokeWidth: shapeEl.strokeWidth,
            strokeDashArray,
          });
          break;
        }
        case "line":
          obj = new fabric.Line(
            [-shapeEl.width / 2, -shapeEl.height / 2, shapeEl.width / 2, shapeEl.height / 2],
            {
              ...commonProps,
              stroke: shapeEl.stroke || shapeEl.fill,
              strokeWidth: shapeEl.strokeWidth || 2,
              strokeDashArray,
            }
          );
          break;
      }
    } else if (el.type === "image") {
      const imgEl = el as ImageElement;
      // Temporary placeholder while image loads
      obj = new fabric.Rect({
        ...commonProps,
        width: imgEl.width,
        height: imgEl.height,
        fill: "rgba(39, 39, 42, 0.6)",
        stroke: "#3f3f46",
        strokeWidth: 1,
        rx: 12,
        ry: 12,
      });

      // Async image loading using Fabric v6 FabricImage.fromURL
      fabric.FabricImage.fromURL(imgEl.src, { crossOrigin: "anonymous" })
        .then((img) => {
          if (!fabricRef.current) return;
          const canvas = fabricRef.current;
          
          img.set({
            ...commonProps,
            width: img.width,
            height: img.height,
            scaleX: imgEl.width / (img.width || 1),
            scaleY: imgEl.height / (img.height || 1),
            flipX: imgEl.flipX || false,
            flipY: imgEl.flipY || false,
          });

          (img as any).data = { id: el.id };

          const existing = canvas.getObjects().find((o) => (o as any).data?.id === el.id);
          if (existing) {
            canvas.remove(existing);
          }
          canvas.add(img);
          // Re-sort object in canvas to respect z-index
          syncCanvasZIndex(canvas, useCanvasStore.getState().document.elements);
          canvas.requestRenderAll();
        })
        .catch((err) => {
          console.warn("Image load failed, keeping placeholder:", err);
        });
    }

    if (obj) {
      (obj as any).data = { id: el.id };
    }

    return obj;
  }, []);

  // Sync canvas object stack order with canonical z-indices
  const syncCanvasZIndex = useCallback((canvas: fabric.Canvas, elements: CanvasElement[]) => {
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const canvasObjects = canvas.getObjects().filter((o) => !(o as any).isGuide);
    
    sorted.forEach((el) => {
      const obj = canvasObjects.find((o) => (o as any).data?.id === el.id);
      if (obj) {
        canvas.bringObjectToFront(obj);
      }
    });
  }, []);

  // Sync Zustand document state into Fabric Canvas
  const syncCanvasFromState = useCallback(
    (elements: CanvasElement[], canvas: fabric.Canvas) => {
      isInternalUpdateRef.current = true;

      // Retain active selection ID before sync
      const activeObjects = canvas.getActiveObjects();
      const currentSelectedIds = activeObjects
        .map((o) => (o as any).data?.id as string)
        .filter(Boolean);

      const existingObjects = canvas.getObjects().filter((o) => !(o as any).isGuide);
      const existingMap = new Map<string, fabric.FabricObject>();
      existingObjects.forEach((o) => {
        const id = (o as any).data?.id;
        if (id) existingMap.set(id, o);
      });

      const elementIds = new Set(elements.map((e) => e.id));

      // Remove obsolete objects
      existingMap.forEach((obj, id) => {
        if (!elementIds.has(id)) {
          canvas.remove(obj);
        }
      });

      // Update or create objects
      elements.forEach((el) => {
        const existing = existingMap.get(el.id);

        if (existing) {
          existing.set({
            left: el.x,
            top: el.y,
            angle: el.rotation,
            opacity: el.opacity,
            visible: el.visible,
            selectable: !el.locked && el.visible,
            evented: !el.locked && el.visible,
          });

          if (el.type === "text" && existing.type === "textbox") {
            const textEl = el as TextElement;
            (existing as fabric.Textbox).set({
              text: textEl.content,
              fontFamily: textEl.fontFamily,
              fontSize: textEl.fontSize,
              fontWeight: textEl.fontWeight,
              fill: textEl.fill,
              textAlign: textEl.textAlign,
              lineHeight: textEl.lineHeight,
              charSpacing: textEl.letterSpacing * 10,
              underline: textEl.underline,
              fontStyle: textEl.italic ? "italic" : "normal",
              width: textEl.width,
            });
          } else if (el.type === "shape") {
            const shapeEl = el as ShapeElement;
            const strokeDashArray = shapeEl.strokeStyle === "dashed" ? [6, 6] : undefined;
            existing.set({
              fill: shapeEl.fill,
              stroke: shapeEl.stroke,
              strokeWidth: shapeEl.strokeWidth,
              strokeDashArray,
            });
            if (shapeEl.shapeKind === "rectangle") {
              (existing as fabric.Rect).set({
                rx: shapeEl.cornerRadius || 0,
                ry: shapeEl.cornerRadius || 0,
              });
            }
          } else if (el.type === "image" && existing.type === "image") {
            const imgEl = el as ImageElement;
            existing.set({
              flipX: imgEl.flipX || false,
              flipY: imgEl.flipY || false,
            });
          }
        } else {
          const newObj = createFabricObject(el);
          if (newObj) {
            canvas.add(newObj);
          }
        }
      });

      syncCanvasZIndex(canvas, elements);

      // Restore active selection
      if (currentSelectedIds.length > 0) {
        const toSelect = canvas
          .getObjects()
          .filter((o) => currentSelectedIds.includes((o as any).data?.id));
        if (toSelect.length === 1) {
          canvas.setActiveObject(toSelect[0]);
        } else if (toSelect.length > 1) {
          const sel = new fabric.ActiveSelection(toSelect, { canvas });
          canvas.setActiveObject(sel);
        }
      }

      canvas.requestRenderAll();
      isInternalUpdateRef.current = false;
    },
    [createFabricObject, syncCanvasZIndex]
  );

  // Initialize Canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: document.width,
      height: document.height,
      backgroundColor: document.backgroundColor,
      selection: true,
      preserveObjectStacking: true,
      uniformScaling: false,
    });

    fabricRef.current = canvas;

    // Selection Events
    const handleSelection = () => {
      if (isInternalUpdateRef.current) return;
      const active = canvas.getActiveObjects();
      const ids = active.map((o) => (o as any).data?.id as string).filter(Boolean);
      setSelectedIds(ids);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => {
      if (isInternalUpdateRef.current) return;
      setSelectedIds([]);
    });

    // Object Modification (Move, Resize, Rotate) -> Terminal Commit
    canvas.on("object:modified", (e) => {
      if (isInternalUpdateRef.current) return;
      clearGuides();

      const target = e.target;
      if (!target) return;

      commitHistory();
      isInternalUpdateRef.current = true;

      if (target.type === "activeselection") {
        // Multi-selection transformation
        const activeSel = target as fabric.ActiveSelection;
        const objects = activeSel.getObjects();
        const updates: Array<{ id: string; changes: Partial<CanvasElement> }> = [];

        objects.forEach((obj) => {
          const id = (obj as any).data?.id;
          if (!id) return;
          const matrix = obj.calcTransformMatrix();
          const point = fabric.util.qrDecompose(matrix);

          const scaledW = Math.max(10, Math.round(obj.getScaledWidth()));
          const scaledH = Math.max(10, Math.round(obj.getScaledHeight()));

          obj.set({
            scaleX: 1,
            scaleY: 1,
            width: scaledW,
            height: scaledH,
          });

          updates.push({
            id,
            changes: {
              x: Math.round(point.translateX),
              y: Math.round(point.translateY),
              width: scaledW,
              height: scaledH,
              rotation: Math.round(point.angle || 0),
            },
          });
        });

        updateElements(updates);
      } else {
        // Single object transformation
        const id = (target as any).data?.id;
        if (id) {
          const scaledW = Math.max(10, Math.round(target.getScaledWidth()));
          const scaledH = Math.max(10, Math.round(target.getScaledHeight()));

          target.set({
            scaleX: 1,
            scaleY: 1,
            width: scaledW,
            height: scaledH,
          });

          updateElement(id, {
            x: Math.round(target.left || 0),
            y: Math.round(target.top || 0),
            width: scaledW,
            height: scaledH,
            rotation: Math.round(target.angle || 0),
            opacity: target.opacity ?? 1,
          });
        }
      }

      canvas.requestRenderAll();
      isInternalUpdateRef.current = false;
    });

    // In-place text editing change
    canvas.on("text:changed", (e) => {
      const target = e.target as fabric.Textbox;
      if (!target) return;
      const id = (target as any).data?.id;
      if (id && target.text !== undefined) {
        updateElement(id, { content: target.text }, false);
      }
    });

    // In-place text editing exit -> commit snapshot
    canvas.on("text:editing:exited", (e) => {
      const target = e.target as fabric.Textbox;
      if (!target) return;
      const id = (target as any).data?.id;
      if (id && target.text !== undefined) {
        updateElement(id, { content: target.text }, true);
      }
    });

    // Moving Smart Alignment Guides
    canvas.on("object:moving", (e) => {
      clearGuides();
      const target = e.target;
      if (!target) return;

      const docW = document.width;
      const docH = document.height;
      const centerX = docW / 2;
      const centerY = docH / 2;

      const objX = target.left || 0;
      const objY = target.top || 0;
      const threshold = 6;

      // Snap to Center X
      if (Math.abs(objX - centerX) < threshold) {
        target.set({ left: centerX });
        drawGuide(centerX, 0, centerX, docH);
      }

      // Snap to Center Y
      if (Math.abs(objY - centerY) < threshold) {
        target.set({ top: centerY });
        drawGuide(0, centerY, docW, centerY);
      }
    });

    // Tool click insertion on canvas stage
    canvas.on("mouse:down", (e) => {
      const currentTool = useToolStore.getState().activeTool;
      const currentShape = useToolStore.getState().activeShapeKind;
      
      if (currentTool === "select" || currentTool === "hand") return;

      const pointer = canvas.getPointer(e.e);
      const clickX = Math.round(pointer.x);
      const clickY = Math.round(pointer.y);

      const id = `el_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      if (currentTool === "text") {
        addElement({
          id,
          name: "Text",
          type: "text",
          content: "Double click to edit",
          fontFamily: "Inter",
          fontSize: 48,
          fontWeight: 500,
          fill: "#F5F5F0",
          textAlign: "left",
          lineHeight: 1.2,
          letterSpacing: 0,
          underline: false,
          italic: false,
          x: clickX,
          y: clickY,
          width: 380,
          height: 60,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
          locked: false,
          visible: true,
        });
      } else if (currentTool === "shape") {
        let width = 180;
        let height = 180;
        let fill = "rgba(245, 158, 11, 0.15)";
        let stroke = "#F59E0B";
        let cornerRadius = 16;

        if (currentShape === "line") {
          width = 240;
          height = 0;
          fill = "#F59E0B";
        }

        addElement({
          id,
          name: `${currentShape.charAt(0).toUpperCase() + currentShape.slice(1)}`,
          type: "shape",
          shapeKind: currentShape,
          fill,
          stroke,
          strokeWidth: 2,
          cornerRadius,
          strokeStyle: "solid",
          x: clickX,
          y: clickY,
          width,
          height,
          rotation: 0,
          opacity: 1,
          zIndex: 0,
          locked: false,
          visible: true,
        });
      }

      useToolStore.getState().setActiveTool("select");
    });

    // Initial render from state
    syncCanvasFromState(document.elements, canvas);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []); // Run once on mount

  // Sync canvas on document element changes
  useEffect(() => {
    if (!fabricRef.current) return;
    if (isInternalUpdateRef.current) return;
    syncCanvasFromState(document.elements, fabricRef.current);
  }, [document.elements, syncCanvasFromState]);

  // Sync canvas background color and dimensions
  useEffect(() => {
    if (!fabricRef.current) return;
    fabricRef.current.backgroundColor = document.backgroundColor;
    fabricRef.current.setDimensions({ width: document.width, height: document.height });
    fabricRef.current.requestRenderAll();
  }, [document.backgroundColor, document.width, document.height]);

  return { fabricCanvas: fabricRef.current };
}
