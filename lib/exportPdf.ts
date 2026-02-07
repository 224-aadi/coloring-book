/**
 * PDF Export Library
 * Merges line art and coloring layers into a downloadable PDF
 */

import { PDFDocument } from 'pdf-lib';

export interface ExportOptions {
  filename?: string;
}

/**
 * Load an image as HTMLImageElement from a URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Load SVG with transparent background (removes white rect backgrounds)
 */
async function loadSvgWithTransparentBg(src: string): Promise<HTMLImageElement> {
  // If it's not an SVG file path, handle differently
  if (!src.endsWith('.svg')) {
    return loadImage(src);
  }
  
  try {
    // Fetch the SVG content
    const response = await fetch(src);
    let svgText = await response.text();
    
    // Remove white background rects (common pattern in line art SVGs)
    svgText = svgText.replace(/<rect[^>]*fill=["']white["'][^>]*\/>/gi, '');
    svgText = svgText.replace(/<rect[^>]*fill=["']#fff(fff)?["'][^>]*\/>/gi, '');
    svgText = svgText.replace(/<rect[^>]*fill=["']#ffffff["'][^>]*\/>/gi, '');
    
    // Create a data URL from the modified SVG
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const img = await loadImage(url);
    URL.revokeObjectURL(url);
    
    return img;
  } catch {
    return loadImage(src);
  }
}

/**
 * Convert a canvas to PNG bytes
 */
function canvasToBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // Create a new canvas with white background
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const ctx = outputCanvas.getContext('2d')!;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the user's drawing
    ctx.drawImage(canvas, 0, 0);
    
    outputCanvas.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuffer));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Make white pixels transparent in an image (for converted line art)
 */
function makeWhiteTransparent(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Make white/near-white pixels transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // If pixel is white or near-white, make it transparent
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // Set alpha to 0
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Merge line art and drawing canvas into a single image
 */
async function mergeCanvases(
  lineArtSrc: string,
  drawingCanvas: HTMLCanvasElement
): Promise<Uint8Array> {
  // Load the line art image
  let lineArtImg: HTMLImageElement;
  let lineArtCanvas: HTMLCanvasElement | null = null;
  
  if (lineArtSrc.endsWith('.svg')) {
    // SVG files - remove white background rects
    lineArtImg = await loadSvgWithTransparentBg(lineArtSrc);
  } else {
    // Converted images (data URLs) - make white pixels transparent
    lineArtImg = await loadImage(lineArtSrc);
    lineArtCanvas = makeWhiteTransparent(lineArtImg);
  }
  
  // Get native dimensions from line art
  const width = lineArtImg.naturalWidth;
  const height = lineArtImg.naturalHeight;
  
  // Create offscreen canvas at line art's native resolution
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d')!;
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // Draw the user's coloring first (scaled to match line art dimensions)
  ctx.drawImage(drawingCanvas, 0, 0, width, height);
  
  // Draw line art on top (with transparent background) so outlines are visible
  if (lineArtCanvas) {
    ctx.drawImage(lineArtCanvas, 0, 0, width, height);
  } else {
    ctx.drawImage(lineArtImg, 0, 0, width, height);
  }
  
  // Convert to PNG blob
  return new Promise((resolve, reject) => {
    offscreen.toBlob(
      async (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        const arrayBuffer = await blob.arrayBuffer();
        resolve(new Uint8Array(arrayBuffer));
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Export the coloring page as a PDF
 */
export async function exportToPdf(
  lineArtSrc: string | null,
  drawingCanvas: HTMLCanvasElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = 'coloring-page.pdf' } = options;
  
  try {
    // Get image bytes - either merged with line art or just the drawing
    let imageBytes: Uint8Array;
    
    if (lineArtSrc) {
      // Merge canvases with line art
      imageBytes = await mergeCanvases(lineArtSrc, drawingCanvas);
    } else {
      // Blank canvas - just export the drawing
      imageBytes = await canvasToBytes(drawingCanvas);
    }
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed the PNG image
    const pngImage = await pdfDoc.embedPng(imageBytes);
    
    // Get image dimensions
    const { width, height } = pngImage.size();
    
    // Create a page matching the image dimensions
    // Use standard PDF points (72 points = 1 inch)
    // Scale to fit on a reasonable page size while maintaining aspect ratio
    const maxPageWidth = 612;  // Letter width in points (8.5 inches)
    const maxPageHeight = 792; // Letter height in points (11 inches)
    
    let pageWidth = width;
    let pageHeight = height;
    
    // Scale down if image is too large
    if (pageWidth > maxPageWidth || pageHeight > maxPageHeight) {
      const scale = Math.min(maxPageWidth / pageWidth, maxPageHeight / pageHeight);
      pageWidth *= scale;
      pageHeight *= scale;
    }
    
    // Add a page with the calculated dimensions
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw the image centered on the page
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
    
    // Serialize the PDF
    const pdfBytes = await pdfDoc.save();
    
    // Create download link - convert to ArrayBuffer for Blob compatibility
    const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}
