import type { Size } from '../../types/animals';

interface Props {
  size: Size;
  color: string;
}

export default function SizeBadge({ size, color }: Props) {
  return <span className="ctg ctg-z">{size} • {color}</span>;
}
