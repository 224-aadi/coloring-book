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
 * Merge line art and drawing canvas into a single image
 */
async function mergeCanvases(
  lineArtSrc: string,
  drawingCanvas: HTMLCanvasElement
): Promise<Uint8Array> {
  // Load the line art image
  const lineArtImg = await loadImage(lineArtSrc);
  
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
  
  // Draw line art on top so outlines are visible
  ctx.drawImage(lineArtImg, 0, 0, width, height);
  
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
  lineArtSrc: string,
  drawingCanvas: HTMLCanvasElement,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = 'coloring-page.pdf' } = options;
  
  try {
    // Merge canvases into a single image
    const imageBytes = await mergeCanvases(lineArtSrc, drawingCanvas);
    
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
