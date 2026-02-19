interface Props {
  checked: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export default function CheckButton({ checked, onClick }: Props) {
  return (
    <button
      className={`ckb${checked ? ' ck' : ''}`}
      onClick={onClick}
      aria-checked={checked}
      aria-label={checked ? 'Unmark as spotted' : 'Mark as spotted'}
    >
      {checked ? '✓' : ''}
    </button>
  );
}
