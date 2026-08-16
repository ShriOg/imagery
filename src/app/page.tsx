import CanvasWorkspace from "@/components/canvas/CanvasWorkspace";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", display: "flex", flexDirection: "column" }}>
      <CanvasWorkspace />
    </div>
  );
}
