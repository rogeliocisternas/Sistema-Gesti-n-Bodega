import { useState } from 'react';
import { Box, Typography } from '@mui/material';

const ANCHO = 600;
const ALTO = 170;
const PAD_X = 20;
const PAD_TOP = 28;
const PAD_BOTTOM = 24;

// Línea de tiempo (una serie): eje X en formato dd/mm, con crosshair + tooltip al
// pasar el mouse o al enfocar con teclado. Sin leyenda (una sola serie: el título
// del card ya dice qué se grafica).
export default function DailyLineChart({ datos, color = '#2a78d6', vacio = 'Sin datos' }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  if (!datos || datos.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {vacio}
      </Typography>
    );
  }

  const max = Math.max(1, ...datos.map((d) => d.valor));
  const n = datos.length;
  const innerW = ANCHO - PAD_X * 2;
  const innerH = ALTO - PAD_TOP - PAD_BOTTOM;

  const puntos = datos.map((d, i) => ({
    ...d,
    x: PAD_X + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    y: PAD_TOP + innerH - (d.valor / max) * innerH,
  }));

  const path = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Con muchos puntos (ej. 30 días) no se etiquetan todos en el eje X: se muestran
  // ~7 como máximo para que no se encimen.
  const saltoEtiqueta = Math.max(1, Math.ceil(n / 7));
  const activo = hoverIdx !== null ? puntos[hoverIdx] : null;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="svg"
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        width="100%"
        height={ALTO}
        role="img"
        aria-label="Registros creados por día"
        sx={{ overflow: 'visible' }}
      >
        <line x1={PAD_X} y1={PAD_TOP + innerH} x2={ANCHO - PAD_X} y2={PAD_TOP + innerH} stroke="#e1e0d9" strokeWidth="1" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map((p, i) => (
          <g key={p.fecha}>
            {i === n - 1 && (
              <text x={p.x} y={p.y - 12} textAnchor="end" fontSize="12" fontWeight={600} fill="#0b0b0b">
                {p.valor}
              </text>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={i === hoverIdx ? 6 : 4}
              fill={color}
              stroke="#fcfcfb"
              strokeWidth="2"
              tabIndex={0}
              role="img"
              aria-label={`${p.etiqueta}: ${p.valor}`}
              style={{ cursor: 'pointer', outline: 'none' }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              onFocus={() => setHoverIdx(i)}
              onBlur={() => setHoverIdx(null)}
            />
            {i % saltoEtiqueta === 0 && (
              <text x={p.x} y={ALTO - 6} textAnchor="middle" fontSize="10" fill="#898781">
                {p.etiqueta}
              </text>
            )}
          </g>
        ))}
      </Box>
      {activo && (
        <Box
          sx={{
            position: 'absolute',
            left: `${(activo.x / ANCHO) * 100}%`,
            top: 0,
            transform: 'translate(-50%, -100%)',
            bgcolor: 'grey.900',
            color: 'common.white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: 12,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {activo.etiqueta}: {activo.valor}
        </Box>
      )}
    </Box>
  );
}
