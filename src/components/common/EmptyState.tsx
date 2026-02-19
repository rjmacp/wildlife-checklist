interface Props {
  emoji: string;
  message: string;
  action?: string;
  onAction?: () => void;
}

export default function EmptyState({ emoji, message, action, onAction }: Props) {
  return (
    <div className="em">
      <div className="emi">{emoji}</div>
      <div className="emt">{message}</div>
      {action && onAction && (
        <button className="emb" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
