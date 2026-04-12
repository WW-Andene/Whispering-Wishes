# The Complete Study of Clouds for 2D Canvas Rendering

A comprehensive reference for procedural cloud generation, covering meteorological morphology, shape rhetoric and proportions, material and optical properties, lighting models, mathematical frameworks, and their direct translation to the HTML5 Canvas 2D API.

---

## I. Cloud Morphology — The Shape Vocabulary

### The Four Fundamental Forms

All clouds derive from combinations of four Latin root-forms that describe their physical shape and behavior:

**Cumulus** ("heap/pile") — Detached, vertically developed clouds with sharp outlines. Flat horizontal bases, rounded or cauliflower-like tops. Formed by thermal convection (rising warm air parcels). The archetypal "puffy cloud."

**Stratus** ("layer/sheet") — Uniform, horizontal, sheet-like clouds with diffuse bases. Formed by widespread gentle lifting or radiational cooling. Fog is stratus at ground level.

**Cirrus** ("hair/fiber") — Thin, wispy, filament-like clouds at high altitude. Composed of ice crystals. The "mare's tail" wisps that trail downward. Formed by wind shear acting on ice crystal precipitation.

**Nimbus** ("rain") — Not a shape but a modifier: any cloud producing precipitation. Always combined with another form (cumulonimbus, nimbostratus).

### The Ten Genera and Their Shape Properties

Clouds are classified into 10 genera by combining form and altitude. Each genus has distinct geometric properties that matter for rendering:

**High-level (5–13 km) — Ice crystals**

| Genus | Shape Character | Rendering Geometry |
|---|---|---|
| Cirrus (Ci) | Thin filaments, hooks, wisps | Spline curves, transparency gradients, directional streaks |
| Cirrocumulus (Cc) | Tiny rippled patches, scales | Small repeated elements in grid/wave patterns |
| Cirrostratus (Cs) | Uniform translucent veil | Full-screen semi-transparent layer with halo artifacts |

**Mid-level (2–7 km) — Mixed water/ice**

| Genus | Shape Character | Rendering Geometry |
|---|---|---|
| Altocumulus (Ac) | Patchy rounded masses, rolls | Tessellated array of medium ellipsoids, grouped |
| Altostratus (As) | Gray uniform sheet | Flat layer with subtle thickness variation |
| Nimbostratus (Ns) | Thick dark featureless sheet | Dense opaque layer, diffuse base, precipitation shafts |

**Low-level (0–2 km) — Water droplets**

| Genus | Shape Character | Rendering Geometry |
|---|---|---|
| Cumulus (Cu) | Puffy, flat base, dome top | Metaball clusters, ellipsoid stacks |
| Stratocumulus (Sc) | Globular masses, merged rolls | Tessellated bumpy sheet, merged blobs |
| Stratus (St) | Flat uniform gray sheet | Simple gradient layer |

**Multi-level (0–13 km)**

| Genus | Shape Character | Rendering Geometry |
|---|---|---|
| Cumulonimbus (Cb) | Towering mountain/anvil | Tall metaball stack, flattened anvil top, dark base |

### Species Define Proportions

Within cumulus alone, species classify the width-to-height aspect ratio — the single most important proportion for believable cloud rendering:

**Cumulus humilis** — Wider than tall. Aspect ratio ~2:1 to 3:1 (width:height). Flattened puffs. Fair weather. This is the "default" cloud most people draw.

**Cumulus mediocris** — Roughly as wide as tall. Aspect ratio ~1:1. Moderate dome tops with small protuberances. Transitional form.

**Cumulus congestus** — Taller than wide. Aspect ratio ~1:1.5 to 1:3. Towering cauliflower structure. Strong updrafts. Precursor to thunderstorms.

**Cumulus fractus** — Ragged, irregular shreds. No consistent aspect ratio. Torn edges, chaotic geometry. Appears in precipitation or as early-morning precursors.

A typical fair-weather cumulus has horizontal and vertical dimensions of ~1–2 km. Large cumulonimbus bases span several kilometers across with tops reaching 12–20 km altitude.

