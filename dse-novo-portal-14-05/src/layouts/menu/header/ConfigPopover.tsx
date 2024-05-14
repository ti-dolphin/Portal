import { useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MenuItem, Stack } from '@mui/material';
import { IconButtonAnimate } from '../../../components/animate';
import MenuPopover from '../../../components/MenuPopover';
import Iconify from '../../../components/Iconify';

export default function ConfigPopover() {
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);

    const MENU_OPTIONS = [
        {
          label: 'Usuários',
          linkTo: '/usuario',
        },
        {
          label: 'Configurações',
          linkTo: '/configuracao-processo',
        },
      ];

      const handleOpen = () => {
        setOpen(true);
      };
      const handleClose = () => {
        setOpen(false);
      };
      
    return(
        <>
            <IconButtonAnimate
                ref={anchorRef}
                size="large"
                onClick={() => handleOpen()}
            >
                <Iconify icon="eva:settings-fill" width={20} height={20} />
            </IconButtonAnimate>

            <MenuPopover
                open={open}
                onClose={handleClose}
                anchorEl={anchorRef.current}
                sx={{ width: 220 }}
            >
                <Stack spacing={0.5} sx={{ p: 1 }}>
                    {MENU_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.label}
                            to={option.linkTo}
                            component={RouterLink}
                            onClick={() => handleClose()}
                            sx={{ typography: 'body2', py: 1, px: 2, borderRadius: 1 }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Stack>
            </MenuPopover>
        </>
    )
}