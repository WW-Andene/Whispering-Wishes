# The Complete Canvas 2D API in 2026

The HTML5 Canvas 2D API is the most capable immediate-mode drawing surface on the web, offering **26 compositing modes, full affine transforms, per-pixel buffer access, and a modern API surface** that now includes conic gradients, rounded rectangles, CSS filters, and worker-based rendering. This reference covers every method, property, and creative technique available on `CanvasRenderingContext2D` as of early 2026, including the newer additions that reached cross-browser baseline between 2023 and 2025.

The 2D context operates on a simple model: you configure state (styles, transforms, compositing), define geometry (paths, rectangles, text), then execute a draw command (fill, stroke, drawImage). Every pixel lives in an RGBA bitmap buffer backed by either GPU or CPU memory, and the entire API surface—from primitive drawing to pixel-level shaders—flows from this architecture.

---

## 1. Drawing Primitives — The Path-Based Model

All non-rectangular geometry in Canvas 2D is constructed through **paths**—sequences of sub-paths that accumulate until you call `fill()`, `stroke()`, or `clip()`.

### Path Lifecycle and Geometry Commands

`beginPath()` clears the sub-path list. `closePath()` draws a straight line back to the sub-path start. `moveTo(x, y)` starts a new sub-path without drawing. `lineTo(x, y)` appends a straight segment.

**Arc and curve operations:**

- `arc(x, y, radius, startAngle, endAngle, counterclockwise?)` — circular arc; angles in radians, 0 = rightward.
- `arcTo(x1, y1, x2, y2, radius)` — arc tangent to two line segments; ideal for rounded corners.
- `bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)` — cubic Bézier with two control points.
- `quadraticCurveTo(cpx, cpy, x, y)` — quadratic Bézier with one control point.
- `ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, ccw?)` — elliptical arc with independent semi-axes and rotation.
- `rect(x, y, w, h)` — closed rectangular sub-path.
- **`roundRect(x, y, w, h, radii)`** — rounded rectangle. `radii` mirrors CSS `border-radius`: single number for all corners; array of 1–4 values maps to corners in CSS order (TL, TR, BR, BL). Each element can be `{x, y}` for elliptical corners. Throws `RangeError` on negative radii. Baseline: Chrome 99+, Firefox 112+, Safari 16+.

**Immediate rectangle methods** bypass paths entirely: `fillRect()`, `strokeRect()`, `clearRect()`.

**Fill rules:** `fill('nonzero')` (default) uses winding number. `fill('evenodd')` toggles inside/outside on each crossing, producing holes where paths overlap evenly.

### Text Rendering and TextMetrics

`fillText(text, x, y, maxWidth?)` and `strokeText(text, x, y, maxWidth?)` render text. The optional `maxWidth` compresses text horizontally if needed.

`measureText(text)` returns a **TextMetrics** object:

| Property | Meaning |
|---|---|
| `width` | Advance width (standard horizontal measure) |
| `actualBoundingBoxLeft/Right` | Horizontal distance from alignment to ink bounds |
| `actualBoundingBoxAscent/Descent` | Vertical distance from baseline to ink bounds |
| `fontBoundingBoxAscent/Descent` | Font's maximum ascent/descent (consistent across all strings) |
| `emHeightAscent/Descent` | Em-square boundaries |
| `alphabeticBaseline`, `hangingBaseline`, `ideographicBaseline` | Distances between `textBaseline` and each named baseline |

For italic fonts, `actualBoundingBoxLeft + actualBoundingBoxRight` can exceed `width` due to character overhang. The `fontBoundingBox*` properties give consistent line height regardless of text content. Extended baseline metrics reached baseline in Chrome 118+, Firefox 116+, Safari 17.4+.

### Text Styling Properties