---

## II. Shape Rhetoric — The Language of Cloud Construction

### Constructive Anatomy of a Cumulus Cloud

A cumulus cloud is not a single blob. It is a **hierarchy of convective cells** — thermal bubbles that rise, cool, condense, and mushroom outward. Understanding this anatomy produces convincing procedural shapes:

**1. The Flat Base**
All cumulus clouds share a remarkably flat, horizontal base. This occurs at the **Lifting Condensation Level (LCL)** — the altitude where rising air reaches 100% humidity and water vapor begins to condense. Because all thermals in a given region share roughly the same temperature and moisture content, they all reach saturation at the same altitude. The base is darker than the rest of the cloud because light is attenuated passing through the full thickness above.

*Rendering implication:* The bottom boundary of any cumulus-type cloud should be a clean horizontal cutoff, not rounded. This is one of the most common mistakes in procedural cloud generation.

**2. The Dome Summit**
The top of a cumulus is an actively growing region where fresh thermal bubbles push upward. Each bubble creates a rounded protuberance — the "cauliflower" texture. Older bubbles get pushed aside and evaporate at the edges, while newer bubbles emerge from the center.

*Rendering implication:* The top should be composed of overlapping spheroid lobes of decreasing size. The largest, freshest lobe is at the very top center. Older, partially evaporated lobes descend along the flanks.

**3. The Flanks and Edges**
Cloud edges are where evaporation occurs. The boundary between cloud and clear air is a mixing zone. Thin edges are semi-transparent. Thick cores are opaque. The transition is not a hard cutoff but a density gradient — steep near the core, asymptotically approaching zero at the visible boundary.

*Rendering implication:* Edge density should follow an exponential falloff from the core. The "metaball" approach (summing distance-field contributions from multiple centers) naturally produces this merged, organic boundary.

**4. The Internal Structure**
Clouds are not uniformly dense. They contain pockets of higher and lower density created by turbulent mixing, updraft channels, and precipitation. The density at any point is a function of distance from cell centers, altitude within the cloud, and turbulent noise.

### Shape Construction Hierarchies

Convincing clouds emerge from a **multi-scale construction**:

| Scale | What It Represents | Generation Method |
|---|---|---|
| Macro (cloud-level) | Overall silhouette, aspect ratio | Bounding ellipsoid or metaball cluster envelope |
| Meso (lobe-level) | Major convective domes, the "cauliflower" bumps | Primary metaball array: 3–8 large spheres |
| Micro (detail-level) | Surface turbulence, wispy edges, small protuberances | FBM noise displacement or small secondary metaballs |
| Fractus (fragment-level) | Detached wisps, ragged edges | Isolated small blobs at cloud periphery |

Each scale operates at roughly 1/3 to 1/2 the size of the scale above it. This self-similar nesting is not coincidental — it reflects the fractal nature of turbulent convection.

### The Rhetoric of Cloud Grouping

Clouds rarely appear alone. Their spatial arrangement follows meteorological patterns:

**Cloud streets** — Parallel rows of cumulus aligned with wind direction. Spacing is roughly 2–3× the cloud depth. Caused by helical roll vortices in the boundary layer.

**Clusters** — Groups of 3–7 cumulus sharing a common convective source. One dominant "parent" cloud surrounded by smaller "child" clouds at 1–3 cloud-widths distance.

**Fields** — Vast arrays of similarly-sized stratocumulus or altocumulus in tessellated patterns. Element spacing is regular but not perfectly uniform.

**Anvil shadows** — Large cumulonimbus cast shadows on lower cloud decks, creating dark patches in an otherwise uniform field.

For a sunset scene like your cloud-demo.jsx, the most natural arrangement is **clustered cumulus at multiple distances** — exactly the hierarchical parent-child-wisp structure you've already implemented.

---

## III. Material Properties — What Clouds Are Made Of

### Physical Composition

A cloud is a suspension of water droplets (or ice crystals) in air. The key physical parameters:

