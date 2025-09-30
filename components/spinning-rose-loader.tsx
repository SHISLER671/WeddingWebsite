export function SpinningRoseLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rose petals */}
          <g className="origin-center">
            {/* Center circle */}
            <circle cx="50" cy="50" r="8" fill="#E91E63" />

            {/* Outer petals */}
            <ellipse cx="50" cy="30" rx="12" ry="18" fill="#F06292" opacity="0.9" />
            <ellipse cx="70" cy="50" rx="18" ry="12" fill="#F06292" opacity="0.9" />
            <ellipse cx="50" cy="70" rx="12" ry="18" fill="#F06292" opacity="0.9" />
            <ellipse cx="30" cy="50" rx="18" ry="12" fill="#F06292" opacity="0.9" />

            {/* Diagonal petals */}
            <ellipse cx="35" cy="35" rx="14" ry="14" fill="#EC407A" opacity="0.8" transform="rotate(-45 35 35)" />
            <ellipse cx="65" cy="35" rx="14" ry="14" fill="#EC407A" opacity="0.8" transform="rotate(45 65 35)" />
            <ellipse cx="65" cy="65" rx="14" ry="14" fill="#EC407A" opacity="0.8" transform="rotate(-45 65 65)" />
            <ellipse cx="35" cy="65" rx="14" ry="14" fill="#EC407A" opacity="0.8" transform="rotate(45 35 65)" />

            {/* Inner petals */}
            <ellipse cx="50" cy="38" rx="8" ry="12" fill="#D81B60" opacity="0.95" />
            <ellipse cx="62" cy="50" rx="12" ry="8" fill="#D81B60" opacity="0.95" />
            <ellipse cx="50" cy="62" rx="8" ry="12" fill="#D81B60" opacity="0.95" />
            <ellipse cx="38" cy="50" rx="12" ry="8" fill="#D81B60" opacity="0.95" />
          </g>
        </svg>
      </div>
    </div>
  )
}