| Property | Values | Default |
|---|---|---|
| `font` | CSS font shorthand (`"italic 48px serif"`) | `"10px sans-serif"` |
| `textAlign` | `start`, `end`, `left`, `right`, `center` | `start` |
| `textBaseline` | `top`, `hanging`, `middle`, `alphabetic`, `ideographic`, `bottom` | `alphabetic` |
| `direction` | `ltr`, `rtl`, `inherit` | `inherit` |
| `letterSpacing` | CSS length string (`"2px"`, `"0.1em"`) | `"0px"` |
| `wordSpacing` | CSS length string | `"0px"` |
| `fontKerning` | `auto`, `normal`, `none` | `auto` |
| `fontStretch` | `ultra-condensed` through `ultra-expanded` | `normal` |
| `fontVariantCaps` | `normal`, `small-caps`, `all-small-caps`, `petite-caps`, etc. | `normal` |
| `textRendering` | `auto`, `optimizeSpeed`, `optimizeLegibility`, `geometricPrecision` | `auto` |

The newer text properties (`letterSpacing`, `wordSpacing`, `fontKerning`, `fontStretch`, `fontVariantCaps`, `textRendering`) all reached **baseline in March 2025** (Chrome 99+, Firefox 115+, Safari 18.4+).

### Line Properties and Dashed Lines

`lineWidth` sets stroke thickness. `lineCap`: `butt` (flat), `round` (semicircle), `square` (extends half-width). `lineJoin`: `miter` (sharp, capped by `miterLimit`), `round`, `bevel`.

`setLineDash(segments)` takes alternating dash/gap lengths. Odd-length arrays are doubled internally. Empty array = solid. `lineDashOffset` shifts phase — animating this produces "marching ants."

---

## 2. Gradients, Patterns, and Fill Styles

`fillStyle` and `strokeStyle` accept: CSS color strings, `CanvasGradient` objects, or `CanvasPattern` objects.

### Linear and Radial Gradients

`createLinearGradient(x0, y0, x1, y1)` — gradient along the line between two points.

`createRadialGradient(x0, y0, r0, x1, y1, r1)` — gradient between **two circles**. Start/end circles need not be concentric. `r0 = 0` creates point-source. Offset centers produce spotlight/cone effects. `r0 > 0` creates hollow ring gradient.

Both use `addColorStop(offset, color)` where offset is 0–1. Two stops at the same offset = **hard color boundary** with no interpolation. Coordinates are in the **current coordinate space**.

### Conic Gradients

`createConicGradient(startAngle, cx, cy)` — sweeps angularly around center. `startAngle` in radians (0 = rightward, clockwise). Stops at 0 and 1 map to full 360° sweep. Ideal for color wheels, pie charts, circular progress indicators. Baseline since April 2023.

### Patterns

`createPattern(image, repetition)` wraps any `CanvasImageSource` as a repeating tile. Repetition: `repeat`, `repeat-x`, `repeat-y`, `no-repeat`. The returned `CanvasPattern` has `setTransform(matrix)` accepting a `DOMMatrix` to rotate/scale/skew independently of the canvas transform.

---

## 3. All 26 Compositing and Blending Modes

`globalCompositeOperation` controls how each new draw ("source") combines with existing content ("destination"). There are **11 Porter-Duff compositing operators** and **15 CSS blend modes**.

### Porter-Duff Compositing Operators

**`source-over`** (default): Source drawn on top.

**`source-in`**: Source visible only where it overlaps existing content. Powerful for **alpha masking**.

**`source-out`**: Source visible only where it does *not* overlap. **Inverse masking** and cutouts.

**`source-atop`**: Source drawn only over existing content; transparent areas stay transparent.

**`destination-over`**: New content drawn *behind* existing content.

**`destination-in`**: Existing content kept only where new shape overlaps. Supports **soft-edge masking** with gradients (unlike `clip()`).

**`destination-out`**: Existing content erased where new shape overlaps. The **eraser tool**.

**`destination-atop`**: Existing content kept only where new shape overlaps; new shape behind.