**Droplet size:** Typical cloud droplets range from 5–25 micrometers in diameter. This is comparable to the wavelength of visible light (0.4–0.7 μm), placing cloud optics firmly in the **Mie scattering** regime (size parameter x = 2πr/λ ≈ 30–200).

**Droplet concentration:** 100–300 droplets per cubic centimeter for continental clouds; 50–100 per cm³ for maritime clouds.

**Liquid water content (LWC):** Typically 0.1–0.3 g/m³ for fair-weather cumulus, up to 3 g/m³ for vigorous cumulonimbus.

**Optical depth (τ):** The cumulative measure of how opaque a cloud is along a given path. A thin cirrus has τ ≈ 0.5–3. A thick cumulus has τ ≈ 20–100+. Optical depth determines whether a cloud appears white (τ < ~10, multiple scattering still exits all sides) or dark gray (τ > ~50, most light is absorbed or scattered back before penetrating through).

### Why Clouds Are White (and Sometimes Gray)

In Mie scattering, particles comparable in size to visible wavelengths scatter **all wavelengths approximately equally** — unlike Rayleigh scattering (which makes the sky blue). This wavelength-independent scattering is why clouds appear white.

The grayness of cloud bases comes from **optical thickness**, not color. Light entering the cloud top is scattered many times before reaching the base. Each scattering event redirects some light sideways or upward. By the time light reaches the bottom, much of its energy has been redirected. The base receives less light and appears darker.

### The Single Scattering Albedo

For visible wavelengths (λ < 0.7 μm), the imaginary part of water's refractive index is nearly zero — meaning cloud droplets absorb almost no visible light. The **single scattering albedo** ω ≈ 0.999+ for visible light. Clouds are among the most purely scattering media in nature. The tiny amount of absorption that does occur is why very thick cumulonimbus clouds can appear very dark gray rather than pure white.

---

## IV. Lighting — How Light Interacts with Clouds

### The Three Lighting Regimes

Cloud lighting can be decomposed into three distinct physical contributions, each requiring different rendering strategies:

**1. Single Scattering (Direct Illumination)**
Light from the sun enters the cloud, scatters off one droplet, and exits toward the observer. This is the dominant contribution for thin cloud edges and the sunlit face. It follows the **Henyey-Greenstein phase function** and the **Beer-Lambert attenuation** law.

**2. Multiple Scattering (Diffuse Interior)**
Light bounces many times inside the cloud before exiting. After 3+ scattering events, the directional information is lost and light becomes nearly **isotropic** (uniform in all directions). This fills the cloud interior with soft, diffuse illumination and is why even the shadow side of a thick cloud isn't completely black. Higher-order scattering tends toward isotropic distribution.

**3. Transmitted Light (Silver Lining / Backlighting)**
When the sun is behind a cloud, light passes through thin edges and appears as a brilliant rim — the "silver lining." This is forward-scattered light following the strong forward peak of the Mie phase function.

### The Henyey-Greenstein Phase Function

The phase function P(θ) describes how light is distributed after a scattering event, where θ is the angle between incoming and outgoing light directions:

```
P_HG(θ) = (1 - g²) / (4π · (1 + g² - 2g·cos(θ))^(3/2))
```

The **asymmetry parameter g** controls the shape:
- g = 0: Isotropic scattering (equal in all directions)
- g > 0: Forward scattering (light continues roughly in its original direction)
- g < 0: Backscattering

For cloud droplets in visible light, **g ≈ 0.85–0.87**. This means over 90% of scattered energy goes in roughly the forward direction. This extreme forward scattering is what produces:
- The **silver lining** around backlit clouds
- **Glory** rings (colored rings around the antisolar point)
- The overall brightness of clouds seen from the sunward side

For practical rendering, a **dual-lobe** Henyey-Greenstein provides better approximation:

```
P(θ) = w · P_HG(θ, g_forward) + (1 - w) · P_HG(θ, g_back)
```

