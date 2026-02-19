import type { Rarity } from '../../types/animals';
import { rarityClass } from '../../utils/colors';

interface Props {
  rarity: Rarity;
  className?: string;
}

export default function RarityBadge({ rarity, className = '' }: Props) {
  return <span className={`rb ${rarityClass(rarity)} ${className}`}>{rarity}</span>;
}