**`lighter`**: Colors **additively blended** (RGB summed, clamped at 255). Simulates real light mixing. Essential for **glow, bloom, neon, fire, particle effects**.

**`copy`**: Only new drawing remains; all existing content discarded.

**`xor`**: Overlap regions transparent; non-overlapping regions stay.

### CSS Blend Modes

**`multiply`**: `B = Cs × Cb`. Always darkens. White neutral. Simulates layered ink.

**`screen`**: `B = 1 - (1-Cs)(1-Cb)`. Always lightens. Black neutral. Projected light, fog, glow.

**`overlay`**: Multiply on dark, screen on light. **Increases contrast**. Texture overlays, color grading.

**`darken`** / **`lighten`**: Per-channel min / max.

**`color-dodge`**: `B = Cb / (1-Cs)`. Intense blown-out highlights. **Lens flares, specular bursts**.

**`color-burn`**: `B = 1 - (1-Cb)/Cs`. Deep saturated shadows. Grunge textures.

**`hard-light`**: Multiply if source dark, screen if light. Dramatic directional lighting.

**`soft-light`**: Gentler hard-light. Subtle lighting adjustments.

**`difference`**: `B = |Cs - Cb|`. Identical colors → black. **Change detection**, psychedelic inversions.

**`exclusion`**: Lower-contrast difference.

**Non-separable modes** (operate on hue/saturation/luminosity): **`hue`**, **`saturation`**, **`color`** (ideal for **colorizing grayscale**), **`luminosity`** (brightness adjustments preserving color).

---

## 4. The Affine Transformation Matrix

All geometry passes through a **3×3 affine matrix** before rasterization:

```
| a  c  e |     x' = a·x + c·y + e
| b  d  f |     y' = b·x + d·y + f
| 0  0  1 |
```

`a`/`d` = scaling, `b`/`c` = skewing, `e`/`f` = translation. Identity: `[1, 0, 0, 1, 0, 0]`.

### Convenience Methods

`translate(x, y)`, `rotate(angle)` (radians, clockwise), `scale(sx, sy)` — each **post-multiply** the current matrix. Negative scale mirrors.

`transform(a, b, c, d, e, f)` — post-multiply arbitrary matrix.
`setTransform(a, b, c, d, e, f)` or `setTransform(domMatrix)` — **replace** current matrix.
`resetTransform()` — restore identity.
`getTransform()` — returns live `DOMMatrix`.

**Order matters.** To rotate around `(cx, cy)`:
```js
ctx.translate(cx, cy);
ctx.rotate(angle);
ctx.translate(-cx, -cy);
```

### DOMMatrix

`DOMMatrix` (mutable) and `DOMMatrixReadOnly` (immutable). Constructor accepts 6 values (2D), 16 values (3D), or CSS transform string. Key methods: `multiply()`, `translate()`, `scale()`, `rotate()` (angles in **degrees**), `inverse()`, `transformPoint()`.

A practical **camera/viewport** system: store camera position and zoom, apply via `setTransform()`, convert screen↔world via `getTransform().inverse().transformPoint()`.

---

## 5. Pixel Manipulation

### ImageData and Uint8ClampedArray

`getImageData(sx, sy, sw, sh)` reads pixels into `ImageData`. `data` property is `Uint8ClampedArray` laid out as `[R, G, B, A, R, G, B, A, ...]` in row-major order, **4 bytes per pixel**. Length = `width × height × 4`.

```js
const i = (y * width + x) * 4;
const [r, g, b, a] = [data[i], data[i+1], data[i+2], data[i+3]];
```

`putImageData(imageData, dx, dy)` writes back, **ignoring** all context state. Optional dirty-rectangle overload available.

`createImageData(w, h)` creates blank (transparent black) ImageData. Constructor accepts `colorSpace` (`"srgb"` or `"display-p3"`).

### willReadFrequently Optimization

