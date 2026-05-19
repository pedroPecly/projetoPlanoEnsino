import { useEffect, useState } from 'react';

export function VoltarTopo() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisivel(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
      className={`fixed bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#2b9f3f] text-white shadow-lg transition hover:bg-[#248a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b9f3f] lg:right-auto lg:left-8 ${
        visivel ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
      }`}
    >
      <span className="text-lg font-semibold leading-none">^</span>
    </button>
  );
}
