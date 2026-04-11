import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => (
  <footer className="ct-footer" id="app-footer">
    <span>© {new Date().getFullYear()} CareerTrack. All rights reserved.</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      Made with <Heart size={12} style={{ color: 'var(--ct-danger)', fill: 'var(--ct-danger)' }} /> for job seekers
    </span>
  </footer>
);

export default Footer;
