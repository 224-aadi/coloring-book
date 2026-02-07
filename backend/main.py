"""
High-Quality Line Art Conversion API
Uses OpenCV for professional-grade image to line art conversion
"""

import io
import base64
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import numpy as np

app = FastAPI(title="Line Art Converter API")

# CORS - allow your frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",  # Your Vercel deployments
        "*",  # Remove in production, replace with your actual domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConversionRequest(BaseModel):
    """Request body for line art conversion"""
    image: str  # Base64 encoded image
    threshold: int = 50  # 0-255: affects line sensitivity
    blur_passes: int = 1  # 0-3: smoothing strength
    thickness: int = 1  # 0-2: line thickness
    max_dim: int = 1200  # Max dimension


class ConversionResponse(BaseModel):
    """Response with converted line art"""
    image: str  # Base64 encoded PNG
    width: int
    height: int


def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode base64 image to OpenCV format"""
    # Remove data URL prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    image_bytes = base64.b64decode(base64_string)
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Failed to decode image")
    
    return image


def encode_image_base64(image: np.ndarray) -> str:
    """Encode OpenCV image to base64 PNG"""
    _, buffer = cv2.imencode('.png', image)
    return base64.b64encode(buffer).decode('utf-8')


def convert_to_lineart(
    image: np.ndarray,
    threshold: int = 50,
    blur_passes: int = 1,
    thickness: int = 1,
    max_dim: int = 1200
) -> np.ndarray:
    """
    Convert image to high-quality line art using OpenCV
    
    Pipeline:
    1. Resize to max dimension
    2. Convert to grayscale
    3. Bilateral filter (edge-preserving smoothing)
    4. Adaptive thresholding
    5. Morphological operations (clean up)
    """
    height, width = image.shape[:2]
    
    # Step 1: Resize if needed
    if width > max_dim or height > max_dim:
        scale = max_dim / max(width, height)
        new_width = int(width * scale)
        new_height = int(height * scale)
        image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    # Step 2: Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Step 3: Bilateral filter for edge-preserving smoothing
    # This removes noise while keeping edges sharp
    if blur_passes > 0:
        sigma_color = 50 + blur_passes * 25
        sigma_space = 50 + blur_passes * 25
        # Apply bilateral filter multiple times for stronger effect
        for _ in range(blur_passes):
            gray = cv2.bilateralFilter(gray, 9, sigma_color, sigma_space)
    
    # Step 4: Adaptive thresholding
    # This creates clean black lines on white background
    # Map threshold parameter to block_size and C constant
    block_size = max(11, min(31, 25 - threshold // 20))
    if block_size % 2 == 0:
        block_size += 1  # Must be odd
    
    c_constant = max(2, min(15, threshold // 20))
    
    binary = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        block_size,
        c_constant
    )
    
    # Step 5: Morphological operations to clean up
    kernel_size = max(2, thickness + 1)
    kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT, 
        (kernel_size, kernel_size)
    )
    
    # Opening removes small white noise
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    
    # Closing fills small gaps in lines
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)
    
    # Optional: Additional edge enhancement for thin lines
    if thickness == 0:
        # Use Canny edge detection for very thin lines
        edges = cv2.Canny(gray, 50, 150)
        edges = cv2.bitwise_not(edges)
        # Combine with adaptive threshold result
        cleaned = cv2.bitwise_and(cleaned, edges)
    
    return cleaned


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "line-art-converter"}


@app.get("/health")
async def health():
    """Health check for Railway/monitoring"""
    return {"status": "healthy"}


@app.post("/convert", response_model=ConversionResponse)
async def convert_image(request: ConversionRequest):
    """
    Convert an image to line art
    
    - **image**: Base64 encoded image (JPEG, PNG, etc.)
    - **threshold**: 0-255, controls line sensitivity (default: 50)
    - **blur_passes**: 0-3, smoothing strength (default: 1)
    - **thickness**: 0-2, line thickness (default: 1)
    - **max_dim**: Maximum dimension in pixels (default: 1200)
    """
    try:
        # Decode input image
        image = decode_base64_image(request.image)
        
        # Convert to line art
        result = convert_to_lineart(
            image,
            threshold=request.threshold,
            blur_passes=request.blur_passes,
            thickness=request.thickness,
            max_dim=request.max_dim
        )
        
        # Encode result
        result_base64 = encode_image_base64(result)
        height, width = result.shape[:2]
        
        return ConversionResponse(
            image=f"data:image/png;base64,{result_base64}",
            width=width,
            height=height
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
