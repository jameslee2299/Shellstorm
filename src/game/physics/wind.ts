import { MAX_WIND } from '../../../shared/constants';

export function generateWind(): number {
  return (Math.random() - 0.5) * 2 * MAX_WIND;
}

export function updateWind(currentWind: number): number {
  const change = (Math.random() - 0.5) * 160;
  return Math.max(-MAX_WIND, Math.min(MAX_WIND, currentWind + change));
}

export function getWindLabel(wind: number): string {
  const absWind = Math.abs(wind);
  if (absWind < 20) return 'Calm';
  if (absWind < 60) return 'Light';
  if (absWind < 100) return 'Moderate';
  return 'Strong';
}

export function getWindDirection(wind: number): string {
  if (Math.abs(wind) < 5) return '';
  return wind > 0 ? '→' : '←';
}
