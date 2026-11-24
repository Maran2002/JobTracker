'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useWindowSize from '../hooks/useWindowSize';

export default function PipelineViewportGuard({ children }) {
  const width = useWindowSize();
  const router = useRouter();
  useEffect(() => {
    if (width < 768) router.replace('/dashboard');
  }, [width, router]);
  return <div className="pipeline-viewport-guard">{width < 768 ? null : children}</div>;
}
