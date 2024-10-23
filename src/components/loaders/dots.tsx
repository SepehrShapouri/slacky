import { HTMLAttributes } from 'react'

interface LoaderProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number
}

export default function Loader({ size = 4, className, ...props }: LoaderProps = {}) {
  const dotSize = `${size}px`

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-flex items-center ${className}`}
      {...props}
    >
      <span className="flex items-center space-x-[2px]">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="inline-block rounded-full bg-current animate-bounce"
            style={{
              width: dotSize,
              height: dotSize,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </span>
      <span className="sr-only">Loading...</span>
    </span>
  )
}