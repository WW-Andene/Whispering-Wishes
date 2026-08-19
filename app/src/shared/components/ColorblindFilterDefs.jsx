// ═══════════════════════════════════════════════════════════════════════════════
// WHISPERING WISHES — shared/components/ColorblindFilterDefs.jsx (extracted from App.jsx)
// SVG filter for colorblind mode — deuteranopia-safe color remapping. Static
// markup, no props; referenced by id (#cb-deuteranopia) via a CSS filter.
// ═══════════════════════════════════════════════════════════════════════════════

export function ColorblindFilterDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="cb-deuteranopia" colorInterpolationFilters="linearRGB">
          <feColorMatrix type="matrix" values="0.625 0.375 0    0 0
                                                0.7   0.3   0    0 0
                                                0     0.3   0.7  0 0
                                                0     0     0    1 0" />
        </filter>
      </defs>
    </svg>
  );
}
