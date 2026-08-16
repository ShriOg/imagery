"use client";

import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useCanvasStore } from "@/lib/store/canvas-store";
import { CanvasState } from "@/lib/types";

function syncStateToFabric(fabricCanvas: fabric.Canvas, state: CanvasState) {
  console.log(`[DEBUG 8] syncStateToFabric rendering ${state.elements.length} elements`);
  
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
      // Map asset keys to picsum for the hackathon prototype
      const url = el.src === "asset_1" ? "https://picsum.photos/seed/asset1/800/600" :
                  el.src === "asset_2" ? "https://picsum.photos/seed/asset2/1000/1000" :
                  el.src || "https://picsum.photos/800/600";
                  
      // We create a temporary rectangle while the image loads
      obj = new fabric.Rect({
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          fill: "#e0e0e0", 
          originX: "center",
          originY: "center",
      });
      
      // Load image asynchronously
      fabric.Image.fromURL(url).then((img) => {
        if (!img) return;
        
        // Match the layout
        img.set({
          id: el.id,
          left: el.x,
          top: el.y,
          width: img.width, // actual original width
          height: img.height, // actual original height
          scaleX: el.width / (img.width || 1),
          scaleY: el.height / (img.height || 1),
          angle: el.rotation,
          opacity: el.opacity,
          visible: el.visible,
          originX: "center",
          originY: "center",
          selectable: !el.locked,
          evented: true,
          hasControls: true,
        });
        
        // Replace the placeholder with the actual image
        const canvasObjects = fabricCanvas.getObjects();
        const placeholder = canvasObjects.find(o => o.get("id" as keyof fabric.FabricObject) === el.id && o.type === "rect");
        if (placeholder) {
          fabricCanvas.remove(placeholder);
        }
        fabricCanvas.add(img);
        fabricCanvas.requestRenderAll();
      }).catch(err => console.error("Failed to load image", err));
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
      console.log(`[DEBUG 8] Rendered element ID: ${el.id}, type: ${el.type}`);
    }
  });

  console.log(`[DEBUG 7] Fabric object count after sync:`, fabricCanvas.getObjects().length);
  fabricCanvas.requestRenderAll();
}

export default function FabricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const canvasState = useCanvasStore((s) => s.canvas);
  const updateElement = useCanvasStore((s) => s.updateElement);
  const removeElement = useCanvasStore((s) => s.removeElement);
  const commit = useCanvasStore((s) => s.commit);
  
  const isInternalUpdate = useCanvasStore((s) => s.isInternalUpdate);
  const setInternalUpdate = useCanvasStore((s) => s.setInternalUpdate);
  
  const isAnimating = useCanvasStore((s) => s.isAnimating);
  const setAnimating = useCanvasStore((s) => s.setAnimating);

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
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj as any).isEditing) return;
        
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
    
    if (isAnimating) {
      const canvas = fabricCanvasRef.current;
      const startElements = new Map<string, any>();
      
      // Capture start state
      canvas.getObjects().forEach(obj => {
        const id = obj.get("id" as keyof fabric.FabricObject) as string;
        if (id) {
          startElements.set(id, {
            left: obj.left || 0,
            top: obj.top || 0,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            opacity: obj.opacity ?? 1,
          });
        }
      });

      // Render the end state secretly to grab target coordinates
      syncStateToFabric(canvas, canvasState);

      // Now revert all visual props to start state for the animation
      canvas.getObjects().forEach(obj => {
        const id = obj.get("id" as keyof fabric.FabricObject) as string;
        const start = id ? startElements.get(id) : null;
        
        // Save target in a custom property
        obj.set("targetProps", {
          left: obj.left,
          top: obj.top,
          angle: obj.angle,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          opacity: obj.opacity
        });

        if (start) {
          obj.set(start);
        } else {
          // New objects start faded and slightly smaller
          obj.set({ opacity: 0, scaleX: (obj.scaleX || 1) * 0.9, scaleY: (obj.scaleY || 1) * 0.9 });
        }
      });

      canvas.requestRenderAll();

      const duration = 1500; // 1.5s as per spec
      let startTime: number | null = null;
      let frameId: number;

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // easeOutCubic easing
        progress = 1 - Math.pow(1 - progress, 3);
        
        canvas.getObjects().forEach(obj => {
          const id = obj.get("id" as keyof fabric.FabricObject) as string;
          const start = id ? startElements.get(id) : null;
          const target = obj.get("targetProps" as keyof fabric.FabricObject) as any;
          
          if (!target) return;
          
          const startLeft = start ? start.left : target.left;
          const startTop = start ? start.top : target.top;
          const startAngle = start ? start.angle : target.angle;
          const startScaleX = start ? start.scaleX : target.scaleX * 0.9;
          const startScaleY = start ? start.scaleY : target.scaleY * 0.9;
          const startOpacity = start ? start.opacity : 0;
          
          obj.set({
            left: startLeft + (target.left - startLeft) * progress,
            top: startTop + (target.top - startTop) * progress,
            angle: startAngle + (target.angle - startAngle) * progress,
            scaleX: startScaleX + (target.scaleX - startScaleX) * progress,
            scaleY: startScaleY + (target.scaleY - startScaleY) * progress,
            opacity: startOpacity + (target.opacity - startOpacity) * progress,
          });
        });
        
        canvas.requestRenderAll();
        
        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        } else {
          setAnimating(false);
        }
      };
      
      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    }
    
    syncStateToFabric(fabricCanvasRef.current, canvasState);
  }, [canvasState, isInternalUpdate, setInternalUpdate, isAnimating, setAnimating]);

  const exportRequested = useCanvasStore((s) => s.exportRequested);
  
  useEffect(() => {
    if (exportRequested > 0 && fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({ format: "png", quality: 1, multiplier: 2 });
      const link = document.createElement("a");
      link.download = "imagery-export.png";
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [exportRequested]);

  return (
    <div style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
