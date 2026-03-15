# ImageToAscii Component

A powerful React component that transforms images into either ASCII art or dithered effects in real-time with extensive customization options.

## Overview

The `ImageToAscii` component provides two distinct image transformation modes:

- **ASCII Mode**: Converts images to colored ASCII characters based on pixel brightness
- **Dither Mode**: Applies classic dithering algorithms (Floyd-Steinberg, Ordered/Bayer, Atkinson) for retro-style image effects

Both modes share a common image processing pipeline with color transformations (contrast, hue shift, saturation) and support both local and external images.

## Installation

```tsx
import ImageToAscii from './components/ImageToAscii';
```

## Quick Start

### ASCII Mode (Basic)

```tsx
<ImageToAscii 
  src="/images/photo.jpg"
  mode="ascii"
  fontSize={8}
  width="600px"
  height="400px"
/>
```

### Dither Mode (Basic)

```tsx
<ImageToAscii 
  src="/images/photo.jpg"
  mode="dither"
  ditherAlgorithm="floyd-steinberg"
  width="600px"
  height="400px"
/>
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `src` | `string` | Image source (local path or external URL) |

### Mode Selection

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'ascii' \| 'dither'` | `'ascii'` | Transformation mode |

### Shared Props (Both Modes)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `contrast` | `number` | `1.0` | Contrast adjustment (0.0 - 2.0) |
| `hueShift` | `number` | `0` | Hue rotation in degrees (0-360) |
| `saturation` | `number` | `1.0` | Saturation adjustment (0.0 = grayscale, 2.0+ = hyper-saturated) |
| `objectFit` | `'cover' \| 'contain'` | `'cover'` | How image fits in container |
| `width` | `number \| string` | - | Container width |
| `height` | `number \| string` | - | Container height |
| `className` | `string` | `''` | Additional CSS classes |
| `alt` | `string` | `''` | Alt text for accessibility |

### ASCII Mode Only

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lettersetAllowlist` | `string[]` | - | Only use these characters (e.g., `['a', 'b', '/']`) |
| `lettersetBlacklist` | `string[]` | - | Exclude these characters from default set |
| `fontSize` | `number` | `8` | Character size in pixels (controls detail density) |

**Default Character Set**: `` .'\`^",:;Il!i><~+_-?][}{1)(|\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$``

### Dither Mode Only

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ditherAlgorithm` | `'floyd-steinberg' \| 'ordered' \| 'atkinson'` | `'floyd-steinberg'` | Dithering algorithm |
| `ditherThreshold` | `number` | `128` | Brightness threshold (0-255) |
| `ditherMatrixSize` | `2 \| 4 \| 8` | `4` | Bayer matrix size for ordered dithering |
| `colorPalette` | `string[]` | `['#000000', '#ffffff']` | Custom color palette (hex colors) |
| `colorCount` | `number` | `2` | Number of colors to reduce to (2-256) |
| `scale` | `number` | `1.0` | Output resolution scale (0.1 - 1.0) |

## Mode Comparison

### When to Use ASCII Mode

- **Artistic text effects**: Create unique typography-based visuals
- **Retro terminal aesthetics**: Emulate classic computer terminal graphics
- **Colored character art**: Preserve original colors while using text
- **Customizable character sets**: Use specific letters/symbols for branding

**Pros**: Highly customizable, colored output, unique aesthetic  
**Cons**: Lower detail than dithering, larger DOM size with many characters

### When to Use Dither Mode

- **Retro pixel art**: Classic video game or early computer graphics look
- **Print-style halftones**: Newspaper/magazine reproduction effects
- **Color reduction**: Limit palette for stylistic or performance reasons
- **Pattern-based effects**: Ordered dithering creates distinctive patterns

**Pros**: High detail, efficient rendering (canvas), classic algorithms  
**Cons**: Less customizable than ASCII, fixed visual style per algorithm

## Usage Examples

### ASCII Mode Examples

#### Custom Character Set

```tsx
<ImageToAscii 
  mode="ascii"
  src="/images/logo.png"
  lettersetAllowlist={['W', 'G', 'F', 'I', ' ']}
  fontSize={10}
  contrast={1.3}
  width="100%"
  height="300px"
/>
```

#### High Contrast Monochrome

