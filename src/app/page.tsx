import CanvasWorkspace from "@/components/canvas/CanvasWorkspace";
import TopBar from "@/components/ui/TopBar";
import LeftRail from "@/components/ui/LeftRail";
import AIPanel from "@/components/ai-panel/AIPanel";

export default function Home() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <TopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <LeftRail />
        <CanvasWorkspace />
        <AIPanel />
      </div>
    </div>
  );
}
