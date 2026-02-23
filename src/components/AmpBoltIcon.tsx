interface AmpBoltIconProps {
  size?: number;
  className?: string;
}

export default function AmpBoltIcon({ size = 32, className = "" }: AmpBoltIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="8" fill="#1A4141" />
      <path d="M28 5L16 23H24L14 43L36 21H26L28 5Z" fill="#D3FF01" />
    </svg>
  );
}
