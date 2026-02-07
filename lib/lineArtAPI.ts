/**
 * Line Art API Client
 * Calls the Python OpenCV backend for high-quality conversion
 */

import { LineArtOptions } from './lineArt';

// API URL - set via environment variable or default to localhost
const API_URL = process.env.NEXT_PUBLIC_LINEART_API_URL || 'http://localhost:8000';

interface ConversionResponse {
  image: string;  // Base64 data URL
  width: number;
  height: number;
}

/**
 * Convert a file to base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Check if the API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Convert image to line art using the Python OpenCV API
 */
export async function convertWithAPI(
  file: File,
  options: LineArtOptions
): Promise<string> {
  // Convert file to base64
  const base64Image = await fileToBase64(file);
  
  // Call the API
  const response = await fetch(`${API_URL}/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      threshold: options.threshold,
      blur_passes: options.blurPasses,
      thickness: options.thickness,
      max_dim: options.maxDim,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }
  
  const result: ConversionResponse = await response.json();
  return result.image;
}
