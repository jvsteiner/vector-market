"use client"

import { useMemo } from "react"

interface IdenticonProps {
  pubKey: string
  size?: number
  className?: string
}

export function Identicon({ pubKey, size = 40, className = "" }: IdenticonProps) {
  const pattern = useMemo(() => {
    // Generate a deterministic pattern from the public key
    const cells: boolean[][] = []
    let hash = 0
    
    for (let i = 0; i < pubKey.length; i++) {
      hash = pubKey.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // Create a 5x5 grid, but only generate 3 columns (mirror for symmetry)
    for (let row = 0; row < 5; row++) {
      cells[row] = []
      for (let col = 0; col < 3; col++) {
        const idx = row * 3 + col
        cells[row][col] = ((hash >> idx) & 1) === 1
      }
      // Mirror
      cells[row][3] = cells[row][1]
      cells[row][4] = cells[row][0]
    }
    
    return cells
  }, [pubKey])

  const colors = useMemo(() => {
    let hash = 0
    for (let i = 0; i < pubKey.length; i++) {
      hash = pubKey.charCodeAt(i) + ((hash << 6) - hash)
    }
    const hue = Math.abs(hash % 360)
    return {
      bg: `hsl(${hue}, 40%, 15%)`,
      fg: `hsl(${hue}, 70%, 65%)`,
    }
  }, [pubKey])

  const cellSize = size / 5

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ borderRadius: size * 0.15 }}
    >
      <rect width={size} height={size} fill={colors.bg} rx={size * 0.15} />
      {pattern.map((row, rowIdx) =>
        row.map((cell, colIdx) =>
          cell ? (
            <rect
              key={`${rowIdx}-${colIdx}`}
              x={colIdx * cellSize}
              y={rowIdx * cellSize}
              width={cellSize}
              height={cellSize}
              fill={colors.fg}
            />
          ) : null
        )
      )}
    </svg>
  )
}
