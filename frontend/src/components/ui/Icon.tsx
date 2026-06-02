// Centralized SVG icon library. All icons accept a `size` prop and inherit
// color from the parent via `currentColor`. Add new icons here rather than
// inlining SVG markup in components.

import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
}

function svgProps(size: number): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
}

export function ArrowRightIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function DownloadIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function SearchIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function HeartIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function PackageIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function BrainIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
  );
}

export function CodeIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="12" y1="2" x2="12" y2="22" opacity="0.15" />
    </svg>
  );
}

export function Code2Icon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
      <path d="M6 12h4m-2-2v4m7-2h.01M19 10h.01" strokeWidth={2} />
    </svg>
  );
}

export function CubeIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function AlertIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function CloseIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...svgProps(size)} {...rest}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SpinnerIcon({ size = 24, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      style={{
        animation: 'dzd-spin 0.8s linear infinite',
      }}
      aria-hidden="true"
      {...rest}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
