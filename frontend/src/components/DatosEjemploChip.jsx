import { Chip, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function DatosEjemploChip() {
  return (
    <Tooltip title="Esta vista es un prototipo de diseño: parte de la información mostrada es de ejemplo, no proviene del backend.">
      <Chip size="small" icon={<InfoOutlinedIcon />} label="Datos de ejemplo" variant="outlined" color="warning" />
    </Tooltip>
  );
}
