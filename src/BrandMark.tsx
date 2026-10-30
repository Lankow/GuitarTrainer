import { useId } from 'react';
import { brandOutline, brandCutouts, brandRails, brandHole } from './brandGeometry';

/** Transparent, theme-colored tracing of the original guitar-pick proposal. */
export function BrandMark({ size = 34 }: { size?: number }) {
  const cutouts = useId();
  return <svg className="brand-icon" width={size} height={size} viewBox="180 130 894 994" fill="currentColor" aria-hidden="true" focusable="false">
    <defs>
      <mask id={cutouts} x="180" y="130" width="894" height="994" maskUnits="userSpaceOnUse" style={{ maskType: 'luminance' }}>
        <rect x="180" y="130" width="894" height="994" fill="white" />
        {/* Three channels open at the crown, separated by two string rails. */}
        <path fill="black" d={brandCutouts} />
        <circle cx={brandHole[0]} cy={brandHole[1]} r={brandHole[2]} fill="black" />
        <path fill="white" d={brandRails} />
      </mask>
    </defs>
    <path mask={`url(#${cutouts})`} d={brandOutline} />
  </svg>;
}