Typical values: g_forward ≈ 0.85, g_back ≈ -0.5, w ≈ 0.7. This captures both the strong forward peak and the weak backward scattering lobe.

### Beer-Lambert Attenuation

As light travels through a participating medium, its intensity decreases exponentially:

```
T(d) = e^(-σ · d)
```

Where:
- T(d) is the transmittance (fraction of light remaining) after distance d
- σ is the **extinction coefficient** (proportional to droplet density × scattering cross-section)
- d is the path length through the medium

For rendering, this means:
- **Thin cloud edges:** High transmittance → bright, allowing sunlight through
- **Deep cloud interiors:** Low transmittance → dark, light is scattered away
- **The cloud base:** Light entering from the top must traverse the full cloud thickness

The "powder" effect (bright thin edges contrasting with dark thick centers) comes directly from Beer-Lambert: transmittance changes rapidly near the surface where the path length increases quickly.

### The Beer-Powder Approximation

A refinement used in real-time cloud rendering combines Beer's law with a "powder" term to capture the brightening at thin edges:

```
energy = 2 · e^(-d·σ) · (1 - e^(-2·d·σ))
```

The first term is standard Beer attenuation. The second term adds brightness at thin regions where d is small. The product peaks at intermediate thickness and falls off for both very thin and very thick regions.

### Sunset and Golden Hour Coloring

At low sun angles, sunlight traverses a longer atmospheric path before reaching clouds, causing:
1. **Rayleigh scattering** removes blue/violet wavelengths preferentially (∝ λ⁻⁴)
2. Remaining light is enriched in red/orange/yellow
3. The sunlit face of clouds takes on warm colors
4. The shadow side, illuminated by scattered blue skylight, takes on cool blue-gray tones

The color gradient across a cloud at sunset:
- **Sun-facing side:** Brilliant warm orange/gold (direct low-angle sunlight)
- **Top:** White to warm yellow (overhead sky + direct light)
- **Shadow side:** Blue-gray to deep purple (skylight only, no direct sun)
- **Base:** Dark warm gray (attenuated transmitted light)
- **Edges against sun:** Brilliant rim (forward-scattered warm light)

This is the palette your cloud-demo.jsx is targeting with its depth-dependent color mixing.

---

## V. Mathematical Frameworks for Cloud Generation

### Noise Functions — The Foundation

All procedural cloud generation starts with **noise** — deterministic pseudorandom functions that produce smooth, continuous values from spatial coordinates.

**Value Noise:** Interpolates random values at grid points. Cheap but produces visible grid artifacts. Each grid cell contains a random scalar; the function interpolates between them (bilinear in 2D, trilinear in 3D). Smooth but lacks the organic character of gradient noise.

**Perlin Noise:** Assigns random **gradient vectors** at grid points, then computes dot products between these gradients and displacement vectors. Produces naturally organic variation without grid artifacts. The standard for terrain and clouds since Ken Perlin's 1983 paper. Bandwidth is concentrated around spatial frequency 1.

**Simplex Noise:** Perlin's 2001 improvement. Uses a simplex grid (equilateral triangles in 2D, tetrahedra in 3D) instead of a hypercube grid. Lower computational cost (O(n²) vs O(2ⁿ)), fewer directional artifacts, and better visual isotropy. Preferred for real-time applications.

**Worley/Cellular Noise:** Scatters random feature points in space. For each position, computes the distance to the closest N feature points. Produces cell-like patterns that resemble the lumpy, tessellated structure of stratocumulus and altocumulus clouds. The F2–F1 variant (distance to second-closest minus closest) produces particularly cloud-like boundaries.

### Fractal Brownian Motion (FBM) — Multi-Scale Detail

FBM layers multiple octaves of noise at different frequencies and amplitudes to produce self-similar detail at all scales:

```
fbm(p) = Σ (amplitude_i · noise(p · frequency_i))
```

Where for each octave i:
- frequency_i = frequency_0 · lacunarity^i
- amplitude_i = amplitude_0 · gain^i (also called "persistence")

