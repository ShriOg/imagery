"use client";

import React, { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCanvasStore } from "@/store/useCanvasStore";

export default function LandingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateDocumentProps = useCanvasStore((s) => s.updateDocumentProps);
  const addElement = useCanvasStore((s) => s.addElement);
  const setDocument = useCanvasStore((s) => s.setDocument);

  const loadAndInsertImage = useCallback((src: string, title: string = "Image") => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const nativeW = img.naturalWidth || img.width || 1200;
      const nativeH = img.naturalHeight || img.height || 800;
      const aspect = nativeW / nativeH;

      const docW = 1920;
      const docH = 1080;

      const maxW = docW * 0.8;
      const maxH = docH * 0.8;

      let targetW = nativeW;
      let targetH = nativeH;

      if (targetW > maxW || targetH > maxH) {
        const scale = Math.min(maxW / nativeW, maxH / nativeH);
        targetW = Math.round(nativeW * scale);
        targetH = Math.round(nativeH * scale);
      }

      setDocument({
        id: `doc_${Date.now()}`,
        title: title,
        width: docW,
        height: docH,
        backgroundColor: "#131313",
        elements: [
          {
            id: `el_img_${Date.now()}`,
            name: title,
            type: "image",
            src,
            x: Math.round(docW / 2),
            y: Math.round(docH / 2),
            width: targetW,
            height: targetH,
            aspectRatio: aspect,
            rotation: 0,
            opacity: 1,
            zIndex: 1,
            locked: false,
            visible: true,
            flipX: false,
            flipY: false,
          },
        ],
      });

      router.push("/editor");
    };
  }, [router, setDocument]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === "string") {
            loadAndInsertImage(event.target.result, file.name.replace(/\.[^/.]+$/, ""));
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [loadAndInsertImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove("scale-[1.02]", "bg-surface-container-high/80");

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === "string") {
            loadAndInsertImage(event.target.result, file.name.replace(/\.[^/.]+$/, ""));
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [loadAndInsertImage]
  );

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const highlight = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("scale-[1.02]", "bg-surface-container-high/80");
  };

  const unhighlight = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("scale-[1.02]", "bg-surface-container-high/80");
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface-container/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
        <div className="h-20 w-full px-container-padding flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              alt="Imagery Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf9sJfkcZ6Hh5pMoK0637r0eaUSLpmVwRqf9u8UPJXTcSA34CuN56IEbHKjI98hn1CRX2eMZi-LVV_15YAPK5B7kNcMDSGVAxl-Y9TH7oWI0U0-LFaIfbke9RWCyFQp4X6UsqRRbBSvs7lFWv-rjZHJ2mguAVnH5dtBM2z2vIOX-o9cm49oYBzMDCGKVWuSoBcDnlFpCdernsXLnpqAQHExW_cTymRysWSuh_PaC5c3n67HhH5LIL9"
            />
            <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Imagery
            </span>
          </div>
          <nav className="flex items-center gap-8">
            <a
              aria-current="page"
              className="transition-colors bg-primary-container text-on-primary-container font-bold px-4 py-2 rounded-full"
              href="#"
            >
              Home
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => router.push("/editor")}
              style={{ cursor: "pointer" }}
            >
              Studio
            </a>
            <a
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
              href="#"
            >
              Projects
            </a>
            <div className="flex items-center gap-3 pl-4 ml-4 border-l border-outline-variant">
              <img
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-fixed-dim/20"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_d_iY_ZcmsZaivAKpm_unHS0JFH0vHQuZpWn8MKQbJtdx6ruoy8vM2W0X8eUrgHC4UE2tTAIafaiuGDzmZxSGVv99e6reXIUYvZGfFflaLm-tKYym8zlHQgqY5CkLntetpIFVOW8ajuS0bkN0TkJabvSoB6JiAhdt3zZLtjMI_9cQayibnIxZ3RSvcohBdAGFN-GmdMsLyfUtJZTn-W7vJiqIKTwaS-jOhfoKiIzXbkMXtSusa5Ah"
              />
            </div>
          </nav>
        </div>
      </header>
      
      <main className="w-full pt-20">
        <div className="flex flex-col w-full items-center justify-center min-h-[calc(100vh-5rem)] py-16 px-container-padding relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background:
                "radial-gradient(circle at 50% -20%, var(--colors-primary-container) 0%, transparent 50%)",
            }}
          ></div>
          <div className="z-10 flex flex-col items-center text-center max-w-3xl w-full">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-6 tracking-tight">
              Create beautifully.
            </h1>
            <p className="font-headline-sm text-headline-sm text-on-surface-variant mb-12">
              Drop an image to enter the studio.
            </p>
            <div
              className="relative w-full max-w-2xl bg-surface-container/60 backdrop-blur-3xl rounded-[3rem] p-12 transition-all duration-500 hover:bg-surface-container/80 hover:shadow-2xl hover:shadow-primary/5 group cursor-pointer border border-on-surface/5 overflow-hidden select-none"
              id="upload-zone"
              onDragEnter={highlight}
              onDragOver={highlight}
              onDragLeave={unhighlight}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 shadow-lg shadow-black/20">
                  <span className="material-symbols-outlined text-[48px] text-primary">
                    cloud_upload
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-headline-md text-headline-md text-on-surface mb-2">
                    Drag and drop or click to upload
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant text-center max-w-sm">
                    JPG, PNG, WebP or SVG.<br />
                    Maximum file size 50MB.
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-8 px-8 py-4 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary-fixed transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    folder_open
                  </span>
                  Browse Files
                </button>
              </div>
            </div>
            
            <div className="mt-20 w-full max-w-4xl flex flex-col items-center">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-8 flex items-center gap-4">
                <span className="h-px w-12 bg-outline-variant/50"></span>
                Or try a sample
                <span className="h-px w-12 bg-outline-variant/50"></span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                <button
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-black/40 cursor-pointer"
                  onClick={() =>
                    loadAndInsertImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBM5Zc18e1fsG9lH20q-hdEkdfJnuLVd7Si5hDlAgiAO5y4WuHhZT5WoP9ZFOf8V4Qzog_lSkJTHmnLuCPkBokCfZza3capD_v_ivfMK-KqVawQl4kNpLc9zotalvJXIhtHa7okcKDaGe5UkiuNu6G6MxsRIH8LikwXFVgSXhbF4m9q_6PrmE_goX641sKN9XZxbiIplL6rhVUCJa8ynvlMP-d7Y38-oC0ZUnb1SnbDGk1s__WpcaBR",
                      "Portrait"
                    )
                  }
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
                    alt="Sample 1"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM5Zc18e1fsG9lH20q-hdEkdfJnuLVd7Si5hDlAgiAO5y4WuHhZT5WoP9ZFOf8V4Qzog_lSkJTHmnLuCPkBokCfZza3capD_v_ivfMK-KqVawQl4kNpLc9zotalvJXIhtHa7okcKDaGe5UkiuNu6G6MxsRIH8LikwXFVgSXhbF4m9q_6PrmE_goX641sKN9XZxbiIplL6rhVUCJa8ynvlMP-d7Y38-oC0ZUnb1SnbDGk1s__WpcaBR"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="font-label-md text-label-md text-on-surface">
                      Portrait
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      arrow_forward
                    </span>
                  </div>
                </button>
                <button
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-black/40 cursor-pointer"
                  onClick={() =>
                    loadAndInsertImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDy1ZXGCY-ZBuEuZ-l0AAnNT6Xzgp6PcL1Uib--8AvZuvz9H70g3ZdBZBZcWjiLf7qzO6zZHrQPCwveBJbqpkZ8WGlu5qS6a6hk3S5Sl03TH89gAqkfvpNo0dd7go72X-V3ZP4oSKCcHSN2zW9eKFJWD1rs3p_QNC49pqcw4ir691e77K3oDw9ZmuI4f3DEUwsjYDPhFHpIEItXb6sY-nwaqAc_y8cab8XI-lVulps2BpHeeQmpJNpM",
                      "Architecture"
                    )
                  }
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
                    alt="Sample 2"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy1ZXGCY-ZBuEuZ-l0AAnNT6Xzgp6PcL1Uib--8AvZuvz9H70g3ZdBZBZcWjiLf7qzO6zZHrQPCwveBJbqpkZ8WGlu5qS6a6hk3S5Sl03TH89gAqkfvpNo0dd7go72X-V3ZP4oSKCcHSN2zW9eKFJWD1rs3p_QNC49pqcw4ir691e77K3oDw9ZmuI4f3DEUwsjYDPhFHpIEItXb6sY-nwaqAc_y8cab8XI-lVulps2BpHeeQmpJNpM"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="font-label-md text-label-md text-on-surface">
                      Architecture
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      arrow_forward
                    </span>
                  </div>
                </button>
                <button
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-black/40 cursor-pointer"
                  onClick={() =>
                    loadAndInsertImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDNupsVRmDAyI5f6VfZL0qTmG5LY1wWkifD7owTzHXy8mSNF_gElJR3hpPkAwazMLcytUGXz0IKcKiUIXJ00J3QepcPW6JhtD5OgpfQw05yH1a9mWwL3cjq03iUKSUY4fHnZz4NnhK-LZHo-1gEeKi9yLOZLDPHfF2eZUDGK6HeBIbUGMBkWXNoi8AgGcFMdj7nanRIXsKukz5OhC81K-H8t8XScBWz_6Jkq1K_45zJitFLUS27-ESR",
                      "Nature"
                    )
                  }
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
                    alt="Sample 3"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNupsVRmDAyI5f6VfZL0qTmG5LY1wWkifD7owTzHXy8mSNF_gElJR3hpPkAwazMLcytUGXz0IKcKiUIXJ00J3QepcPW6JhtD5OgpfQw05yH1a9mWwL3cjq03iUKSUY4fHnZz4NnhK-LZHo-1gEeKi9yLOZLDPHfF2eZUDGK6HeBIbUGMBkWXNoi8AgGcFMdj7nanRIXsKukz5OhC81K-H8t8XScBWz_6Jkq1K_45zJitFLUS27-ESR"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="font-label-md text-label-md text-on-surface">
                      Nature
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      arrow_forward
                    </span>
                  </div>
                </button>
                <button
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-black/40 cursor-pointer"
                  onClick={() =>
                    loadAndInsertImage(
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqHzq97WpLRdlK1c63YnPCa9A9PzsemWzonJL-N5p6txqaMCV6WQsiRgyJgrqUxeY7CyEr0BWp43Ur-mvJkpbsXSQ-p8FkcLvym54g0aZIC2lzkjPe7r_31oaaJ_3v9SgS2OgmUMe7p_NKKV6XOqKqWKnldvTPdy-X83mY4pTN1JElIHJ6y_o4JJUdFKW29uDh456cFGsx5U43Vybl-1e_FcmDyBKechy1TfjbWPeDXnJ-UEopGBxn",
                      "Abstract"
                    )
                  }
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
                    alt="Sample 4"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqHzq97WpLRdlK1c63YnPCa9A9PzsemWzonJL-N5p6txqaMCV6WQsiRgyJgrqUxeY7CyEr0BWp43Ur-mvJkpbsXSQ-p8FkcLvym54g0aZIC2lzkjPe7r_31oaaJ_3v9SgS2OgmUMe7p_NKKV6XOqKqWKnldvTPdy-X83mY4pTN1JElIHJ6y_o4JJUdFKW29uDh456cFGsx5U43Vybl-1e_FcmDyBKechy1TfjbWPeDXnJ-UEopGBxn"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="font-label-md text-label-md text-on-surface">
                      Abstract
                    </span>
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      arrow_forward
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest py-16 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-container-padding flex flex-col md:flex-row justify-between items-center gap-8 text-on-surface-variant">
          <div className="flex items-center gap-3">
            <img
              alt="Logo"
              className="h-6 opacity-50 grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf9sJfkcZ6Hh5pMoK0637r0eaUSLpmVwRqf9u8UPJXTcSA34CuN56IEbHKjI98hn1CRX2eMZi-LVV_15YAPK5B7kNcMDSGVAxl-Y9TH7oWI0U0-LFaIfbke9RWCyFQp4X6UsqRRbBSvs7lFWv-rjZHJ2mguAVnH5dtBM2z2vIOX-o9cm49oYBzMDCGKVWuSoBcDnlFpCdernsXLnpqAQHExW_cTymRysWSuh_PaC5c3n67HhH5LIL9"
            />
            <span className="font-label-md text-label-md uppercase tracking-widest opacity-60">
              Imagery
            </span>
          </div>
          <p className="font-body-md text-body-md">
            Created for high-performance visionaries.
          </p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer">
              share
            </span>
            <span className="material-symbols-outlined opacity-40 hover:opacity-100 cursor-pointer">
              settings
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
