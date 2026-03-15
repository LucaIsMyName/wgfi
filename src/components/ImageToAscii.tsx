import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface ImageToAsciiProps {
  src: string;
  mode?: 'ascii' | 'dither';
  contrast?: number;
  hueShift?: number;
  saturation?: number;
  objectFit?: 'cover' | 'contain';
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
  lettersetAllowlist?: string[];
  lettersetBlacklist?: string[];
  fontSize?: number;
  ditherAlgorithm?: 'floyd-steinberg' | 'ordered' | 'atkinson';
  ditherThreshold?: number;
  ditherMatrixSize?: 2 | 4 | 8;
  colorPalette?: string[];
  colorCount?: number;
  scale?: number;
  movement?: number;
  ditherDotSize?: number;
  ditherDotSpacing?: number;
}

interface AsciiCell {
  char: string;
  r: number;
  g: number;
  b: number;
}

const DEFAULT_CHARSET = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

const ImageToAscii: React.FC<ImageToAsciiProps> = ({
  src,
  mode = 'ascii',
  contrast = 1.0,
  hueShift = 0,
  saturation = 1.0,
  objectFit = 'cover',
  width,
  height,
  className = '',
  alt = '',
  lettersetAllowlist,
  lettersetBlacklist,
  fontSize = 8,
  ditherAlgorithm = 'floyd-steinberg',
  ditherThreshold = 128,
  ditherMatrixSize = 4,
  colorPalette,
  colorCount = 2,
  scale = 1.0,
  movement = 0,
  ditherDotSize = 1,
  ditherDotSpacing = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [asciiGrid, setAsciiGrid] = useState<AsciiCell[][]>([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [animationOffset, setAnimationOffset] = useState(0);

  const charset = useMemo(() => {
    let chars = DEFAULT_CHARSET;
    
    if (lettersetAllowlist && lettersetAllowlist.length > 0) {
      chars = lettersetAllowlist.join('');
    } else if (lettersetBlacklist && lettersetBlacklist.length > 0) {
      const blacklistSet = new Set(lettersetBlacklist);
      chars = DEFAULT_CHARSET.split('').filter(c => !blacklistSet.has(c)).join('');
    }
    
    return chars || DEFAULT_CHARSET;
  }, [lettersetAllowlist, lettersetBlacklist]);

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return [h * 360, s * 100, l * 100];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const applyColorTransformations = (r: number, g: number, b: number): [number, number, number] => {
    r = Math.max(0, Math.min(255, ((r / 255 - 0.5) * contrast + 0.5) * 255));
    g = Math.max(0, Math.min(255, ((g / 255 - 0.5) * contrast + 0.5) * 255));
    b = Math.max(0, Math.min(255, ((b / 255 - 0.5) * contrast + 0.5) * 255));

    let [h, s, l] = rgbToHsl(r, g, b);
    h = (h + hueShift) % 360;
    if (h < 0) h += 360;
    s = Math.max(0, Math.min(100, s * saturation));

    return hslToRgb(h, s, l);
  };

  const getBayerMatrix = (size: number): number[][] => {
    if (size === 2) {
      return [[0, 2], [3, 1]];
    } else if (size === 4) {
      return [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5]
      ];
    } else {
      return [
        [0, 32, 8, 40, 2, 34, 10, 42],
        [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38],
        [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41],
        [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37],
        [63, 31, 55, 23, 61, 29, 53, 21]
      ];
    }
  };

  const findClosestColor = (r: number, g: number, b: number, palette: string[]): [number, number, number] => {
    let minDist = Infinity;
    let closest = [0, 0, 0];

    palette.forEach(color => {
      const pr = parseInt(color.slice(1, 3), 16);
      const pg = parseInt(color.slice(3, 5), 16);
      const pb = parseInt(color.slice(5, 7), 16);
      const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
      if (dist < minDist) {
        minDist = dist;
        closest = [pr, pg, pb];
      }
    });

    return closest as [number, number, number];
  };

  // Returns AsciiCell grid from an already-loaded image at given container dimensions
  const buildAsciiGrid = useCallback((
    img: HTMLImageElement,
    containerW: number,
    containerH: number,
  ): AsciiCell[][] => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    const charAspect = 0.55; // monospace char width/height ratio
    const cols = Math.max(1, Math.floor(containerW / (fontSize * charAspect)));
    const rows = Math.max(1, Math.floor(containerH / fontSize));

    canvas.width = cols;
    canvas.height = rows;
    ctx.drawImage(img, 0, 0, cols, rows);
    const { data: pixels } = ctx.getImageData(0, 0, cols, rows);

    const grid: AsciiCell[][] = [];
    for (let row = 0; row < rows; row++) {
      const rowCells: AsciiCell[] = [];
      for (let col = 0; col < cols; col++) {
        const idx = (row * cols + col) * 4;
        const [r, g, b] = applyColorTransformations(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const charIndex = Math.floor((brightness / 255) * (charset.length - 1));
        rowCells.push({ char: charset[charIndex], r, g, b });
      }
      grid.push(rowCells);
    }
    return grid;
  }, [fontSize, charset, contrast, hueShift, saturation]);

  const processDither = useCallback((
    img: HTMLImageElement,
    containerW: number,
    containerH: number,
  ) => {
    const canvas = canvasRef.current;
    const outputCanvas = outputCanvasRef.current;
    if (!canvas || !outputCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const scaledW = Math.floor(containerW * scale);
    const scaledH = Math.floor(containerH * scale);
    canvas.width = scaledW;
    canvas.height = scaledH;
    outputCanvas.width = scaledW;
    outputCanvas.height = scaledH;

    const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
    if (!outputCtx) return;

    ctx.drawImage(img, 0, 0, scaledW, scaledH);
    outputCtx.drawImage(canvas, 0, 0, scaledW, scaledH);

    const imageData = outputCtx.getImageData(0, 0, scaledW, scaledH);
    const pixels = imageData.data;

    // Per-channel quantization: each channel independently quantized to `colorCount` levels.
    // saturation=0 → applyColorTransformations equalizes R/G/B → naturally grayscale/B&W.
    // colorPalette provided → fall back to nearest-palette-color matching.
    const levels = Math.max(2, colorCount);
    const quantizeCh = (v: number) => Math.round(v / 255 * (levels - 1)) / (levels - 1) * 255;

    const clamp = (v: number) => Math.max(0, Math.min(255, v));

    const spreadError = (
      px: Uint8ClampedArray,
      x: number, y: number,
      errR: number, errG: number, errB: number,
      f: number, w: number, h: number,
    ) => {
      if (x >= 0 && x < w && y >= 0 && y < h) {
        const i = (y * w + x) * 4;
        px[i]     = clamp(px[i]     + errR * f);
        px[i + 1] = clamp(px[i + 1] + errG * f);
        px[i + 2] = clamp(px[i + 2] + errB * f);
      }
    };

    if (ditherAlgorithm === 'floyd-steinberg') {
      for (let y = 0; y < scaledH; y++) {
        for (let x = 0; x < scaledW; x++) {
          const idx = (y * scaledW + x) * 4;
          const [r, g, b] = applyColorTransformations(pixels[idx], pixels[idx + 1], pixels[idx + 2]);

          let nr: number, ng: number, nb: number;
          if (colorPalette) {
            [nr, ng, nb] = findClosestColor(r, g, b, colorPalette);
          } else {
            nr = quantizeCh(r); ng = quantizeCh(g); nb = quantizeCh(b);
          }

          pixels[idx] = nr; pixels[idx + 1] = ng; pixels[idx + 2] = nb;
          const errR = r - nr, errG = g - ng, errB = b - nb;

          spreadError(pixels, x + 1, y,     errR, errG, errB, 7/16, scaledW, scaledH);
          spreadError(pixels, x - 1, y + 1, errR, errG, errB, 3/16, scaledW, scaledH);
          spreadError(pixels, x,     y + 1, errR, errG, errB, 5/16, scaledW, scaledH);
          spreadError(pixels, x + 1, y + 1, errR, errG, errB, 1/16, scaledW, scaledH);
        }
      }
    } else if (ditherAlgorithm === 'ordered') {
      const matrix = getBayerMatrix(ditherMatrixSize);
      const ms = matrix.length;
      const matrixMax = ditherMatrixSize * ditherMatrixSize;

      for (let y = 0; y < scaledH; y++) {
        for (let x = 0; x < scaledW; x++) {
          const idx = (y * scaledW + x) * 4;
          const [r, g, b] = applyColorTransformations(pixels[idx], pixels[idx + 1], pixels[idx + 2]);
          const bias = (matrix[y % ms][x % ms] / matrixMax - 0.5) * (255 / levels);

          if (colorPalette) {
            const [nr, ng, nb] = findClosestColor(r + bias, g + bias, b + bias, colorPalette);
            pixels[idx] = nr; pixels[idx + 1] = ng; pixels[idx + 2] = nb;
          } else {
            pixels[idx]     = quantizeCh(clamp(r + bias));
            pixels[idx + 1] = quantizeCh(clamp(g + bias));
            pixels[idx + 2] = quantizeCh(clamp(b + bias));
          }
        }
      }
    } else if (ditherAlgorithm === 'atkinson') {
      for (let y = 0; y < scaledH; y++) {
        for (let x = 0; x < scaledW; x++) {
          const idx = (y * scaledW + x) * 4;
          const [r, g, b] = applyColorTransformations(pixels[idx], pixels[idx + 1], pixels[idx + 2]);

          let nr: number, ng: number, nb: number;
          if (colorPalette) {
            [nr, ng, nb] = findClosestColor(r, g, b, colorPalette);
          } else {
            nr = quantizeCh(r); ng = quantizeCh(g); nb = quantizeCh(b);
          }

          pixels[idx] = nr; pixels[idx + 1] = ng; pixels[idx + 2] = nb;
          const eR = (r - nr) / 8, eG = (g - ng) / 8, eB = (b - nb) / 8;

          spreadError(pixels, x + 1, y,     eR, eG, eB, 1, scaledW, scaledH);
          spreadError(pixels, x + 2, y,     eR, eG, eB, 1, scaledW, scaledH);
          spreadError(pixels, x - 1, y + 1, eR, eG, eB, 1, scaledW, scaledH);
          spreadError(pixels, x,     y + 1, eR, eG, eB, 1, scaledW, scaledH);
          spreadError(pixels, x + 1, y + 1, eR, eG, eB, 1, scaledW, scaledH);
          spreadError(pixels, x,     y + 2, eR, eG, eB, 1, scaledW, scaledH);
        }
      }
    }

    outputCtx.putImageData(imageData, 0, 0);
  }, [scale, colorPalette, colorCount, ditherAlgorithm, ditherMatrixSize, contrast, hueShift, saturation]);

  // Re-process whenever image or container size changes
  const reprocess = useCallback((w: number, h: number) => {
    const img = loadedImgRef.current;
    if (!img || !canvasRef.current) return;
    if (w <= 0 || h <= 0) return;

    if (mode === 'ascii') {
      const grid = buildAsciiGrid(img, w, h);
      setAsciiGrid(grid);
    } else {
      processDither(img, w, h);
    }
    setIsLoading(false);
  }, [mode, buildAsciiGrid, processDither]);

  // Load image when src changes
  useEffect(() => {
    setIsLoading(true);
    setError('');
    loadedImgRef.current = null;

    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      loadedImgRef.current = img;
      // Use current measured container size
      const container = containerRef.current;
      const w = container?.clientWidth || window.innerWidth;
      const h = container?.clientHeight || window.innerHeight;
      setContainerSize({ w, h });
      reprocess(w, h);
    };

    img.onerror = () => {
      setError('Failed to load image. Check the URL or CORS settings.');
      setIsLoading(false);
    };

    img.src = src;
  }, [src]);

  // ResizeObserver: re-process on container resize (debounced 300ms)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      if (w <= 0 || h <= 0) return;

      setContainerSize({ w, h });

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        reprocess(w, h);
      }, 300);
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [reprocess]);

  // Re-process when visual props change (contrast, hue, saturation, fontSize, etc.)
  useEffect(() => {
    if (!loadedImgRef.current || containerSize.w <= 0) return;
    reprocess(containerSize.w, containerSize.h);
  }, [mode, contrast, hueShift, saturation, fontSize, charset, ditherAlgorithm, ditherMatrixSize, colorPalette, scale, ditherDotSize, ditherDotSpacing]);

  // Movement animation: continuous slow drift when movement > 0
  useEffect(() => {
    if (movement === 0) return;
    
    let animationFrameId: number;
    let lastTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      
      setAnimationOffset(prev => (prev + movement * delta) % 360);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [movement]);

  // Derived display sizing for exact fill
  const charAspect = 0.55;
  const cols = asciiGrid[0]?.length || 0;
  const rows = asciiGrid.length;
  const charW = cols > 0 ? containerSize.w / cols : fontSize * charAspect;
  const charH = rows > 0 ? containerSize.h / rows : fontSize;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={alt || (mode === 'ascii' ? 'ASCII art' : 'Dithered image')}
    >
      {/* Hidden processing canvas — always in DOM so ref is available */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-600 p-4 text-center text-xs">{error}</p>
        </div>
      )}

      {isLoading && !error && (
        <div className="sr-only absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-xs">Loading...</p>
        </div>
      )}

      {!isLoading && !error && mode === 'ascii' && asciiGrid.length > 0 && (
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: `${charH}px`,
            lineHeight: `${charH}px`,
            letterSpacing: `${charW - charH * charAspect}px`,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            userSelect: 'none',
            transform: movement !== 0 ? `translate(${Math.cos(animationOffset * Math.PI / 180) * 2}px, ${Math.sin(animationOffset * Math.PI / 180) * 2}px)` : undefined,
            transition: movement === 0 ? 'transform 0.3s ease-out' : undefined,
          }}
        >
          {asciiGrid.map((row, rowIdx) => (
            <div key={rowIdx} style={{ whiteSpace: 'nowrap', height: `${charH}px` }}>
              {row.map((cell, colIdx) => (
                <span
                  key={colIdx}
                  style={{ color: `rgb(${cell.r},${cell.g},${cell.b})` }}
                >
                  {cell.char}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}

      {mode === 'dither' && (
        <canvas
          ref={outputCanvasRef}
          style={{
            display: isLoading || error ? 'none' : 'block',
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            transform: movement !== 0 ? `translate(${Math.cos(animationOffset * Math.PI / 180) * 2}px, ${Math.sin(animationOffset * Math.PI / 180) * 2}px)` : undefined,
            transition: movement === 0 ? 'transform 0.3s ease-out' : undefined,
          }}
        />
      )}
    </div>
  );
};

export default ImageToAscii;