Standard parameters:
- **Lacunarity** (frequency multiplier per octave): 2.0
- **Gain/Persistence** (amplitude multiplier per octave): 0.5
- **Octaves:** 4–8 (more = finer detail but higher cost)

The result has **spectral power ∝ 1/f^β** (pink/brown noise), which matches the turbulent energy cascade observed in real atmospheric convection. The β parameter is controlled by the gain: β = -log(gain)/log(lacunarity).

For clouds specifically:
- 4 octaves: Billowy macro-shape, suitable for distant clouds
- 6 octaves: Detailed surface texture, good for mid-distance
- 8 octaves: Fine wispy edges, needed only for close-up hero clouds

### Turbulence vs. FBM

**Turbulence** is the absolute-value variant of FBM:

```
turbulence(p) = Σ |amplitude_i · noise(p · frequency_i)|
```

The absolute value creates sharp ridges at zero-crossings, producing a more "veiny" or "billowy" texture that resembles certain cloud formations more accurately than smooth FBM.

### Domain Warping — Organic Distortion

Feeding noise into itself (using noise output as input coordinates for another noise evaluation) produces **domain warping**, which creates the organic, swirling distortions seen in real cloud formations:

```
warped(p) = fbm(p + fbm(p + fbm(p)))
```

Each level of nesting adds another layer of organic distortion. This technique is extremely effective for producing the curling, billowing edges of cumulus clouds and the stretched, fibrous texture of cirrus.

### The Density Field Construction

Combining shape geometry with noise produces the cloud density field:

```
density(p) = max(0, shape(p) - threshold + noise_amplitude · fbm(p))
```

Where:
- **shape(p):** The base shape function — distance from metaball centers, or distance below a height ceiling, or distance inside a bounding ellipsoid
- **threshold:** Controls cloud coverage (higher = fewer/smaller clouds)
- **noise_amplitude:** Controls how much the noise can erode or extend the base shape
- **fbm(p):** Multi-octave noise providing detail

The `max(0, ...)` clamp ensures density is never negative.

For your metaball-based approach in cloud-demo.jsx, the shape function is the sum of `r²/d²` contributions from each ball center — exactly the right foundation. The density baking in `bakeDensity()` follows this pattern, with radial gradients serving as the shape envelope per ball.

### Signed Distance Fields for Cloud Shells

An alternative to metaballs is the **SDF approach**, where the base cloud shape is defined as a signed distance function:

```
sdEllipsoid(p, center, radii) = length((p - center) / radii) - 1.0
```

The SDF returns negative values inside the shape, zero at the surface, and positive outside. Cloud density is then:

```
density = max(0, -sdf + noise_amplitude · fbm(p))
```

Multiple SDFs combine via smooth-minimum for organic merging:

```
smoothMin(a, b, k) = -log(e^(-k·a) + e^(-k·b)) / k
```

This produces the same kind of merged-blob aesthetic as metaballs but with more explicit control over individual cloud element shapes.

---

## VI. Translation to Canvas 2D — Implementation Architecture

### Mapping 3D Concepts to 2D Canvas

Your cloud-demo.jsx already implements a sophisticated 2D cloud renderer. Here is how each physical concept maps to the Canvas 2D API and where the existing implementation sits relative to the theoretical ideal:

### Density Field → Offscreen Canvas + Radial Gradients

**Theory:** Cloud density is a continuous 3D scalar field.

**2D Translation:** Flatten to 2D by projecting density along the viewing axis. Each metaball center contributes a radial gradient of density that falls off with distance. The `globalCompositeOperation = 'lighter'` (additive blending) sums overlapping contributions — directly implementing the metaball field equation `Σ(r_i²/d_i²)`.

**Your implementation:** `bakeDensity()` does exactly this. Each ball draws a radial gradient in grayscale using `lighter` compositing on an offscreen canvas. The resulting pixel values represent accumulated density.

