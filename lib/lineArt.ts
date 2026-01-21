/**
 * Line Art Conversion Library
 * Converts uploaded images to black & white line art using edge detection
 */

export interface LineArtOptions {
  threshold: number;      // 0-255: edge sensitivity
  blurPasses: number;     // 0-3: noise reduction
  thickness: number;      // 0-2: line dilation passes
  maxDim: number;         // 600-2000: max dimension
}

export const defaultOptions: LineArtOptions = {
  threshold: 50,
  blurPasses: 1,
  thickness: 1,
  maxDim: 1200,
};

/**
 * Load a File as HTMLImageElement
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get image data from canvas context
 */
function getImageData(ctx: CanvasRenderingContext2D, width: number, height: number): ImageData {
  return ctx.getImageData(0, 0, width, height);
}

/**
 * Convert to grayscale
 */
function grayscale(imageData: ImageData): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  return imageData;
}

/**
 * Box blur (single pass)
 */
function boxBlur(imageData: ImageData, width: number, height: number): ImageData {
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += src[((y + dy) * width + (x + dx)) * 4 + c];
          }
        }
        dst[(y * width + x) * 4 + c] = sum / 9;
      }
    }
  }
  return imageData;
}

/**
 * Sobel edge detection
 */
function sobelEdge(imageData: ImageData, width: number, height: number): Float32Array {
  const data = imageData.data;
  const magnitude = new Float32Array(width * height);
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      let k = 0;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const pixel = data[((y + dy) * width + (x + dx)) * 4];
          gx += pixel * sobelX[k];
          gy += pixel * sobelY[k];
          k++;
        }
      }
      
      magnitude[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  
  return magnitude;
}

/**
 * Threshold edges into black lines on white background
 */
function thresholdEdges(
  magnitude: Float32Array,
  width: number,
  height: number,
  threshold: number
): ImageData {
  const output = new ImageData(width, height);
  const data = output.data;
  
  // Normalize magnitude
  let maxMag = 0;
  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] > maxMag) maxMag = magnitude[i];
  }
  
  const normalizedThreshold = (threshold / 255) * maxMag;
  
  for (let i = 0; i < magnitude.length; i++) {
    const isEdge = magnitude[i] > normalizedThreshold;
    const color = isEdge ? 0 : 255; // Black lines on white background
    data[i * 4] = color;
    data[i * 4 + 1] = color;
    data[i * 4 + 2] = color;
    data[i * 4 + 3] = 255;
  }
  
  return output;
}

/**
 * Dilate lines to make them thicker
 */
function dilate(imageData: ImageData, width: number, height: number): ImageData {
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let minVal = 255;
      
      // Check 3x3 neighborhood
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const val = src[((y + dy) * width + (x + dx)) * 4];
          if (val < minVal) minVal = val;
        }
      }
      
      // If any neighbor is black, this pixel becomes black
      const idx = (y * width + x) * 4;
      dst[idx] = minVal;
      dst[idx + 1] = minVal;
      dst[idx + 2] = minVal;
    }
  }
  
  return imageData;
}

/**
 * Convert an image to line art
 */
export async function convertToLineArt(
  img: HTMLImageElement,
  options: LineArtOptions = defaultOptions
): Promise<string> {
  const { threshold, blurPasses, thickness, maxDim } = options;
  
  // Calculate scaled dimensions
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
  }
  
  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  
  // Draw scaled image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Get image data and process
  let imageData = getImageData(ctx, width, height);
  
  // Convert to grayscale
  imageData = grayscale(imageData);
  
  // Apply blur passes
  for (let i = 0; i < blurPasses; i++) {
    imageData = boxBlur(imageData, width, height);
  }
  
  // Sobel edge detection
  const magnitude = sobelEdge(imageData, width, height);
  
  // Threshold to binary
  let output = thresholdEdges(magnitude, width, height, threshold);
  
  // Apply dilation for thickness
  for (let i = 0; i < thickness; i++) {
    output = dilate(output, width, height);
  }
  
  // Put result back on canvas
  ctx.putImageData(output, 0, 0);
  
  return canvas.toDataURL('image/png');
}

/**
 * Convert File directly to line art data URL
 */
export async function fileToLineArt(
  file: File,
  options: LineArtOptions = defaultOptions
): Promise<string> {
  const img = await loadImageFromFile(file);
  return convertToLineArt(img, options);
}
