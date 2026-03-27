'use client';

import dynamic from 'next/dynamic';

// Dynamically import Navbar with no SSR
const Navbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => null
});

export default function NavbarWrapper() {
  return <Navbar />;
}