**Enhancement opportunities:**
- **FBM noise modulation:** After baking the base density, read back with `getImageData`, multiply each pixel's density by an FBM noise value evaluated at that pixel's world position. This adds the turbulent detail missing from pure metaballs.
- **Altitude-dependent density:** Multiply density by a vertical gradient that reduces density toward the base (simulating the flat-base effect) and toward the top edges (simulating evaporation).

### Normal Computation → Sobel-like Gradient Estimation

**Theory:** Surface normals at each point on the cloud are computed from the density gradient: `n = -∇density / |∇density|`.

**2D Translation:** Compute finite-difference gradients from the density buffer: sample density at neighboring pixels (px±1, py±1) and compute the gradient vector. This is a Sobel-like convolution kernel applied to the density image.

**Your implementation:** `lightCloud()` computes normals using a wider 3px kernel `(getD(px+2,py) + 2·getD(px+1,py)) - (getD(px-2,py) + 2·getD(px-1,py))` — a Sobel-like operator that produces smooth gradients. This is correct and effective.

**Enhancement opportunity:** The kernel width could be depth-dependent — wider kernels for distant clouds (smoother, softer normals) and narrower kernels for nearby clouds (sharper detail). This simulates depth-of-field and atmospheric perspective.

### Lighting → Per-Pixel Dot Product

**Theory:** Lambertian diffuse lighting computes brightness as `max(0, N · L)` where N is the surface normal and L is the light direction.

**2D Translation:** For each density pixel with a valid normal, compute `N · sunDirection`. Map the resulting [-1, 1] range to a brightness value and use it to interpolate between shadow color and lit color.

**Your implementation:** `lightCloud()` computes `ndotl = nx * sunDx + ny * sunDy` and maps it to a `sunFacing` value used to interpolate between shadow (sR,sG,sB) and lit (lR,lG,lB) colors. The rim lighting (`rimStr`) adds the silver-lining effect at thin cloud edges.

**Enhancement opportunities:**
- **Henyey-Greenstein phase:** Instead of a simple linear remap of `ndotl`, apply the HG phase function: `P(θ) = (1 - g²) / (1 + g² - 2g·cos(θ))^1.5`. This would produce a brighter forward-scattering peak (silver lining) and more accurate angular distribution.
- **Depth-dependent ambient:** Thicker cloud regions should receive more multiple-scattered diffuse light (brighter ambient). Currently, internal flat regions get `surfLight *= 0.4`, which is in the right spirit but could be modulated by local density.

### Transmittance → Alpha Channel

**Theory:** Beer-Lambert transmittance `T = e^(-σd)` determines how much background is visible through the cloud.

**2D Translation:** The alpha channel of each cloud pixel represents transmittance. Thicker density → higher alpha (more opaque). Thin edges → lower alpha (more transparent).

**Your implementation:** `od[idx + 3] = Math.round(baseAlpha * (0.25 + thickness * 0.75) * 255)` maps thickness to opacity. The `baseAlpha` is depth-dependent (farther clouds are more transparent — atmospheric perspective).

**Enhancement opportunity:** Replace the linear thickness-to-alpha mapping with exponential Beer-Lambert: `alpha = 1 - e^(-absorption_coeff * thickness)`. This produces more physically accurate opacity falloff — rapid increase from transparent to opaque near the cloud edge, with diminishing returns for thicker regions.

### Color Grading → Depth-Dependent Palette

**Theory:** At sunset, sun-facing surfaces receive warm light, shadow sides receive cool skylight, and depth in the atmosphere attenuates and warms colors further.

**2D Translation:** Define shadow, lit, and rim colors as functions of cloud depth (distance from viewer) and proximity (distance from sun). Interpolate between them based on the lighting computation.

**Your implementation:** The `depth` and `proximity` parameters modulate shadow colors (sR,sG,sB), lit colors (lR,lG,lB), and rim colors (rR,rG,rB). Deeper clouds get more muted, darker colors. Closer-to-sun clouds get warmer rims. This is a solid approach.

**Enhancement opportunity:** Add a **conic gradient** (`createConicGradient`) centered on the sun position for the sky background. The existing linear gradient is correct vertically, but a radial warm-to-cool transition around the sun would add the characteristic "sun glow" that makes sunset skies feel three-dimensional.

