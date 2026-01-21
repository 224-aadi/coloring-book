# 🎨 Color Your World - Digital Coloring Book

A beautiful digital coloring book web app built with Next.js 15 and TypeScript. Choose from sample pages or upload your own photos to transform into line art coloring pages!

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- **Gallery of Sample Pages** - 6 beautiful line art designs to color
- **Upload & Convert** - Transform any photo into line art with adjustable settings
- **Intuitive Drawing Tools** - Color picker, brush size, draw/erase modes
- **Pressure Sensitivity** - Support for pressure-sensitive styluses
- **Mobile Friendly** - Works on desktop, tablet, and mobile devices
- **PDF Export** - Download your artwork as a high-quality PDF
- **No Backend Required** - Everything runs client-side

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/aadigupta/coloring-book.git
cd coloring-book

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 🌐 Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aadigupta/coloring-book)

Or deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📁 Project Structure

```
coloring-book/
├── app/
│   ├── page.tsx              # Gallery home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── color/
│       └── [id]/
│           └── page.tsx      # Editor page (dynamic route)
├── components/
│   └── ColoringEditor.tsx    # Main editor component
├── lib/
│   ├── lineArt.ts            # Photo to line art conversion
│   └── exportPdf.ts          # PDF export functionality
├── public/
│   └── lineart/              # Sample coloring pages (SVG)
│       ├── butterfly.svg
│       ├── flower.svg
│       ├── house.svg
│       ├── fish.svg
│       ├── star.svg
│       └── unicorn.svg
└── README.md
```

## 🎮 How to Use

### Coloring
1. Choose a page from the gallery or go to any `/color/[id]` route
2. Select a color from the palette or use the custom color picker
3. Adjust brush size with the slider (2-40px)
4. Draw on the canvas - your strokes appear on top of the line art
5. Use the eraser to fix mistakes
6. Click "Clear Canvas" to start over

### Upload & Convert
1. In the editor, click "Choose File" to upload a photo
2. Adjust conversion settings:
   - **Threshold** (0-255): Controls edge sensitivity
   - **Blur Passes** (0-3): Reduces noise before edge detection
   - **Line Thickness** (0-2): Makes lines thicker/bolder
   - **Max Size** (600-2000): Maximum dimension in pixels
3. Click "Convert to Line Art" to transform your photo

### Export
- Click "Export PDF" to download your colored artwork
- The PDF includes both your coloring and the line art

## ⚙️ Technical Details

### Line Art Conversion Algorithm
1. Load image and scale to max dimensions
2. Convert to grayscale
3. Apply box blur for noise reduction
4. Sobel edge detection for finding edges
5. Threshold to binary (black lines on white)
6. Optional dilation for thicker lines

### Drawing Implementation
- Uses Pointer Events for unified mouse/touch/pen support
- Canvas overlay separate from background image
- Pressure sensitivity when available
- `touch-action: none` prevents scroll interference

### PDF Export
- Uses [pdf-lib](https://pdf-lib.js.org/) for client-side PDF generation
- Merges coloring layer with line art at native resolution
- Scales to fit standard letter size (8.5" x 11")

## 🔧 Dependencies

| Package | Purpose |
|---------|---------|
| next | React framework with App Router |
| react, react-dom | UI library |
| typescript | Type safety |
| tailwindcss | Utility-first CSS |
| pdf-lib | Client-side PDF generation |

## ⚠️ Known Limitations

1. **Local images only** - Cross-origin images will taint the canvas, preventing export. Use only local sample pages or uploaded files.

2. **Memory on mobile** - Very large images may cause memory issues on older mobile devices. The max dimension setting helps mitigate this.

3. **SVG backgrounds** - Line art is stored as SVG for smaller file size. Some very complex SVGs may render differently across browsers.

4. **No undo/redo** - Currently only "Clear Canvas" is available. Drawing history is not implemented.

5. **No save state** - Leaving the page loses your work. Export to PDF to save.

6. **Pressure sensitivity** - Only works with devices/browsers that support Pointer Events pressure.

## 🛠️ Customization

### Adding More Sample Pages

1. Add your SVG/PNG to `public/lineart/`
2. Update the `coloringPages` array in:
   - `app/page.tsx` (gallery)
   - `app/color/[id]/page.tsx` (editor)

### Changing the Color Palette

Edit the `colorPalette` array in `components/ColoringEditor.tsx`.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ and creativity
