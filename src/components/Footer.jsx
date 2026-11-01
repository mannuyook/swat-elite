import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full text-center text-[11px] text-slate-300 py-3 px-4 flex-shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
      <p className="font-medium tracking-wide">
        &copy; {currentYear} <span className="text-white font-bold uppercase">SWAT Elite Lincoln</span>. Sitio web exclusivo del grupo SWAT. Espacio informativo y de gestión sin fines de lucro. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export default Footer;