import { useState, useEffect } from 'react'
import { isString } from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { useDropzone } from 'react-dropzone';
import fileFill from '@iconify/icons-eva/file-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import downloadOutline from '@iconify/icons-eva/download-outline';
import { m, motion, AnimatePresence } from 'framer-motion';
// material
import { alpha, styled } from '@mui/material/styles';
import {
  Box,
  List,
  Stack,
  Paper,
  Button,
  ListItem,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
// utils
import { fData } from '../../utils/formatNumber';
//
import { MIconButton } from '../@material-extend';
import { varFadeInRight } from '../animate/variants/fade/FadeIn';
import DrawerTreeView from '../tarefas-processo/DrawerTreeView'

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
  [theme.breakpoints.up('md')]: { textAlign: 'left', flexDirection: 'row' }
}));

// ----------------------------------------------------------------------

export default function ArquivoField({ status, multiple, error, files, onRemove, onRemoveAll, selectFromGED, sx, arquivo, setTreeView, editImage, ...other }) {
  const [openDrawer, setOpenDrawer] = useState(false); 
  const [hasFile, setHasFile] = useState(files.length > 0)

  useEffect(()=>{
    setHasFile(files.length > 0)
  },[files])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple: multiple,
    disabled: status === 'Concluído',
    ...other
  });

  const openTreeView = (e) => {
    e.stopPropagation();
    setOpenDrawer(true)
  }

  const closeTreeView = () => {
    setOpenDrawer(false)
  }

  const openArchive = (file) => {
    window.open(file.url,'_blank');
  }

  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);


  return (
    <Box sx={{ width: '100%', ...sx }}>
        {(multiple || status !== 'Concluído') &&
            <DropZoneStyle
                {...getRootProps()}
                sx={{
                ...(isDragActive && { opacity: 0.72 }),
                ...((isDragReject || error) && {
                    color: 'error.main',
                    borderColor: 'error.light',
                    bgcolor: 'error.lighter'
                })
                }}
            >
                <input
                    {...getInputProps({
                      onChange: (event) => {
                        const selectedFiles = event.target.files;
                        const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf']; //o que é permitido

                        for (let i = 0; i < selectedFiles.length; i++) {
                          const file = selectedFiles[i];

                          if (!allowedFileTypes.includes(file.type)) {
                            alert('Apenas imagens (JPEG, PNG, GIF) e PDFs são permitidos.');
                            event.target.value = ''; 
                            return; 
                          }
                        }
                      },
                    })}
                  />
                <Box sx={{ p: 3, ml: { md: 2 } }}>

                    <Stack alignItems='center' spacing={2}>
                        <Stack direction='row' spacing={2}>
                            <Button variant='outlined' color='success' disabled={status === 'Concluído'}>
                                Selecionar Arquivo do Computador
                            </Button>

                            {selectFromGED &&
                                <Button variant='outlined' color='success' disabled={status === 'Concluído'} onClick={(e) => openTreeView(e)}>
                                    Selecionar Arquivo GED
                                </Button>
                            }

                        </Stack>  

                        <Typography variant='body2' sx={{color: (theme) => theme.palette.grey[500]}}>
                            ou solte o arquivo aqui...
                        </Typography>
                    </Stack> 

                </Box>
            </DropZoneStyle>
        }

      <List disablePadding sx={{ ...(hasFile && { my: 3 }) }}>
        <AnimatePresence>
          {files.map((file, index) => {
            const { name, size, preview } = file;
            const key = isString(file) ? file : name;

            return (
              <ListItem
                key={key}
                component={m.div}
                {...varFadeInRight}
                sx={{
                  my: 1,
                  py: 0.75,
                  px: 2,
                  borderRadius: 1,
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  '&:hover': { cursor: files[0]?.type?.includes('image') ? 'pointer' : 'auto'} 
                }}
                onClick={file?.type?.includes('image') ? () => editImage(index) : () => console.log('.')}
              >
                <ListItemIcon>
                    <Paper
                        variant="outlined"
                        component="img"
                        src={isString(file) ? file : preview}
                        sx={{ maxWidth: isMobile ? '100px' : '300px', maxHeight: isMobile ? '100px' : '300px' }}
                    />
                </ListItemIcon>
                <ListItemText
                  primary={isString(file) ? file : name}
                  secondary={isString(file) ? '' : fData(size)}
                  primaryTypographyProps={{ variant: 'subtitle2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <ListItemSecondaryAction>
                  {file.url &&
                    <MIconButton edge="end" size="small" onClick={() => openArchive(file)}>
                        <Icon icon={downloadOutline} />
                    </MIconButton>
                  }
                  {status !== 'Concluído' &&
                    <MIconButton edge="end" size="small" onClick={() => onRemove(index)}>
                      <Icon icon={closeFill} />
                    </MIconButton>
                  }
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </AnimatePresence>
      </List>

      {selectFromGED &&
        <DrawerTreeView 
          nome_projeto={arquivo.caminho.nome_projeto} 
          id_folder={arquivo.caminho.projeto_pasta_id} 
          id_projeto={arquivo.caminho.projeto_cadastro_id} 
          open={openDrawer} 
          setTreeView={setTreeView} 
          onCloseDrawer={closeTreeView}
        />
      }
    </Box>
  );
}