### Shape Drift → Temporal Noise Offset

**Theory:** Clouds evolve through continuous evaporation and condensation driven by turbulent air motion.

**2D Translation:** Periodically perturb metaball positions by small sine/cosine offsets that change over time. This simulates the slow morphing of cloud shapes.

**Your implementation:** `refreshCloud()` applies sinusoidal drift to ball positions every 30 frames, then re-bakes the density. This is computationally efficient — rather than drifting every frame, it amortizes the expensive density bake across many render frames.

**Enhancement opportunity:** Instead of rigid sinusoidal drift (which can produce repetitive oscillation), use **time-varying noise** for the drift offsets: `dx = noise(ball_id, time * speed) * amplitude`. This produces non-repeating, organic shape evolution.

### Performance Architecture → Staggered Refresh

**Theory:** Full per-pixel density baking and lighting is expensive. Not every cloud needs to be updated every frame.

**2D Translation:** Update a subset of clouds per frame, cycling through all clouds over multiple frames. The visual impact is minimal because clouds change slowly.

**Your implementation:** 8 clouds are refreshed per frame (`rPerF = 8`), with the refresh index cycling through the entire cloud array. With a 50ms frame cap, this spreads the computational load evenly.

**Enhancement opportunities:**
- **Priority-based refresh:** Refresh large, nearby clouds more frequently than small, distant ones. Weight refresh priority by `baseRadius * proximity`.
- **Dirty flagging:** Only re-bake density when drift accumulation exceeds a threshold, rather than on a fixed count.
- **Resolution scaling:** Bake density at half resolution for distant clouds. The visual difference is imperceptible but halves the pixel count.

### Advanced Technique: CSS Filter Property for Post-Processing

Where supported (Chrome, Firefox — not Safari), the `ctx.filter` property enables GPU-accelerated post-processing:

```javascript
// Bloom pass: draw bright cloud edges to offscreen canvas
offCtx.filter = 'blur(8px) brightness(150%)';
offCtx.drawImage(mainCanvas, 0, 0);

// Composite bloom over main canvas
ctx.globalCompositeOperation = 'screen';
ctx.globalAlpha = 0.3;
ctx.drawImage(offCanvas, 0, 0);
```

This could add atmospheric bloom around bright cloud edges and the sun without per-pixel computation.

### Advanced Technique: OffscreenCanvas for Worker-Based Baking

The density baking and lighting passes are pure computation — they don't touch the DOM. Moving them to a Web Worker via `OffscreenCanvas` or pure `ImageData` manipulation would free the main thread entirely:

```javascript
// Main thread
const worker = new Worker('cloud-baker.js');
worker.postMessage({ balls, sunAngle, depth, proximity });

// Worker
onmessage = ({ data }) => {
  const density = bakeDensity(data.balls);
  const lit = lightCloud(density, data.sunAngle, data.depth, data.proximity);
  postMessage({ imageData: lit }, [lit.buffer]);
};
```

### Advanced Technique: Per-Pixel FBM via getImageData

To add turbulent detail to the metaball-based density field:

```javascript
const imgData = ctx.getImageData(0, 0, w, h);
const d = imgData.data;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const baseDensity = d[i]; // from metaball bake
    if (baseDensity < 10) continue;
    
    // World-space coordinates for noise evaluation
    const wx = (x + cloud.worldX) * 0.02;
    const wy = (y + cloud.worldY) * 0.02;
    
    // 4-octave FBM
    let noise = 0, amp = 0.5, freq = 1;
    for (let oct = 0; oct < 4; oct++) {
      noise += amp * perlin2d(wx * freq, wy * freq);
      freq *= 2; amp *= 0.5;
    }
    
    // Modulate density by noise
    const modulated = Math.max(0, baseDensity * (0.7 + 0.6 * noise));
    d[i] = d[i+1] = d[i+2] = modulated;
  }
}
ctx.putImageData(imgData, 0, 0);
```

