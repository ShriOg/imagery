"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToolStore } from "@/store/useToolStore";
import { useCanvasStore } from "@/store/useCanvasStore";
import { listProjects, deleteProject, saveProject, getProjectById } from "@/lib/storage/db";
import { CanvasDocument } from "@/types/canvas";

export function ProjectsModal() {
  const isProjectsModalOpen = useToolStore((s) => s.isProjectsModalOpen);
  const setProjectsModalOpen = useToolStore((s) => s.setProjectsModalOpen);
  const currentDoc = useCanvasStore((s) => s.document);
  const loadProject = useCanvasStore((s) => s.loadProject);
  const createNewProject = useCanvasStore((s) => s.createNewProject);

  const [projects, setProjects] = useState<Array<{ id: string; document: CanvasDocument; updatedAt: number }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const list = await listProjects();
      // Ensure current document is represented
      if (currentDoc.id && !list.some(p => p.id === currentDoc.id)) {
        list.unshift({
          id: currentDoc.id,
          document: JSON.parse(JSON.stringify(currentDoc)),
          updatedAt: Date.now(),
        });
      }
      setProjects(list.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isProjectsModalOpen) {
      fetchProjects();
    }
  }, [isProjectsModalOpen]);

  const handleOpenProject = async (doc: CanvasDocument) => {
    loadProject(doc);
    setProjectsModalOpen(false);
  };

  const handleCreateNew = () => {
    createNewProject(`Untitled Project ${projects.length + 1}`);
    setProjectsModalOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === currentDoc.id) {
      if (confirm("This is your active project. Delete and create a new project?")) {
        await deleteProject(id);
        createNewProject();
        fetchProjects();
      }
      return;
    }
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      fetchProjects();
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, doc: CanvasDocument) => {
    e.stopPropagation();
    const cloned: CanvasDocument = {
      ...JSON.parse(JSON.stringify(doc)),
      id: `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${doc.title} (Copy)`,
    };
    await saveProject(cloned);
    fetchProjects();
  };

  const filteredProjects = projects.filter((p) =>
    p.document?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isProjectsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProjectsModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-4xl bg-surface-container-high/95 backdrop-blur-3xl border border-outline-variant/20 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-outline-variant/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-inner">
                  <span className="material-symbols-outlined text-[22px]">folder_open</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-lg text-on-surface font-semibold">
                    Projects & Workspace
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    All designs are automatically saved locally in your IndexedDB database.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-semibold text-xs rounded-full shadow-lg shadow-primary/20 hover:bg-primary-fixed transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>New Project</span>
                </motion.button>
                <button
                  onClick={() => setProjectsModalOpen(false)}
                  className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-7 py-3 border-b border-outline-variant/10 bg-surface-container/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none"
              />
              <span className="text-[11px] font-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded">
                {filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"}
              </span>
            </div>

            {/* Projects Grid */}
            <div className="flex-1 overflow-y-auto p-7">
              {isLoading ? (
                <div className="flex items-center justify-center py-20 text-on-surface-variant gap-3">
                  <span className="material-symbols-outlined animate-spin text-[24px] text-primary">progress_activity</span>
                  <span className="text-sm">Loading projects from database...</span>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[28px]">drive_file_rename_outline</span>
                  </div>
                  <span className="font-semibold text-on-surface text-sm">No projects found</span>
                  <p className="text-xs text-on-surface-variant max-w-xs">
                    Start a fresh canvas design and it will be preserved in your local database automatically.
                  </p>
                  <button
                    onClick={handleCreateNew}
                    className="mt-2 px-4 py-2 bg-primary text-on-primary font-semibold text-xs rounded-full cursor-pointer hover:bg-primary-fixed transition-all"
                  >
                    Create Canvas Design
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {filteredProjects.map((p) => {
                    const isCurrent = p.id === currentDoc.id;
                    const doc = p.document;
                    const elCount = doc?.elements?.length || 0;

                    return (
                      <motion.div
                        key={p.id}
                        whileHover={{ y: -4 }}
                        onClick={() => handleOpenProject(doc)}
                        className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3.5 ${
                          isCurrent
                            ? "bg-surface-variant/80 border-primary/50 shadow-[0_0_25px_rgba(251,188,0,0.15)] ring-1 ring-primary/30"
                            : "bg-surface-container/60 hover:bg-surface-container border-outline-variant/15 hover:border-outline-variant/35 shadow-lg"
                        }`}
                      >
                        {/* Aspect Ratio Canvas Thumbnail Preview */}
                        <div
                          className="w-full aspect-video rounded-xl overflow-hidden relative flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-[1.02]"
                          style={{ backgroundColor: doc?.backgroundColor || "#131313" }}
                        >
                          {/* Elements Preview Dot Indicator */}
                          <div className="flex flex-col items-center gap-1 opacity-70">
                            <span className="material-symbols-outlined text-[28px] text-primary">
                              {elCount > 0 ? "dashboard" : "crop_free"}
                            </span>
                            <span className="text-[10px] font-mono text-on-surface-variant">
                              {doc.width} × {doc.height}
                            </span>
                          </div>

                          {/* Active Tag */}
                          {isCurrent && (
                            <span className="absolute top-2.5 right-2.5 text-[9px] font-bold font-mono bg-primary text-on-primary px-2 py-0.5 rounded-full shadow-md">
                              ACTIVE
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col truncate pr-2">
                            <span className="font-semibold text-xs sm:text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                              {doc.title || "Untitled Design"}
                            </span>
                            <span className="text-[10px] text-on-surface-variant">
                              {elCount} {elCount === 1 ? "layer" : "layers"} • {formatTime(p.updatedAt)}
                            </span>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDuplicate(e, doc)}
                              title="Duplicate Project"
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, p.id)}
                              title="Delete Project"
                              className="p-1.5 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-outline-variant/10 bg-surface-container/60 flex items-center justify-between text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">cloud_done</span>
                <span>Auto-saved to Persistent IndexedDB Storage</span>
              </span>
              <span className="font-mono text-[10px] opacity-75">Imagery Studio v2.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