```js
const ctx = canvas.getContext('2d', { willReadFrequently: true });
```

Uses **CPU-based software rasterization**, avoiding expensive GPU→CPU readback. Chrome disables GPU acceleration after just **2 readback operations** on non-hinted canvas. Use for metaball renderers, image processors, any code calling `getImageData()` in loops. Tradeoff: draw commands slower (CPU vs GPU).

### Convolution Kernels

Slide N×N kernel over image, compute weighted sum per pixel. Output to **separate buffer** to avoid artifacts.

**Common 3×3 kernels:**

| Effect | Kernel | Sum |
|---|---|---|
| Sharpen | `[0,-1,0, -1,5,-1, 0,-1,0]` | 1 |
| Box blur | all 1/9 | 1 |
| Sobel X (vertical edges) | `[-1,0,1, -2,0,2, -1,0,1]` | 0 |
| Sobel Y (horizontal edges) | `[-1,-2,-1, 0,0,0, 1,2,1]` | 0 |
| Laplacian (all edges) | `[0,1,0, 1,-4,1, 0,1,0]` | 0 |
| Emboss | `[-2,-1,0, -1,1,1, 0,1,2]` | 1 |

**Gaussian blur** is separable: decompose 2D kernel into two 1D passes (horizontal then vertical), reducing O(N²) to O(2N). Generate 1D kernel from `G(x) = e^(-x²/(2σ²))`, normalize to sum 1.

**Sobel edge detection**: compute horizontal/vertical gradients separately, combine: `magnitude = √(Gx² + Gy²)`. Use `Float32Array` for intermediates.

Other per-pixel operations: **grayscale** (CIE luminance: `0.2126R + 0.7152G + 0.0722B`), **contrast**, **saturation**, **threshold**, **sepia**, **noise**.

---

## 6. Clipping, Shadows, and the Filter Property

### Clipping

`clip()` turns current path into clipping region. Supports `'nonzero'` and `'evenodd'` fill rules and `Path2D` objects. **Clipping can only shrink** — successive `clip()` calls intersect. Only way to "expand" is `restore()` to a `save()`'d state. Essential `save()`/`restore()` bracketing:

```js
ctx.save();
ctx.beginPath();
ctx.arc(100, 75, 50, 0, Math.PI * 2);
ctx.clip();
// clipped drawing here
ctx.restore(); // clip reverts
```

For **soft-edge masking**, compositing modes like `destination-in` are more flexible than `clip()`.

### Shadows

`shadowColor`, `shadowBlur` (Gaussian radius), `shadowOffsetX`, `shadowOffsetY`. Offsets = 0 with high `shadowBlur` and bright color = **symmetrical glow**. Layer with `lighter` compositing for **neon tube** effects.

Shadows are **expensive** — pre-render to offscreen canvas, then `drawImage()` cached result each frame.

### CSS Filters on Canvas

```js
ctx.filter = 'blur(4px) brightness(150%) contrast(200%)';
```

Supported: `blur()`, `brightness()`, `contrast()`, `grayscale()`, `hue-rotate()`, `invert()`, `opacity()`, `saturate()`, `sepia()`, `drop-shadow()`, `url()` for SVG filter references. Filters chain left-to-right. Reset with `ctx.filter = 'none'`.

The `url()` function references SVG `<filter>` definitions enabling **displacement maps**, **procedural turbulence**, **morphology**, **custom convolution**, **lighting effects**, and arbitrary filter graphs.

**Critical caveat**: Safari does not support `ctx.filter` as of Safari 26.x. ~82% global support. The one major Canvas 2D feature that remains non-baseline.

---

## 7. Image Drawing, OffscreenCanvas, and Export

### drawImage — Three Overloads

```js
drawImage(image, dx, dy)                                            // position
drawImage(image, dx, dy, dWidth, dHeight)                           // scale
drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)  // crop + scale
```