This would use `willReadFrequently: true` on the density canvas for optimal performance.

---

## VII. Reference Data — Quick-Access Constants

### Cloud Dimensions (Typical Fair-Weather Cumulus, Temperate Latitude)

| Parameter | Value |
|---|---|
| Base altitude | 1,000–2,000 m |
| Vertical extent (humilis) | 500–1,000 m |
| Vertical extent (mediocris) | 1,000–2,000 m |
| Vertical extent (congestus) | 3,000–6,000 m |
| Horizontal width | Comparable to vertical extent |
| Droplet diameter | 5–25 μm |
| Droplet concentration | 100–300 per cm³ |
| Liquid water content | 0.1–0.3 g/m³ |
| Optical depth (thin Cu) | 5–20 |
| Optical depth (thick Cb) | 50–200+ |

### Scattering Parameters

| Parameter | Value |
|---|---|
| Mie asymmetry parameter g | 0.85–0.87 (visible) |
| Single scattering albedo ω | ~0.999 (visible) |
| HG forward lobe g | 0.85 |
| HG backward lobe g | -0.5 |
| Forward/backward weight w | 0.7 / 0.3 |

### Aspect Ratios for Rendering

| Species | Width : Height | Shape Character |
|---|---|---|
| Humilis | 2–3 : 1 | Flat pancake puffs |
| Mediocris | ~1 : 1 | Balanced domes |
| Congestus | 1 : 1.5–3 | Towering cauliflower |
| Fractus | Irregular | Ragged shreds |
| Stratocumulus | 5–10 : 1 | Wide merged rolls |
| Cirrus | 10–50 : 1 | Thin elongated wisps |

### FBM Parameters for Different Cloud Types

| Cloud Type | Octaves | Lacunarity | Gain | Character |
|---|---|---|---|---|
| Cumulus (billowy) | 5–6 | 2.0 | 0.5 | Classic puffy |
| Cirrus (wispy) | 3–4 | 2.5 | 0.4 | Stretched, thin |
| Stratocumulus (lumpy) | 4–5 | 2.0 | 0.6 | Flatter, merged |
| Cumulonimbus (turbulent) | 6–8 | 2.0 | 0.5 | Dense, violent detail |
| Fog/mist | 2–3 | 2.0 | 0.5 | Smooth, featureless |

### Sunset Color Palette (Approximate RGB for Key Zones)

| Zone | RGB Range | Description |
|---|---|---|
| Sun-facing surface | (255, 180–220, 100–140) | Warm gold to peach |
| Top surface | (240–255, 200–230, 160–190) | Soft warm white |
| Shadow side | (40–80, 30–60, 50–90) | Cool blue-gray to purple |
| Cloud base | (60–100, 40–70, 30–50) | Dark warm gray |
| Silver lining rim | (255, 200–240, 140–180) | Brilliant warm edge |
| Deep shadow | (15–30, 10–20, 15–30) | Near-black with warm tint |

---

## VIII. Synthesis — From Theory to Your Renderer

Your cloud-demo.jsx already implements a surprisingly physical pipeline:

1. **Metaball field** → density (bakeDensity)
2. **Gradient normals** → surface orientation (lightCloud)
3. **Directional dot product** → diffuse shading
4. **Thickness-based alpha** → transmittance
5. **Depth-dependent colors** → atmospheric perspective
6. **Rim detection** → silver lining approximation
7. **Staggered refresh** → performance management
8. **Temporal drift** → shape evolution

The key theoretical gaps — addressable within Canvas 2D without WebGL — are:

1. **FBM noise modulation** of the density field for turbulent detail
2. **Exponential (Beer-Lambert) alpha** instead of linear thickness mapping
3. **Henyey-Greenstein phase** instead of linear ndotl remapping
4. **Flat-base enforcement** via altitude-dependent density cutoff
5. **Aspect-ratio-aware** metaball placement (wider-than-tall for humilis)

Each of these is a localized change to the existing pipeline — not an architectural overhaul.
