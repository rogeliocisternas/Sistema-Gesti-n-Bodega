import { Chip } from '@mui/material';

const colores = {
  DISPONIBLE: 'success',
  ASIGNADO: 'warning',
  EN_MANTENIMIENTO: 'info',
  BAJA: 'default',
  DEVUELTO: 'success',
};

export default function EstadoChip({ estado }) {
  return <Chip size="small" label={estado} color={colores[estado] || 'default'} />;
}
