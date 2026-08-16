# 🎨 Imagery

> **A simple, modern image editor built for everyday creativity.**

Imagery is a browser-based image editor built around one idea:

**Powerful editing doesn't have to feel complicated.**

We focused on creating an editor that is clean, approachable, and packed with the tools you actually need — without making the interface look like a spaceship cockpit. 🚀

---

## ✦ Why Imagery?

Image editors can be incredibly powerful, but that power often comes with complexity.

**Imagery takes a different approach:** keep the interface clean, make the controls intuitive, and let users start creating without having to learn the entire application first.

### What You Can Do

- 🎯 **Select & Pan** — Navigate and work with your canvas effortlessly.
- ✍️ **Text Editing** — Customize fonts, colors, size, opacity, orientation, and positioning.
- 🧩 **Objects & Elements** — Add and arrange different visual elements.
- 🖼️ **Stock Images** — Bring images directly into your designs.
- 📚 **Layer Management** — Organize, rearrange, and control your elements.
- ✨ **AI Assistant** — Describe what you want in natural language and let AI assist your workflow.
- ⚡ **Contextual Controls** — Access the tools you need without digging through endless menus.

---

## 🎨 What Makes Imagery Different?

### 1. Simple by Design

We didn't try to build an editor with the **most buttons**.

We tried to build one with the **right buttons**.

The interface stays minimal and focused, making everyday editing quick and approachable.

### 2. Made to Be Understood

Everything is designed around a straightforward workflow:

**Open → Create → Edit → Export**

No complicated learning curve.  
No hunting through five different menus just to change a font.

### 3. AI-Assisted Creativity

Imagery introduces an AI-powered workflow where users can describe changes using natural language, making editing feel more conversational and accessible.

---

## 🛠️ Built With

| Technology | Purpose |
|---|---|
| **Next.js** | Application framework |
| **React** | UI and component architecture |
| **TypeScript** | Type-safe development |
| **Fabric.js** | Interactive canvas editing |
| **Tailwind CSS** | Styling and responsive UI |
| **Framer Motion** | Animations and interactions |
| **Zustand** | Application state management |
| **Radix UI** | Accessible UI primitives |
| **Lucide React** | Interface icons |

---

## 🧩 Project Structure

```text
src/
├── app/
│   ├── api/
│   │   └── ai/              # AI editing endpoints
│   ├── editor/              # Editor route
│   └── page.tsx             # Landing page
│
├── components/
│   ├── ai-panel/            # AI Assistant
│   ├── canvas/              # Canvas & editing workspace
│   └── modals/              # Menus, palettes & dialogs
│
└── lib/                     # Shared logic & application state