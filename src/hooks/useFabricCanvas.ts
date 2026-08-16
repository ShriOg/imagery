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
  const isSnappedRef = useRef(false);

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
  const isSpacePressed = useToolStore((s) => s.isSpacePressed);

  // Clear alignment guide lines
  const clearGuides = useCallback(() => {
    if (!fabricRef.current) return;
    guideLinesRef.current.forEach((line) => fabricRef.current?.remove(line));
    guideLinesRef.current = [];
    fabricRef.current.requestRenderAll();
  }, []);

  // Draw alignment guide line with glowing amber style
  const drawGuide = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    if (!fabricRef.current) return;
    const guide = new fabric.Line([x1, y1, x2, y2], {
      stroke: "#fbbc00",
      strokeWidth: 1.5,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      opacity: 0.95,
      excludeFromExport: true,
      shadow: new fabric.Shadow({
        color: "rgba(251, 188, 0, 0.7)",
        blur: 6,
      }),
    });
    (guide as any).isGuide = true;
    guideLinesRef.current.push(guide);
    fabricRef.current.add(guide);
    fabricRef.current.bringObjectToFront(guide);
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
      shadow: el.shadowEnabled
        ? new fabric.Shadow({
            color: el.shadowColor || "rgba(0, 0, 0, 0.75)",
            blur: typeof el.shadowBlur === "number" ? el.shadowBlur : 15,
            offsetX: typeof el.shadowOffsetX === "number" ? el.shadowOffsetX : 5,
            offsetY: typeof el.shadowOffsetY === "number" ? el.shadowOffsetY : 5,
          })
        : undefined,
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

          const naturalW = img.width || 1;
          const naturalH = img.height || 1;
          const naturalAspect = naturalW / naturalH;

          // Preserve exact original aspect ratio
          let finalW = imgEl.width;
          let finalH = imgEl.height;
          if (imgEl.aspectRatio) {
            finalH = Math.round(finalW / imgEl.aspectRatio);
          } else {
            finalH = Math.round(finalW / naturalAspect);
          }
          
          img.set({
            ...commonProps,
            left: imgEl.x,
            top: imgEl.y,
            width: naturalW,
            height: naturalH,
            scaleX: finalW / naturalW,
            scaleY: finalH / naturalH,
            flipX: imgEl.flipX || false,
            flipY: imgEl.flipY || false,
            lockUniScaling: true,
          });

          img.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            tr: true,
            tl: true,
            br: true,
            bl: true,
            mtr: true,
          });

          (img as any).data = { id: el.id, src: imgEl.src };

          const existing = canvas.getObjects().find((o) => (o as any).data?.id === el.id);
          if (existing) {
            canvas.remove(existing);
          }
          canvas.add(img);
          // Re-sort object in canvas to respect z-index
          syncCanvasZIndex(canvas, useCanvasStore.getState().document.elements);
          
          const filters: any[] = [];
          if (imgEl.brightness) filters.push(new fabric.filters.Brightness({ brightness: imgEl.brightness }));
          if (imgEl.contrast) filters.push(new fabric.filters.Contrast({ contrast: imgEl.contrast }));
          if (imgEl.saturation) filters.push(new fabric.filters.Saturation({ saturation: imgEl.saturation }));
          if (imgEl.blur) filters.push(new fabric.filters.Blur({ blur: imgEl.blur }));
          if (imgEl.grayscale) filters.push(new fabric.filters.Grayscale());
          img.filters = filters;
          img.applyFilters();

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
          const shadow = el.shadowEnabled
            ? new fabric.Shadow({
                color: el.shadowColor || "rgba(0, 0, 0, 0.75)",
                blur: typeof el.shadowBlur === "number" ? el.shadowBlur : 15,
                offsetX: typeof el.shadowOffsetX === "number" ? el.shadowOffsetX : 5,
                offsetY: typeof el.shadowOffsetY === "number" ? el.shadowOffsetY : 5,
              })
            : null;

          existing.set({
            left: el.x,
            top: el.y,
            angle: el.rotation,
            opacity: el.opacity,
            visible: el.visible,
            selectable: !el.locked && el.visible,
            evented: !el.locked && el.visible,
            shadow,
          });
          existing.dirty = true;

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
            existing.dirty = true;
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
            existing.dirty = true;
          } else if (el.type === "image" && existing.type === "image") {
            const imgEl = el as ImageElement;
            const img = existing as fabric.FabricImage;
            const prevSrc = (existing as any).data?.src;

            if (prevSrc !== imgEl.src) {
              // Image source changed (e.g. crop applied) -> reload image from new src
              fabric.FabricImage.fromURL(imgEl.src, { crossOrigin: "anonymous" }).then((newImg) => {
                if (!fabricRef.current) return;
                const canvas = fabricRef.current;
                const natW = newImg.width || 1;
                const natH = newImg.height || 1;
                newImg.set({
                  left: imgEl.x,
                  top: imgEl.y,
                  width: natW,
                  height: natH,
                  scaleX: imgEl.width / natW,
                  scaleY: imgEl.height / natH,
                  flipX: imgEl.flipX || false,
                  flipY: imgEl.flipY || false,
                  lockUniScaling: true,
                  originX: "center",
                  originY: "center",
                  shadow,
                });
                (newImg as any).data = { id: el.id, src: imgEl.src };
                newImg.setControlsVisibility({
                  mt: false,
                  mb: false,
                  ml: false,
                  mr: false,
                  tr: true,
                  tl: true,
                  br: true,
                  bl: true,
                  mtr: true,
                });
                const idx = canvas.getObjects().indexOf(existing);
                canvas.remove(existing);
                if (idx >= 0) {
                  canvas.insertAt(idx, newImg);
                } else {
                  canvas.add(newImg);
                }
                if (currentSelectedIds.includes(el.id)) {
                  canvas.setActiveObject(newImg);
                }
                syncCanvasZIndex(canvas, elements);

                const filters: any[] = [];
                if (typeof imgEl.brightness === "number" && imgEl.brightness !== 0) {
                  filters.push(new fabric.filters.Brightness({ brightness: imgEl.brightness }));
                }
                if (typeof imgEl.contrast === "number" && imgEl.contrast !== 0) {
                  filters.push(new fabric.filters.Contrast({ contrast: imgEl.contrast }));
                }
                if (typeof imgEl.saturation === "number" && imgEl.saturation !== 0) {
                  filters.push(new fabric.filters.Saturation({ saturation: imgEl.saturation }));
                }
                if (typeof imgEl.blur === "number" && imgEl.blur !== 0) {
                  filters.push(new fabric.filters.Blur({ blur: imgEl.blur }));
                }
                if (imgEl.grayscale) {
                  filters.push(new fabric.filters.Grayscale());
                }
                newImg.filters = filters;
                newImg.applyFilters();
                newImg.dirty = true;

                canvas.requestRenderAll();
              });
            } else {
              const naturalW = img.width || 1;
              const naturalH = img.height || 1;
              existing.set({
                scaleX: imgEl.width / naturalW,
                scaleY: imgEl.height / naturalH,
                flipX: imgEl.flipX || false,
                flipY: imgEl.flipY || false,
                lockUniScaling: true,
                shadow,
              });

              const filters: any[] = [];
              if (typeof imgEl.brightness === "number" && imgEl.brightness !== 0) {
                filters.push(new fabric.filters.Brightness({ brightness: imgEl.brightness }));
              }
              if (typeof imgEl.contrast === "number" && imgEl.contrast !== 0) {
                filters.push(new fabric.filters.Contrast({ contrast: imgEl.contrast }));
              }
              if (typeof imgEl.saturation === "number" && imgEl.saturation !== 0) {
                filters.push(new fabric.filters.Saturation({ saturation: imgEl.saturation }));
              }
              if (typeof imgEl.blur === "number" && imgEl.blur !== 0) {
                filters.push(new fabric.filters.Blur({ blur: imgEl.blur }));
              }
              if (imgEl.grayscale) {
                filters.push(new fabric.filters.Grayscale());
              }
              
              img.filters = filters;
              img.applyFilters();
              existing.dirty = true;
            }
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

          if (obj.type !== "image") {
            obj.set({
              scaleX: 1,
              scaleY: 1,
              width: scaledW,
              height: scaledH,
            });
          }

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

          if (target.type !== "image") {
            target.set({
              scaleX: 1,
              scaleY: 1,
              width: scaledW,
              height: scaledH,
            });
          }

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

    // Moving Smart Alignment Guides (Figma-grade multi-object & canvas snapping)
    canvas.on("object:moving", (e) => {
      clearGuides();
      const target = e.target;
      if (!target) return;

      const docW = document.width;
      const docH = document.height;
      const threshold = 6;

      const targetW = target.getScaledWidth();
      const targetH = target.getScaledHeight();
      let targetX = target.left || 0;
      let targetY = target.top || 0;

      const targetLeft = targetX - targetW / 2;
      const targetRight = targetX + targetW / 2;
      const targetTop = targetY - targetH / 2;
      const targetBottom = targetY + targetH / 2;

      // Candidate objects to align against
      const targetId = (target as any).data?.id;
      const otherObjects = canvas.getObjects().filter((obj) => {
        return (
          !(obj as any).isGuide &&
          (obj as any).data?.id &&
          (obj as any).data?.id !== targetId &&
          obj.visible
        );
      });

      let snappedX = false;
      let snappedY = false;

      // 1. Canvas Center Snapping
      const canvasCenterX = docW / 2;
      const canvasCenterY = docH / 2;

      if (Math.abs(targetX - canvasCenterX) < threshold) {
        target.set({ left: canvasCenterX });
        targetX = canvasCenterX;
        snappedX = true;
        drawGuide(canvasCenterX, 0, canvasCenterX, docH);
      }

      if (Math.abs(targetY - canvasCenterY) < threshold) {
        target.set({ top: canvasCenterY });
        targetY = canvasCenterY;
        snappedY = true;
        drawGuide(0, canvasCenterY, docW, canvasCenterY);
      }

      // 2. Canvas Outer Boundary / Margin Snapping
      if (!snappedX) {
        if (Math.abs(targetLeft - 0) < threshold) {
          target.set({ left: targetW / 2 });
          snappedX = true;
          drawGuide(0, 0, 0, docH);
        } else if (Math.abs(targetRight - docW) < threshold) {
          target.set({ left: docW - targetW / 2 });
          snappedX = true;
          drawGuide(docW, 0, docW, docH);
        }
      }

      if (!snappedY) {
        if (Math.abs(targetTop - 0) < threshold) {
          target.set({ top: targetH / 2 });
          snappedY = true;
          drawGuide(0, 0, docW, 0);
        } else if (Math.abs(targetBottom - docH) < threshold) {
          target.set({ top: docH - targetH / 2 });
          snappedY = true;
          drawGuide(0, docH, docW, docH);
        }
      }

      // 3. Inter-Object Alignment Snapping
      for (const other of otherObjects) {
        const otherW = other.getScaledWidth();
        const otherH = other.getScaledHeight();
        const otherX = other.left || 0;
        const otherY = other.top || 0;
        const otherLeft = otherX - otherW / 2;
        const otherRight = otherX + otherW / 2;
        const otherTop = otherY - otherH / 2;
        const otherBottom = otherY + otherH / 2;

        // X-Axis Alignment Checks (Draw vertical guide line)
        if (!snappedX) {
          // Center to Center
          if (Math.abs(targetX - otherX) < threshold) {
            target.set({ left: otherX });
            snappedX = true;
            drawGuide(otherX, 0, otherX, docH);
          }
          // Left to Left
          else if (Math.abs(targetLeft - otherLeft) < threshold) {
            target.set({ left: otherLeft + targetW / 2 });
            snappedX = true;
            drawGuide(otherLeft, 0, otherLeft, docH);
          }
          // Right to Right
          else if (Math.abs(targetRight - otherRight) < threshold) {
            target.set({ left: otherRight - targetW / 2 });
            snappedX = true;
            drawGuide(otherRight, 0, otherRight, docH);
          }
          // Left to Right
          else if (Math.abs(targetLeft - otherRight) < threshold) {
            target.set({ left: otherRight + targetW / 2 });
            snappedX = true;
            drawGuide(otherRight, 0, otherRight, docH);
          }
          // Right to Left
          else if (Math.abs(targetRight - otherLeft) < threshold) {
            target.set({ left: otherLeft - targetW / 2 });
            snappedX = true;
            drawGuide(otherLeft, 0, otherLeft, docH);
          }
        }

        // Y-Axis Alignment Checks (Draw horizontal guide line)
        if (!snappedY) {
          // Center to Center
          if (Math.abs(targetY - otherY) < threshold) {
            target.set({ top: otherY });
            snappedY = true;
            drawGuide(0, otherY, docW, otherY);
          }
          // Top to Top
          else if (Math.abs(targetTop - otherTop) < threshold) {
            target.set({ top: otherTop + targetH / 2 });
            snappedY = true;
            drawGuide(0, otherTop, docW, otherTop);
          }
          // Bottom to Bottom
          else if (Math.abs(targetBottom - otherBottom) < threshold) {
            target.set({ top: otherBottom - targetH / 2 });
            snappedY = true;
            drawGuide(0, otherBottom, docW, otherBottom);
          }
          // Top to Bottom
          else if (Math.abs(targetTop - otherBottom) < threshold) {
            target.set({ top: otherBottom + targetH / 2 });
            snappedY = true;
            drawGuide(0, otherBottom, docW, otherBottom);
          }
          // Bottom to Top
          else if (Math.abs(targetBottom - otherTop) < threshold) {
            target.set({ top: otherTop - targetH / 2 });
            snappedY = true;
            drawGuide(0, otherTop, docW, otherTop);
          }
        }

        if (snappedX && snappedY) break;
      }

      // Tactile physical snapping pulse feedback
      if ((snappedX || snappedY) && !isSnappedRef.current) {
        isSnappedRef.current = true;
        const currentScaleX = target.scaleX || 1;
        const currentScaleY = target.scaleY || 1;
        target.set({
          scaleX: currentScaleX * 1.015,
          scaleY: currentScaleY * 1.015,
        });
        target.dirty = true;
        canvas.requestRenderAll();

        setTimeout(() => {
          if (target && fabricRef.current) {
            target.set({
              scaleX: currentScaleX,
              scaleY: currentScaleY,
            });
            target.dirty = true;
            fabricRef.current.requestRenderAll();
          }
        }, 50);
      } else if (!snappedX && !snappedY) {
        isSnappedRef.current = false;
      }
    });

    // Clear guides on mouse release
    canvas.on("mouse:up", () => {
      clearGuides();
      isSnappedRef.current = false;
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

  // Synchronize Fabric cursor state with active tool
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    if (activeTool === "hand" || isSpacePressed) {
      canvas.defaultCursor = "grab";
      canvas.hoverCursor = "grab";
    } else if (activeTool === "shape" || activeTool === "text") {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    }
  }, [activeTool, isSpacePressed]);

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
