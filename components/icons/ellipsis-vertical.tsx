import * as React from "react";
import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M13 12a1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 2 0zM13 5a1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 2 0zM13 19a1 1 0 0 1-1 1 1 1 0 0 1-1-1 1 1 0 0 1 2 0z" />
  </svg>
);
export { SvgComponent as IconEllipsisVertical };
