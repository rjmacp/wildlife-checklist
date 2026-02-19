import { useNavigate } from 'react-router-dom';
import { openSettings } from '../common/SettingsModal';

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  showBack?: boolean;
  backTo?: string;
}

export default function Header({ eyebrow, title, subtitle, showBack, backTo }: Props) {
  const navigate = useNavigate();

  return (
    <div className="hdr">
      {showBack && (
        <button className="back-btn" onClick={() => navigate(backTo ?? '/')}>
          ←
        </button>
      )}
      <button className="tmb" onClick={openSettings}>
        ⚙
      </button>
      <div className="hdr-ey">{eyebrow}</div>
      <h1>{title}</h1>
      <div className="hdr-m">{subtitle}</div>
    </div>
  );
}