Accepts: `HTMLImageElement`, `HTMLCanvasElement`, `HTMLVideoElement`, `ImageBitmap`, `OffscreenCanvas`, `SVGImageElement`, `VideoFrame`. Cross-origin images without CORS headers **taint** the canvas.

`imageSmoothingEnabled` (default `true`) — set `false` for **pixel art**. `imageSmoothingQuality`: `'low'`, `'medium'`, `'high'`.

### OffscreenCanvas

`new OffscreenCanvas(width, height)` creates detached canvas. `canvas.transferControlToOffscreen()` transfers DOM canvas to worker control.

```js
// Main thread
const offscreen = document.querySelector('canvas').transferControlToOffscreen();
const worker = new Worker('render.js');
worker.postMessage({ canvas: offscreen }, [offscreen]);

// render.js (worker)
onmessage = ({ data }) => {
  const ctx = data.canvas.getContext('2d');
  function frame() {
    ctx.clearRect(0, 0, data.canvas.width, data.canvas.height);
    // draw
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};
```

`transferToImageBitmap()` performs **zero-copy transfer**. OffscreenCanvas: full cross-browser (Safari 17+), ~96% global availability.

### Export

`canvas.toDataURL(type?, quality?)` — synchronous base64 data URL. Types: `image/png`, `image/jpeg`, `image/webp`.

`canvas.toBlob(callback, type?, quality?)` — async binary Blob (~33% smaller than base64).

`offscreenCanvas.convertToBlob(options?)` — returns `Promise<Blob>`, works in workers.

---

## 8. Path2D, State Management, reset()

### Path2D

`new Path2D()` — empty. `new Path2D(svgPathString)` — parses SVG path data. `new Path2D(otherPath)` — deep copy. All path methods available. `addPath(path, transform?)` combines paths.

Works with `fill(path)`, `stroke(path)`, `clip(path)`, `isPointInPath(path, x, y)`, `isPointInStroke(path, x, y)`.

### save/restore State Stack

`save()` pushes **entire drawing state**: transform, clip, dash list, all style properties (fillStyle, strokeStyle, globalAlpha, globalCompositeOperation, lineWidth, lineCap, lineJoin, miterLimit, shadows, font, text properties, imageSmoothingEnabled/Quality, filter, letter/word spacing, fontKerning, fontStretch, fontVariantCaps, textRendering, lineDashOffset). **Not saved**: current path and bitmap contents.

`restore()` pops and restores top entry. Stack is unlimited.

### reset()

`ctx.reset()` clears backing buffer, empties state stack, resets all paths, restores every property to default. More thorough than `clearRect()`. More efficient than the old `canvas.width = canvas.width` trick. Baseline since December 2023.

---

## 9. Performance Patterns

### Batch by State

Every `fillStyle`, `strokeStyle`, `lineWidth`, `font`, or transform change flushes the internal draw buffer. **Sort draw operations by state**: all red shapes, then all blue, rather than alternating.

### Integer Coordinates

Drawing at fractional positions forces per-pixel interpolation. Use `Math.round()`. For crisp 1px lines, offset by 0.5.

### DevicePixelRatio Handling

```js
const dpr = Math.min(window.devicePixelRatio, 2);
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
canvas.style.width = `${rect.width}px`;
canvas.style.height = `${rect.height}px`;
ctx.scale(dpr, dpr);
```

iPhone `devicePixelRatio = 3` means **9× pixels**. Cap at 2× for performance. A 4096×4096 canvas = **64 MB**. iOS Safari enforces **384 MB total** and ~4096×4096 per-canvas max.

### Offscreen Pre-Rendering and Layered Canvases

Render complex static content to offscreen canvas once, `drawImage()` each frame. Stack `<canvas>` elements with `position: absolute` for layers. Disable unused alpha: `getContext('2d', { alpha: false })`.

### requestAnimationFrame with Fixed Timestep

