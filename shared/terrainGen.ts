import { TERRAIN_POINTS, TERRAIN_MIN_HEIGHT, TERRAIN_MAX_HEIGHT } from './constants';

/**
 * Seeded PRNG (mulberry32). Both client and server produce identical output.
 */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate terrain heightmap from a seed.
 * Returns array of heights (from ground up) at evenly spaced x positions.
 */
export function generateTerrain(seed: number, numPoints: number = TERRAIN_POINTS): number[] {
  const rng = mulberry32(seed);
  const heights: number[] = new Array(numPoints);

  // Generate base terrain using multiple octaves of noise
  const octaves = [
    { frequency: 2, amplitude: 0.5 },
    { frequency: 4, amplitude: 0.25 },
    { frequency: 8, amplitude: 0.125 },
  ];

  // Generate random control points for each octave
  for (let i = 0; i < numPoints; i++) {
    heights[i] = 0;
  }

  for (const { frequency, amplitude } of octaves) {
    const controlPoints: number[] = [];
    for (let j = 0; j <= frequency; j++) {
      controlPoints.push(rng());
    }

    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * frequency;
      const index = Math.floor(t);
      const frac = t - index;

      // Cosine interpolation
      const a = controlPoints[Math.min(index, controlPoints.length - 1)];
      const b = controlPoints[Math.min(index + 1, controlPoints.length - 1)];
      const smoothFrac = (1 - Math.cos(frac * Math.PI)) / 2;
      heights[i] += (a * (1 - smoothFrac) + b * smoothFrac) * amplitude;
    }
  }

  // Normalize to terrain height range
  let min = Infinity;
  let max = -Infinity;
  for (const h of heights) {
    if (h < min) min = h;
    if (h > max) max = h;
  }
  const range = max - min || 1;

  for (let i = 0; i < numPoints; i++) {
    heights[i] =
      TERRAIN_MIN_HEIGHT +
      ((heights[i] - min) / range) * (TERRAIN_MAX_HEIGHT - TERRAIN_MIN_HEIGHT);
  }

  // Flatten areas for tank placement (roughly at 20% and 80% of width)
  flattenArea(heights, Math.floor(numPoints * 0.15), 12);
  flattenArea(heights, Math.floor(numPoints * 0.85), 12);

  return heights;
}

/**
 * Flatten terrain around a center index to create a platform for tanks.
 */
function flattenArea(heights: number[], center: number, radius: number): void {
  const start = Math.max(0, center - radius);
  const end = Math.min(heights.length - 1, center + radius);
  const avgHeight =
    heights.slice(start, end + 1).reduce((a, b) => a + b, 0) / (end - start + 1);

  for (let i = start; i <= end; i++) {
    const dist = Math.abs(i - center) / radius;
    const blend = Math.max(0, 1 - dist);
    heights[i] = heights[i] * (1 - blend) + avgHeight * blend;
  }
}

/**
 * Apply crater deformation to terrain.
 */
export function applyCrater(
  terrain: number[],
  craterX: number,
  craterRadius: number,
  worldWidth: number
): number[] {
  const newTerrain = [...terrain];
  const numPoints = terrain.length;

  for (let i = 0; i < numPoints; i++) {
    const worldX = (i / numPoints) * worldWidth;
    const dx = worldX - craterX;

    if (Math.abs(dx) < craterRadius) {
      const distRatio = dx / craterRadius;
      const depth = craterRadius * Math.sqrt(1 - distRatio * distRatio) * 0.6;
      newTerrain[i] = Math.max(10, newTerrain[i] - depth);
    }
  }

  return newTerrain;
}
