import { useState, useEffect } from 'react';

/**
 * Custom hook to track window size.
 * Useful for conditional responsive rendering in React components.
 * @returns {number} width - current viewport width
 */
export const useWindowSize = () => {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWidth(window.innerWidth);

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Use a passive listener for performance
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

export default useWindowSize;
