// Web Worker for offloading dither dot animation rendering
// Runs on separate thread to keep main thread responsive

interface WorkerMessage {
  type: 'init' | 'update' | 'stop';
  data?: {
    canvas?: OffscreenCanvas;
    ditheredPixels?: Uint8ClampedArray;
    scaledW?: number;
    scaledH?: number;
    containerW?: number;
    containerH?: number;
    dotSize?: number;
    spacing?: number;
    time?: number;
  };
}

let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let animationFrameId: number | null = null;
let isRunning = false;

// Cached data
let ditheredPixels: Uint8ClampedArray | null = null;
let scaledW = 0;
let scaledH = 0;
let containerW = 0;
let containerH = 0;
let dotSize = 4;
let spacing = 0;
let currentTime = 0;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  switch (type) {
    case 'init':
      if (data?.canvas) {
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (data.containerW) containerW = data.containerW;
        if (data.containerH) containerH = data.containerH;
        if (data.scaledW) scaledW = data.scaledW;
        if (data.scaledH) scaledH = data.scaledH;
        if (data.dotSize) dotSize = data.dotSize;
        if (data.spacing !== undefined) spacing = data.spacing;
      }
      break;

    case 'update':
      if (data?.ditheredPixels) {
        ditheredPixels = data.ditheredPixels;
      }
      if (data?.scaledW) scaledW = data.scaledW;
      if (data?.scaledH) scaledH = data.scaledH;
      if (data?.containerW) containerW = data.containerW;
      if (data?.containerH) containerH = data.containerH;
      if (data?.dotSize) dotSize = data.dotSize;
      if (data?.spacing !== undefined) spacing = data.spacing;
      if (data?.time !== undefined) {
        currentTime = data.time;
        if (!isRunning) {
          isRunning = true;
          renderFrame();
        }
      }
      break;

    case 'stop':
      isRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      break;
  }
};

function renderFrame() {
  if (!isRunning || !ctx || !canvas || !ditheredPixels) return;
  if (scaledW === 0 || scaledH === 0) return;

  // Clear canvas
  ctx.clearRect(0, 0, containerW, containerH);

  const cellSize = dotSize + spacing;
  const scaleX = containerW / scaledW;
  const scaleY = containerH / scaledH;

  // Render dots
  for (let row = 0; row < scaledH; row++) {
    for (let col = 0; col < scaledW; col++) {
      const idx = (row * scaledW + col) * 4;
      const r = ditheredPixels[idx];
      const g = ditheredPixels[idx + 1];
      const b = ditheredPixels[idx + 2];

      // Calculate brightness for halftone effect
      const brightness = (r + g + b) / (3 * 255);
      const darkness = 1 - brightness;
      const dotSizeMultiplier = darkness * darkness;

      const x = col * scaleX;
      const y = row * scaleY;
      const maxDotSize = scaleX * (dotSize / cellSize);
      const w = maxDotSize * dotSizeMultiplier;
      const h = maxDotSize * dotSizeMultiplier;

      if (w < 0.5 || h < 0.5) continue;

      const offsetX = (scaleX - w) / 2;
      const offsetY = (scaleY - h) / 2;

      // Base jitter
      const baseJitterX = ((col * 7 + row * 13) % 100) / 100 - 0.5;
      const baseJitterY = ((col * 11 + row * 17) % 100) / 100 - 0.5;
      const jitterAmount = spacing * 0.3;

      // Random animated jitter
      const randomSeed1 = Math.sin(col * 12.9898 + row * 78.233 + currentTime * 0.5) * 43758.5453;
      const randomSeed2 = Math.sin(col * 93.989 + row * 12.456 + currentTime * 0.7) * 23421.631;
      const randomJitterX = (randomSeed1 - Math.floor(randomSeed1)) - 0.5;
      const randomJitterY = (randomSeed2 - Math.floor(randomSeed2)) - 0.5;

      const animatedJitterX = baseJitterX + randomJitterX * 0.4;
      const animatedJitterY = baseJitterY + randomJitterY * 0.4;

      const finalX = x + offsetX + animatedJitterX * jitterAmount;
      const finalY = y + offsetY + animatedJitterY * jitterAmount;

      // Random size variation
      const randomSeed3 = Math.sin(col * 45.123 + row * 67.890 + currentTime * 1.2) * 12345.678;
      const randomSizeVariation = (randomSeed3 - Math.floor(randomSeed3)) * 0.15;
      const animatedW = w * (1 + randomSizeVariation);
      const animatedH = h * (1 + randomSizeVariation);

      // Random color variation
      const randomSeed4 = Math.sin(col * 23.456 + row * 89.012 + currentTime * 0.9) * 56789.123;
      const randomColorShift = (randomSeed4 - Math.floor(randomSeed4)) * 0.1 - 0.05;
      const shimmerR = Math.min(255, Math.max(0, r * (1 + randomColorShift)));
      const shimmerG = Math.min(255, Math.max(0, g * (1 + randomColorShift)));
      const shimmerB = Math.min(255, Math.max(0, b * (1 + randomColorShift)));

      // Draw dot
      ctx.fillStyle = `rgb(${shimmerR},${shimmerG},${shimmerB})`;
      ctx.beginPath();
      ctx.ellipse(
        finalX + animatedW / 2,
        finalY + animatedH / 2,
        animatedW / 2,
        animatedH / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Notify main thread that frame is complete
  self.postMessage({ type: 'frameComplete' });
}

export {};
