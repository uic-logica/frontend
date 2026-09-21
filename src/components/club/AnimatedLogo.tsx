import type { CSSProperties } from "react";
import styles from "./AnimatedLogo.module.css";

function timing(start: number, duration: number): CSSProperties {
  return { "--segment-start": start, "--segment-duration": duration } as CSSProperties;
}

/** Server-rendered SVG; CSS draws once without hydration or animation JavaScript.
 * Branch timings are proportional to path length. Each node starts at branch
 * arrival and finishes at the internal phase boundary (66% of total duration).
 * Thick circular strokes reproduce the source artwork's solid endpoints.
 */
export function AnimatedLogo({ className = "", size = "100%", duration = 2350, delay = 0 }: {
  className?: string;
  size?: CSSProperties["width"];
  duration?: number;
  delay?: number;
}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${styles.logo} ${className}`} style={{ "--logo-size": typeof size === "number" ? `${size}px` : size, "--logo-duration": `${duration}ms`, "--logo-delay": `${delay}ms` } as CSSProperties} viewBox="100 80 1048 1064" width="400" height="406.107" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">
      <g className={styles.internal} strokeWidth="32" strokeLinejoin="round">
        <path data-part="foundation" d="M624 1112 L650 1112" pathLength="1" style={timing(0, 0.023215)}/>
        <path data-part="trunk-base" d="M650 1112 L650 1040" pathLength="1" style={timing(0.023215, 0.064288)}/>
        <path data-part="trunk-lower" d="M650 1040 L650 930" pathLength="1" style={timing(0.087503, 0.098218)}/>
        <path data-part="trunk-middle" d="M650 930 L650 805" pathLength="1" style={timing(0.185721, 0.111611)}/>
        <path data-part="trunk-upper" d="M650 805 L650 635" pathLength="1" style={timing(0.297332, 0.151791)}/>
        <path data-part="branch-bottom-left" d="M624 1112 L557 1107 L557 958 L382 851" pathLength="1" style={timing(0, 0.376179)}/>
        <path data-part="branch-bottom-right" d="M650 1040 L916 911 L916 876" pathLength="1" style={timing(0.087503, 0.295215)}/>
        <path data-part="branch-middle-right" d="M650 930 L755 870 L755 704 L940 599 L940 566" pathLength="1" style={timing(0.185721, 0.475601)}/>
        <path data-part="branch-middle-left" d="M650 805 L433 675 L433 609 L352 545" pathLength="1" style={timing(0.297332, 0.376971)}/>
        <path data-part="branch-top-left" d="M650 635 L531 550 L531 400 L481 345" pathLength="1" style={timing(0.449123, 0.330877)}/>
        <path data-part="branch-top-right" d="M650 635 L650 518 L815 429 L815 365" pathLength="1" style={timing(0.449123, 0.329005)}/>
      </g>
      <g className={styles.nodes} strokeWidth="60">
        <path data-node="branch-bottom-left" d="M363.569682 839.690487 a30 30 0 1 1 -51.139364 -31.380974 a30 30 0 1 1 51.139364 31.380974" pathLength="1" style={timing(0.376179, 0.623821)}/>
        <path data-node="branch-bottom-right" d="M916 854 a30 30 0 1 1 0 -60 a30 30 0 1 1 0 60" pathLength="1" style={timing(0.382718, 0.617282)}/>
        <path data-node="branch-middle-right" d="M940 544 a30 30 0 1 1 0 -60 a30 30 0 1 1 0 60" pathLength="1" style={timing(0.661321, 0.338679)}/>
        <path data-node="branch-middle-left" d="M334.137222 531.815569 a30 30 0 1 1 -48.274444 -35.631138 a30 30 0 1 1 48.274444 35.631138" pathLength="1" style={timing(0.674303, 0.325697)}/>
        <path data-node="branch-top-left" d="M464.426064 331.740851 a30 30 0 1 1 -46.852128 -37.481702 a30 30 0 1 1 46.852128 37.481702" pathLength="1" style={timing(0.78, 0.22)}/>
        <path data-node="branch-top-right" d="M815 343 a30 30 0 1 1 0 -60 a30 30 0 1 1 0 60" pathLength="1" style={timing(0.778127, 0.221873)}/>
      </g>
      <g className={styles.ring} strokeWidth="36">
        <path data-part="ring-left" d="M624 1112 A488 500 0 0 1 624 112" pathLength="1"/>
        <path data-part="ring-right" d="M624 1112 A488 500 0 0 0 624 112" pathLength="1"/>
      </g>
    </svg>
  );
}