```tsx
<ImageToAscii 
  mode="ascii"
  src="/images/portrait.jpg"
  saturation={0}
  contrast={1.8}
  fontSize={6}
  objectFit="contain"
  width="800px"
  height="600px"
/>
```

#### Color-Shifted Art

```tsx
<ImageToAscii 
  mode="ascii"
  src="/images/landscape.jpg"
  hueShift={180}
  saturation={1.5}
  contrast={1.2}
  fontSize={8}
  width="100%"
  height="500px"
/>
```

### Dither Mode Examples

#### Floyd-Steinberg (Smooth Gradients)

```tsx
<ImageToAscii 
  mode="dither"
  src="/images/photo.jpg"
  ditherAlgorithm="floyd-steinberg"
  colorCount={2}
  contrast={1.1}
  width="600px"
  height="400px"
/>
```

#### Ordered Dithering (Pattern Effect)

```tsx
<ImageToAscii 
  mode="dither"
  src="/images/photo.jpg"
  ditherAlgorithm="ordered"
  ditherMatrixSize={8}
  colorPalette={['#000000', '#ffffff']}
  scale={0.8}
  width="600px"
  height="400px"
/>
```

#### Atkinson (High Contrast)

```tsx
<ImageToAscii 
  mode="dither"
  src="/images/photo.jpg"
  ditherAlgorithm="atkinson"
  colorCount={2}
  contrast={1.3}
  saturation={0}
  width="600px"
  height="400px"
/>
```

#### Multi-Color Palette

```tsx
<ImageToAscii 
  mode="dither"
  src="/images/sunset.jpg"
  ditherAlgorithm="floyd-steinberg"
  colorPalette={[
    '#000000',
    '#2d1b00',
    '#ff6b35',
    '#f7931e',
    '#fdc500',
    '#ffffff'
  ]}
  colorCount={6}
  scale={0.9}
  width="800px"
  height="500px"
/>
```

### External Image Sources

```tsx
<ImageToAscii 
  mode="ascii"
  src="https://picsum.photos/800/600"
  fontSize={7}
  contrast={1.2}
  width="100%"
  height="400px"
  alt="Random photo from Picsum"
/>
```

## Dithering Algorithms Explained

### Floyd-Steinberg
**Best for**: Smooth gradients, photographic images  
**Characteristics**: Error diffusion to 4 neighboring pixels (right, bottom-left, bottom, bottom-right)  
**Visual**: Organic, natural-looking dithering with minimal patterns

### Ordered (Bayer Matrix)
**Best for**: Stylized effects, consistent patterns  
**Characteristics**: Uses predefined matrix for threshold comparison  
**Visual**: Distinctive crosshatch or grid patterns, very "retro"  
**Matrix sizes**: 2×2 (coarse), 4×4 (balanced), 8×8 (fine)

### Atkinson
**Best for**: High contrast images, line art  
**Characteristics**: Lighter error diffusion to 6 neighbors, preserves highlights  
**Visual**: High contrast with bright highlights, classic Mac aesthetic

## Image Source Compatibility

### Local Images
- **Relative paths**: `/images/photo.jpg`, `./assets/image.png`
- **Public folder**: Images in your public directory
- **No CORS issues**: Works seamlessly with local files

### External URLs
- **Full URLs**: `https://example.com/image.jpg`
- **CORS handling**: Automatically sets `crossOrigin="anonymous"`
- **Requirements**: External server must send `Access-Control-Allow-Origin` header
- **Fallback**: Displays error message if CORS blocks access

**Supported formats**: JPG, PNG, GIF, WebP, SVG

## Performance Tips

### ASCII Mode Optimization

1. **Reduce fontSize**: Smaller font = more characters = slower rendering
   - Recommended: 6-10px for good balance
   - Avoid: <4px (too many characters)

2. **Limit dimensions**: Large containers create massive character grids
   - Good: 800×600px or smaller
   - Caution: >1200px width

3. **Simplify character set**: Fewer unique characters = faster processing
   - Use `lettersetAllowlist` with 10-20 characters for best performance

### Dither Mode Optimization

1. **Use scale prop**: Reduce resolution for faster processing
   - `scale={0.5}` = 4× faster processing
   - Use `imageRendering: 'pixelated'` CSS for crisp upscaling

