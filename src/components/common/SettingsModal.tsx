import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../../types/state';

interface Props {
  theme: Theme;
  onToggleTheme: () => void;
}

let openSettingsFn: (() => void) | null = null;

export function openSettings() {
  openSettingsFn?.();
}

export default function SettingsModal({ theme, onToggleTheme }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    openSettingsFn = () => setShow(true);
    return () => {
      openSettingsFn = null;
    };
  }, []);

  const close = useCallback(() => setShow(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, close]);

  return (
    <div
      className={`stg-overlay${show ? ' show' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="stg-modal">
        <div className="stg-hdr">
          <span className="stg-title">Settings</span>
          <button className="stg-close" onClick={close}>
            &times;
          </button>
        </div>
        <div className="stg-body">
          <div className="stg-row">
            <div className="stg-label">Theme</div>
            <div className="stg-toggle">
              <button
                className={`stg-opt${theme === 'light' ? ' on' : ''}`}
                onClick={() => {
                  if (theme !== 'light') onToggleTheme();
                }}
              >
                Light
              </button>
              <button
                className={`stg-opt${theme === 'dark' ? ' on' : ''}`}
                onClick={() => {
                  if (theme !== 'dark') onToggleTheme();
                }}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