Never assume fixed frame rate. Use timestamp for delta-time, fixed timestep with accumulator for physics, interpolation for rendering. Cap delta (`Math.min(dt, 0.1)`).

### ImageBitmap

`createImageBitmap()` decodes images **off main thread**. Immutable, transferable to workers, explicitly released with `close()`. Use for static sprites/atlases.

---

## 10. Creative Rendering Techniques

### Metaballs via Distance-Field Thresholding

Sum `radius²/distance²` from every ball center per pixel. Where sum exceeds threshold (~1.0), pixel is inside. Produces organic merging. Faster variant: radial gradients with `lighter` compositing, then threshold alpha via `getImageData`. Use `willReadFrequently: true`.

### Particle Systems with Additive Blending

Particles: position, velocity, life, size. Render with `lighter` for fire/sparks/magic. Use **object pooling** to avoid GC. For 1000+ particles, spatial indexing (quadtree/spatial hash).

### SDF 2D Ray Marching

Signed Distance Functions return distance to nearest surface. CSG: `union = min(d1, d2)`, `intersection = max(d1, d2)`, `subtraction = max(d1, -d2)`, smooth union via `smoothMin`. Color based on distance.

### Per-Pixel Normal Mapping and Lighting

Decode normal map (R,G → X,Y mapped [0,255]→[-1,1], B → Z), compute dot product with light direction for Lambertian diffuse, apply distance attenuation. O(width × height) per frame.

### Bloom via Multi-Canvas Compositing

Render bright elements → extract above luminance threshold → Gaussian blur on separate canvas → composite with `lighter` or `screen`.

### Motion Blur via Accumulation

Instead of clearing, overlay semi-transparent background (`globalAlpha = 0.1`). Objects leave fading trails. Lower alpha = longer trails.

### Procedural Noise and Terrain

Perlin/simplex noise with FBM (fractal Brownian motion): stack octaves with halving amplitude and doubling frequency. Map to biome thresholds. Third noise dimension = time for animation.

### Fluid Simulation (Navier-Stokes)

Jos Stam's "Stable Fluids": density + velocity grid. Per frame: add sources, diffuse, project (divergence-free), advect. Render density as brightness via `putImageData`. 64×64 grid at 40-60 FPS in pure JS.

### Color Grading via 3D LUT

64³ lookup table as 512×512 image (8×8 grid of 64×64 tiles). For each pixel: compute LUT coordinates from original color, sample LUT, write result. Cinematic color grading in pure Canvas 2D.

---

## 11. API Surface Summary — Feature Baseline Table

| Feature | Chrome | Firefox | Safari | Baseline |
|---|---|---|---|---|
| `roundRect()` | 99+ | 112+ | 16+ | Widely available (Apr 2023) |
| `createConicGradient()` | 99+ | 113+ | 16.2+ | Widely available (Mar 2023) |
| `reset()` | 99+ | 113+ | 17.2+ | Newly available (Dec 2023) |
| `letterSpacing` / `wordSpacing` | 99+ | 115+ | 18.4+ | Newly available (Mar 2025) |
| `fontKerning` / `fontStretch` / `fontVariantCaps` | 99+ | 115+ | 18.4+ | Newly available (Mar 2025) |
| `textRendering` | 99+ | 116+ | 18.4+ | Newly available (2025) |
| Extended TextMetrics baselines | 118+ | 116+ | 17.4+ | 2024 |
| OffscreenCanvas (full 2D) | 69+ | 105+ | 17+ | Widely available |
| `ctx.filter` | 52+ | 49+ | **Not supported** | Not baseline (Safari gap) |

The `ctx.filter` property remains the **single most significant gap** — Safari's absence keeps it from baseline despite ~82% global coverage.

The Canvas 2D API occupies a unique position: fast enough for real-time animation, low-level enough for per-pixel shaders, and universally supported enough to run everywhere without polyfills. Its immediate-mode model trades retained-mode convenience for raw performance and pixel-level control.
