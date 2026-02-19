import type { ConservationStatus } from '../../types/animals';
import { conservationClass } from '../../utils/colors';

interface Props {
  status: ConservationStatus;
}

export default function ConservationBadge({ status }: Props) {
  return <span className={`ctg ap-cs-pill ap-cs-${conservationClass(status)}`}>{status}</span>;
}
