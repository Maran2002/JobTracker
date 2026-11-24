'use client';

import NextLink from 'next/link';
import { usePathname, useRouter, useParams as useNextParams, useSearchParams } from 'next/navigation';

export const Link = ({ to, ...props }) => <NextLink href={to || '/'} {...props} />;
export function NavLink({ to, className, ...props }) {
  const pathname = usePathname();
  const active = pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
  return <NextLink href={to} className={typeof className === 'function' ? className({ isActive: active }) : className} aria-current={active ? 'page' : undefined} {...props} />;
}
export function useNavigate() {
  const router = useRouter();
  return (href, options) => {
    const status = options?.state?.defaultStatus;
    router.push(status ? `${href}?defaultStatus=${encodeURIComponent(status)}` : href);
  };
}
export const useParams = useNextParams;
export function useLocation() {
  const pathname = usePathname();
  const search = useSearchParams();
  return { pathname, search: `?${search.toString()}`, state: null };
}