2. **Choose algorithm wisely**:
   - **Fastest**: Ordered dithering
   - **Slowest**: Floyd-Steinberg (but best quality)

3. **Limit color palette**: Fewer colors = faster color matching
   - 2-4 colors: Very fast
   - 8+ colors: Noticeably slower

### General Tips

- **Debouncing**: Component automatically debounces rapid prop changes
- **Memoization**: Expensive calculations are memoized
- **Mobile**: Consider smaller dimensions and higher fontSize on mobile devices

## Troubleshooting

### "Failed to load image" Error

**Cause**: Image URL is incorrect or unreachable  
**Solution**: Verify the image path/URL is correct and accessible

### "Failed to process image. This may be due to CORS restrictions."

**Cause**: External image server doesn't allow cross-origin canvas access  
**Solution**: 
- Use local images instead
- Configure server to send CORS headers
- Use a CORS proxy service
- Download and host the image locally

### ASCII art looks distorted

**Cause**: Container aspect ratio doesn't match image  
**Solution**: Use `objectFit="contain"` or match container aspect ratio to image

### Dithering looks too pixelated

**Cause**: `scale` prop is too low  
**Solution**: Increase `scale` value (try 0.8 or 1.0)

### Performance is slow

**Cause**: Image too large or too many characters  
**Solution**: 
- Reduce container dimensions
- Increase `fontSize` (ASCII mode)
- Decrease `scale` (Dither mode)
- Use simpler dithering algorithm (ordered instead of floyd-steinberg)

### Colors look wrong

**Cause**: Color transformations are too extreme  
**Solution**: 
- Reset `contrast`, `hueShift`, `saturation` to defaults
- Adjust values gradually
- Check if image has correct color profile

## Browser Compatibility

- **Modern browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Canvas API**: Required (supported in all modern browsers)
- **CORS**: Requires proper server configuration for external images
- **Mobile**: Fully supported, consider performance optimizations

## Accessibility

The component includes proper ARIA attributes:
- `role="img"` on output elements
- `aria-label` using the `alt` prop
- Semantic HTML structure

Always provide meaningful `alt` text for screen readers:

```tsx
<ImageToAscii 
  src="/images/park.jpg"
  alt="Aerial view of Central Park in autumn"
  mode="ascii"
/>
```

## Advanced Techniques

### Animated Transitions

Switch between modes dynamically:

```tsx
const [mode, setMode] = useState<'ascii' | 'dither'>('ascii');

<ImageToAscii 
  src="/images/photo.jpg"
  mode={mode}
  width="600px"
  height="400px"
/>
<button onClick={() => setMode(mode === 'ascii' ? 'dither' : 'ascii')}>
  Toggle Mode
</button>
```

### Responsive Sizing

```tsx
<ImageToAscii 
  src="/images/photo.jpg"
  mode="ascii"
  width="100%"
  height="auto"
  className="max-w-4xl mx-auto"
/>
```

### Dynamic Color Palettes

```tsx
const [palette, setPalette] = useState(['#000000', '#ffffff']);

<ImageToAscii 
  src="/images/photo.jpg"
  mode="dither"
  colorPalette={palette}
  ditherAlgorithm="floyd-steinberg"
/>
```

## Examples in Context

### Homepage Hero Section

```tsx
<div className="relative h-screen">
  <ImageToAscii 
    src="/images/hero-background.jpg"
    mode="ascii"
    fontSize={6}
    saturation={0.7}
    contrast={1.1}
    width="100%"
    height="100%"
    className="absolute inset-0"
  />
  <div className="relative z-10 flex items-center justify-center h-full">
    <h1>Welcome to Our Site</h1>
  </div>
</div>
```

### Gallery Item

```tsx
<div className="grid grid-cols-3 gap-4">
  {images.map(img => (
    <ImageToAscii 
      key={img.id}
      src={img.url}
      mode="dither"
      ditherAlgorithm="ordered"
      width="100%"
      height="300px"
      objectFit="cover"
    />
  ))}
</div>
```

## License

This component is part of the WGFI project.

## Credits

Dithering algorithms based on classic image processing techniques:
- Floyd-Steinberg (1976)
- Bayer ordered dithering (1973)
- Atkinson dithering (Apple, 1980s)
