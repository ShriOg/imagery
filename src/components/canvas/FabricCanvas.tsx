"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { CanvasState } from "@/lib/types";

function syncStateToFabric(fabricCanvas: fabric.Canvas, state: CanvasState) {
  fabricCanvas.clear();

  if (state.background.type === "solid") {
    fabricCanvas.backgroundColor = state.background.color;
  } else {
    fabricCanvas.backgroundColor = "#ffffff";
  }

  state.elements.forEach((el) => {
    let obj: fabric.FabricObject | null = null;

    if (el.type === "text") {
      obj = new fabric.IText(el.content, {
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        angle: el.rotation,
        opacity: el.opacity,
        visible: el.visible,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        textAlign: el.textAlign,
        lineHeight: el.lineHeight,
        fill: el.color,
        originX: "center",
        originY: "center",
      });
    } else if (el.type === "shape") {
      if (el.shapeKind === "rectangle") {
        obj = new fabric.Rect({
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          angle: el.rotation,
          opacity: el.opacity,
          visible: el.visible,
          fill: el.fill,
          stroke: el.stroke,
          strokeWidth: el.strokeWidth,
          rx: el.borderRadius,
          ry: el.borderRadius,
          originX: "center",
          originY: "center",
        });
      } else if (el.shapeKind === "circle") {
         obj = new fabric.Circle({
          left: el.x,
          top: el.y,
          radius: el.width / 2,
          angle: el.rotation,
          opacity: el.opacity,
          visible: el.visible,
          fill: el.fill,
          stroke: el.stroke,
          strokeWidth: el.strokeWidth,
          originX: "center",
          originY: "center",
        });
      }
    } else if (el.type === "image") {
       obj = new fabric.Rect({
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          fill: "#e0e0e0", 
          originX: "center",
          originY: "center",
        });
    }

    if (obj) {
      // Phase 2: Interactivity enabled
      obj.set({
        id: el.id,
        selectable: !el.locked,
        evented: true,
        hasControls: true,
      });
      fabricCanvas.add(obj);
    }
  });

  fabricCanvas.requestRenderAll();
}

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const canvasState = useCanvasStore((s) => s.canvas);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const commit = useCanvasStore((s) => s.commit);
  
  const isInternalUpdate = useCanvasStore((s) => s.isInternalUpdate);
  const setInternalUpdate = useCanvasStore((s) => s.setInternalUpdate);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasState.width,
      height: canvasState.height,
      selection: true, // Enable selection in Phase 2
      preserveObjectStacking: true, // Keep z-index stable when selecting
    });

    fabricCanvasRef.current = canvas;

    // Track when object is modified to push updates to store
    canvas.on("object:modified", (e) => {
      const obj = e.target;
      if (!obj) return;
      
      const id = obj.get("id" as keyof fabric.FabricObject) as string;
      if (!id) return;

      // We need to commit the state BEFORE the modification to history
      // Fabric's object:modified fires after the change. But wait, if we commit now,
      // it will commit the already-modified state? No, Zustand still has the old state.
      // So committing here captures the old state into 'past'.
      commit();

      setInternalUpdate(true);
      
      // Update store with new spatial properties
      updateElement(id, {
        x: obj.left,
        y: obj.top,
        width: obj.width! * (obj.scaleX || 1), // Fabric uses scaleX/scaleY for resizing by default
        height: obj.height! * (obj.scaleY || 1),
        rotation: obj.angle || 0,
      });
    });
    
    // Text editing hook
    canvas.on("text:changed", (e) => {
      const obj = e.target as fabric.IText;
      if (!obj || !obj.text) return;
      
      const id = obj.get("id" as keyof fabric.FabricObject) as string;
      if (!id) return;
      
      setInternalUpdate(true);
      updateElement(id, { content: obj.text });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Prevent deleting if user is editing text
        if (canvas.getActiveObject()?.isEditing) return;
        
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          e.preventDefault();
          commit();
          setInternalUpdate(true);
          activeObjects.forEach(obj => {
            const id = obj.get("id" as keyof fabric.FabricObject) as string;
            if (id) removeElement(id);
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state to Fabric whenever the Zustand state changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    // If the change came from the canvas itself (drag/drop), don't teardown and rebuild
    // as it breaks the current selection and interaction flow.
    if (isInternalUpdate) {
      setInternalUpdate(false); // reset for next update
      return;
    }
    
    syncStateToFabric(fabricCanvasRef.current, canvasState);
  }, [canvasState, isInternalUpdate, setInternalUpdate]);

  return (
    <div style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
