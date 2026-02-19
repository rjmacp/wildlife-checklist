import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function Container({ children }: Props) {
  return <div className="ctn">{children}</div>;
}
