import { Icon } from '@iconify/react';
import copyFill from '@iconify/icons-eva/copy-fill';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CopyToClipboard } from 'react-copy-to-clipboard';
// material
import { Tooltip, TextField, IconButton, InputAdornment } from '@mui/material';

// ----------------------------------------------------------------------

type CopyClipboardProps = {
  value: string;
  newTab: boolean;
};

export default function CopyClipboard({ value, newTab, ...other }: CopyClipboardProps) {

  const checkUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch(err) {
      return false
    }
  }

  return (
    <TextField
      fullWidth
      value={value}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <CopyToClipboard text={value}>
              <Tooltip title="Copiar">
                <IconButton>
                  <Icon icon={copyFill} width={24} height={24} />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>

            {newTab &&
              <Tooltip title="Abrir em nova guia">
                <IconButton onClick={() => checkUrl(value) && window.open(value, '_blank', 'noreferrer')}>
                  <OpenInNewIcon width={24} height={24} />
                </IconButton>
              </Tooltip>
            }
          </InputAdornment>
        )
      }}
      {...other}
    />
  );
}
