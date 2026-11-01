import React, { useState } from 'react';
import { Copy, Check, Search, Terminal, Shield } from 'lucide-react';

const CATEGORIAS_MACROS = [
    {
    titulo: 'Presentacion y comunicación',
    items: [
      '/me [S.W.A.T-ELITE] MI MAXIMO RESPETO SR(A) [RANGO] [NOMBRE] PRESENTÁNDOSE!',
      '/flobby SOLICITO PERMISO PARA SUBIR AL PISO 2 HACER PATRULLAJE CALLEJERO',
      '/me HOLA, SOY EL (RANGO) (NOMBRE). DE LA [S.W.A.T-ELITE]  POLICÍA DEL ESTADO DE LA COSTA OESTE DE LINCOLN. ¿CÓMO LE PUEDO AYUDAR?',
      '/flobby (10-4) ENTENDIDO.'
    ]
  },
  {
    titulo: 'Detención y procedimiento',
    items: [

      '/me ¡[S.W.A.T-ELITE] DETÉNGASE, APAGUE EL MOTOR Y PÓNGASE EN LA PARTE DE ATRÁS DE SU VEHÍCULO!',
      '/do [S.W.A.T-ELITE] PRESENTE SUS DOCUMENTOS.',
      '/do [S.W.A.T-ELITE] ÚLTIMA ADVERTENCIA: PRESENTE SUS DOCUMENTOS O SERÁ ACUSADO DE 3.2 Y 3.6.',
      '/do [S.W.A.T-ELITE] REGISTRANDO LOS DOCUMENTOS AL SOSPECHOSO.',
      '/do [S.W.A.T-ELITE] SOSPECHOSO LIMPIO PUEDE RETIRARSE.',
      '/me [S.W.A.T-ELITE] ESTÁ SIENDO DETENIDO, NO ARRESTADO. ¡POR FAVOR, SÍGAME!',
      '/me [S.W.A.T-ELITE] CIUDADANO, ESTÁ USTED ARRESTADO. TIENE DERECHO A GUARDAR SILENCIO. TODO LO QUE DIGA SERÁ USADO EN SU CONTRA.',
      '/me [S.W.A.T-ELITE] CIUDADANO, ESTÁ USTED ARRESTADO POR ESTAR EN LA LISTA DE LOS MAS BUSCADOS. TIENE DERECHO A GUARDAR SILENCIO. TODO LO QUE DIGA SERÁ USADO EN SU CONTRA.' 
    ]
  },
  {
    titulo: 'control vehicular',
    items: [
      '//Me [S.W.A.T-ELITE] !TANQUETAS EN MOVIMIENTO SI NO SE ALEJA LO ABATIREMOS!',
      '/me [S.W.A.T-ELITE] ESTO ES UN RETÉN POR FAVOR MOSTRAR DOCUMENTOS '
    ]
  },
  {
    titulo: 'Armas y fuerza',
    items: [
      '/me [S.W.A.T-ELITE]¡BAJE EL ARMA INMEDIATAMENTE O UTILIZARÉ TASER O FUERZA LETAL!',
      '/do [S.W.A.T-ELITE]¡TASER! ¡TASER! ¡TASER!',
      '/do [S.W.A.T-ELITE]¡TASER! ¡TASER! ¡TASER! ROMPE LA VENTANA, INMOVILIZA AL SOSPECHOSO Y LO RETIRA DEL VEHÍCULO.',
      '/do [S.W.A.T-ELITE] DISPARAR AL SOSPECHOSO ARMADO / VEHÍCULO PARA PROTEGER A LOS CIUDADANOS, COMPAÑEROS OFICIALES Y A SÍ MISMO.',
      '/do [S.W.A.T-ELITE] CONTROL DEL TERRITORIO ALEJARSE 200 METROS DE LA ZONA O SERA ABATIDO'
    ]
  },
  {
    titulo: 'Otros',
    items: [
      '/do [S.W.A.T-ELITE] CONFIRMA QUE LA CÁMARA CORPORAL ESTÁ ACTIVADA.',
      '/flobby (10-8) EN SERVICIO.',
      '/flobby (10-7) FUERA DE SERVICIO.',
      '/flobby (10-6) ACTUALMENTE OCUPADO.',
      '/me [S.W.A.T-ELITE] ¡ÚLTIMA ADVERTENCIA! ¡ABANDONA LA ZONA AHORA O SERÁS ACUSADO DE UN 1.7 Y 3.2! ¡ESTA ES UNA ZONA VERDE, NO UNA ZONA DE RECREO!',
      '/flobby (10-6) ACTUALMENTE OCUPADO.',
      '/me [S.W.A.T-ELITE] AL NO SEGUIR MIS ÓRDENES, PROCEDERÉ A COLOCARLE UN DISPOSITIVO DE RASTREO.',
      '/flobby (10-3)[S.W.A.T-ELITE] [NOMBRE Y PLACA] EN CAMINO'
    ]
  }
];

export function Macros() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedText, setCopiedText] = useState(null);

  const handleCopy = (texto) => {
    navigator.clipboard.writeText(texto);
    setCopiedText(texto);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* CABECERA DEL MÓDULO */}
      <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#13203c] border border-[#223966] rounded-xl flex items-center justify-center text-amber-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase text-white tracking-wider flex items-center space-x-2">
              <span>Policía de Lincoln RP</span>
              <Shield className="w-4 h-4 text-slate-400 inline" />
            </h2>
            <p className="text-xs text-slate-400 font-semibold">Comandos de procedimiento táctico · Toca «COPIAR» para usar en el chat</p>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text"
            placeholder="Buscar comando..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#13203c] border border-[#223966] focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none shadow-inner transition-all"
          />
        </div>
      </div>

      {/* CATEGORÍAS DE MACROS */}
      <div className="space-y-6">
        {CATEGORIAS_MACROS.map((cat, catIdx) => {
          const itemsFiltrados = cat.items.filter(item => 
            item.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (itemsFiltrados.length === 0) return null;

          return (
            <div key={catIdx} className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-[#1b315e] pb-2">
                {cat.titulo}
              </h3>

              <div className="space-y-3">
                {itemsFiltrados.map((macro, itemIdx) => {
                  const isCopied = copiedText === macro;
                  return (
                    <div 
                      key={itemIdx}
                      className="bg-[#13203c]/60 border border-[#223966] hover:border-slate-500 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all group"
                    >
                      <code className="text-xs font-mono font-bold text-slate-200 break-all select-all">
                        {macro}
                      </code>

                      <button
                        onClick={() => handleCopy(macro)}
                        className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-black uppercase transition-all shadow-md flex-shrink-0 cursor-pointer ${
                          isCopied 
                            ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-400' 
                            : 'bg-[#1b315e] hover:bg-[#223966] border border-[#334155] text-slate-200 hover:text-white'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}