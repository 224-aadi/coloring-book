'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fileToLineArt, defaultOptions, type LineArtOptions } from '@/lib/lineArt';
import { convertWithAPI, checkAPIHealth } from '@/lib/lineArtAPI';
import { exportToPdf } from '@/lib/exportPdf';

interface ColoringEditorProps {
  initialImage: string | null;
  title: string;
}

export default function ColoringEditor({ initialImage, title }: ColoringEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState(12);
  const [isEraser, setIsEraser] = useState(false);
  const [lineArtSrc, setLineArtSrc] = useState<string | null>(initialImage);
  const isBlankCanvas = !lineArtSrc;
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionOptions, setConversionOptions] = useState<LineArtOptions>(defaultOptions);
  
  // Quality mode state
  const [qualityMode, setQualityMode] = useState<'quick' | 'hq'>('quick');
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  
  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  // Store drawing data to persist across resizes
  const drawingDataRef = useRef<ImageData | null>(null);
  
  // Last position for smooth drawing
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Color palette
  const colorPalette = [
    '#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd',
    '#ff9ff3', '#54a0ff', '#00d2d3', '#ff9f43', '#10ac84',
    '#ee5253', '#222f3e', '#c8d6e5', '#8395a7', '#576574',
  ];

  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Save current drawing
    if (canvasRef.current.width > 0 && canvasRef.current.height > 0) {
      drawingDataRef.current = ctx.getImageData(
        0, 0, canvasRef.current.width, canvasRef.current.height
      );
    }
    
    const containerWidth = containerRef.current.clientWidth;
    const maxWidth = Math.min(containerWidth, 900);
    const aspectRatio = canvasSize.height / canvasSize.width;
    const newHeight = maxWidth * aspectRatio;
    
    setCanvasSize({ width: maxWidth, height: newHeight });
  }, [canvasSize.height, canvasSize.width]);

  // Load image dimensions (or set default for blank canvas)
  useEffect(() => {
    if (!lineArtSrc) {
      // Blank canvas - use default dimensions
      setCanvasSize({ width: 800, height: 600 });
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      const maxDim = 900;
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }
      
      setCanvasSize({ width, height });
    };
    img.src = lineArtSrc;
  }, [lineArtSrc]);

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Restore drawing if available
    if (drawingDataRef.current) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = drawingDataRef.current.width;
      tempCanvas.height = drawingDataRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(drawingDataRef.current, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0, canvasSize.width, canvasSize.height);
      }
    }
    
    // Prevent touch scrolling on canvas
    canvas.style.touchAction = 'none';
  }, [canvasSize]);

  // Setup resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Get canvas coordinates from pointer event
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Draw line between two points
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    pressure: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color;
    ctx.lineWidth = brushSize * pressure;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.stroke();
  };

  // Pointer handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    lastPosRef.current = coords;
    
    // Draw a dot for single clicks
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const pressure = e.pressure > 0 ? e.pressure : 1;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, (brushSize * pressure) / 2, 0, Math.PI * 2);
      ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : color;
      
      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPosRef.current) return;
    
    const coords = getCanvasCoords(e);
    const pressure = e.pressure > 0 ? e.pressure : 1;
    
    drawLine(ctx, lastPosRef.current, coords, pressure);
    lastPosRef.current = coords;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      e.preventDefault();
      setIsDrawing(false);
      lastPosRef.current = null;
    }
  };

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawingDataRef.current = null;
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Check if HQ API is available on mount
  useEffect(() => {
    checkAPIHealth().then(setApiAvailable);
  }, []);

  // Convert uploaded image to line art
  const handleConvert = async () => {
    if (!selectedFile) return;
    
    setIsConverting(true);
    try {
      let dataUrl: string;
      
      if (qualityMode === 'hq' && apiAvailable) {
        // Use Python OpenCV API for high quality
        dataUrl = await convertWithAPI(selectedFile, conversionOptions);
      } else {
        // Use client-side JS conversion
        dataUrl = await fileToLineArt(selectedFile, conversionOptions);
      }
      
      setLineArtSrc(dataUrl);
      handleClear(); // Clear the drawing when changing line art
    } catch (error) {
      console.error('Conversion failed:', error);
      // Fall back to quick mode if API fails
      if (qualityMode === 'hq') {
        try {
          const dataUrl = await fileToLineArt(selectedFile, conversionOptions);
          setLineArtSrc(dataUrl);
          handleClear();
          alert('HQ server unavailable, used quick conversion instead.');
        } catch {
          alert('Failed to convert image. Please try again.');
        }
      } else {
        alert('Failed to convert image. Please try again.');
      }
    } finally {
      setIsConverting(false);
    }
  };

  // Export to PDF
  const handleExportPdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      await exportToPdf(lineArtSrc, canvas);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // Export canvas only (for blank canvas or drawing-only export)
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FEFCFD]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a 
            href="/"
            className="flex items-center gap-2 text-[#374151] hover:text-[#EC4899] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">Gallery</span>
          </a>
          <h1 className="text-base font-semibold text-[#374151] truncate max-w-[180px] sm:max-w-none">
            {title}
          </h1>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 bg-[#EC4899] 
                       text-white px-4 py-2 rounded-[12px] font-medium card-shadow
                       hover:bg-[#DB2777] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        <div className="grid lg:grid-cols-[1fr_300px] gap-5">
          {/* Canvas Area */}
          <div 
            ref={containerRef}
            className="relative bg-white rounded-[16px] card-shadow overflow-hidden"
          >
            {/* Line art background (only if not blank canvas) */}
            {lineArtSrc && (
              <img
                src={lineArtSrc}
                alt="Coloring page"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ 
                  width: canvasSize.width, 
                  height: canvasSize.height,
                }}
              />
            )}
            
            {/* Drawing canvas overlay */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
              onPointerCancel={handlePointerUp}
              className="relative z-10 cursor-crosshair"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
              }}
            />
          </div>

          {/* Tools Sidebar - Merged into one card */}
          <div className="bg-white rounded-[16px] card-shadow p-5 h-fit">
            {/* Color Palette Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">Colors</h3>
              <div className="grid grid-cols-5 gap-2">
                {colorPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setIsEraser(false); }}
                    className={`w-10 h-10 rounded-[10px] transition-all ${
                      color === c && !isEraser
                        ? 'ring-2 ring-offset-2 ring-[#EC4899] scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              
              {/* Custom color picker */}
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-[#6B7280]">Custom:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); setIsEraser(false); }}
                  className="w-10 h-10 rounded-[10px] cursor-pointer border-0"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F3F4F6] my-5" />

            {/* Brush Settings Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">Brush</h3>
              
              {/* Size slider */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-[#6B7280] mb-2">
                  <span>Size</span>
                  <span>{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Draw/Erase toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEraser(false)}
                  className={`flex-1 py-2.5 px-3 rounded-[10px] font-medium text-sm transition-all ${
                    !isEraser
                      ? 'bg-[#EC4899] text-white'
                      : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                  }`}
                >
                  Draw
                </button>
                <button
                  onClick={() => setIsEraser(true)}
                  className={`flex-1 py-2.5 px-3 rounded-[10px] font-medium text-sm transition-all ${
                    isEraser
                      ? 'bg-[#EC4899] text-white'
                      : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                  }`}
                >
                  Erase
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F3F4F6] my-5" />

            {/* Actions Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">Actions</h3>
              <button
                onClick={handleClear}
                className="w-full py-2.5 px-4 rounded-[10px] font-medium text-sm 
                           bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors"
              >
                Clear Canvas
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F3F4F6] my-5" />

            {/* Upload & Convert Section */}
            <div>
              <h3 className="text-xs font-semibold text-[#374151] uppercase tracking-wider mb-3">Upload Photo</h3>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-[#6B7280] mb-3
                           file:mr-2 file:py-2 file:px-3
                           file:rounded-[8px] file:border-0
                           file:text-sm file:font-medium
                           file:bg-[#FDF2F8] file:text-[#EC4899]
                           hover:file:bg-[#FCE7F3] file:cursor-pointer"
              />
              
              {selectedFile && (
                <div className="space-y-3">
                  <p className="text-xs text-[#6B7280] truncate">
                    Selected: {selectedFile.name}
                  </p>
                  
                  {/* Quality Mode Toggle */}
                  <div>
                    <div className="text-xs text-[#6B7280] mb-2">Quality</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setQualityMode('quick')}
                        className={`flex-1 py-2 px-3 rounded-[10px] font-medium text-xs transition-all ${
                          qualityMode === 'quick'
                            ? 'bg-[#EC4899] text-white'
                            : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        Quick
                      </button>
                      <button
                        onClick={() => setQualityMode('hq')}
                        className={`flex-1 py-2 px-3 rounded-[10px] font-medium text-xs transition-all ${
                          qualityMode === 'hq'
                            ? 'bg-[#EC4899] text-white'
                            : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        High Quality
                      </button>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] mt-1.5">
                      {qualityMode === 'quick' 
                        ? 'Fast, runs in browser' 
                        : apiAvailable 
                          ? 'OpenCV server ready' 
                          : apiAvailable === false 
                            ? 'Server offline, will use quick mode' 
                            : 'Checking server...'}
                    </p>
                  </div>
                  
                  {/* Conversion options */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                        <span>Threshold</span>
                        <span>{conversionOptions.threshold}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={conversionOptions.threshold}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          threshold: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                        <span>{qualityMode === 'hq' ? 'Smoothing' : 'Blur Passes'}</span>
                        <span>{conversionOptions.blurPasses}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="3"
                        value={conversionOptions.blurPasses}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          blurPasses: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                        <span>Line Thickness</span>
                        <span>{conversionOptions.thickness}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        value={conversionOptions.thickness}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          thickness: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                        <span>Max Size</span>
                        <span>{conversionOptions.maxDim}px</span>
                      </div>
                      <input
                        type="range"
                        min="600"
                        max="2000"
                        step="100"
                        value={conversionOptions.maxDim}
                        onChange={(e) => setConversionOptions(prev => ({
                          ...prev,
                          maxDim: Number(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleConvert}
                    disabled={isConverting}
                    className="w-full py-2.5 px-4 rounded-[10px] font-medium text-sm
                               bg-[#EC4899] text-white
                               hover:bg-[#DB2777] transition-colors disabled:opacity-50"
                  >
                    {isConverting 
                      ? (qualityMode === 'hq' && apiAvailable ? 'Converting (HQ)...' : 'Converting...') 
                      : 'Convert to Line Art'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
