import { useState } from 'react'
import Image from '../../../components/Image'
import LightboxModal from '../../../components/LightboxModal'

import { Box, CardMedia, Stack, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, Container } from '@mui/material'
import { Icon } from '@iconify/react';
import downloadOutline from '@iconify/icons-eva/download-outline';
import fileOutline from '@iconify/icons-eva/file-outline';
import { NumberLiteralType } from 'typescript';


type Props = {
    archives: any;
}

export default function PostArchives({archives}: Props){
    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    var imageArchives = archives.filter((archive: any) => archive.titulo.toLowerCase().includes('.webp') || archive.titulo.toLowerCase().includes('.jfif') || archive.titulo.toLowerCase().includes('.png') || archive.titulo.toLowerCase().includes('.jpg') || archive.titulo.toLowerCase().includes('.jpeg')) 
    imageArchives.forEach((img: any, index: number) => imageArchives[index] = img.url);

    const handleOpenLightbox = (url: string) => {
        const selectedImage = imageArchives.findIndex((archive: any) => archive === url);
        setOpenLightbox(true);
        setSelectedImage(selectedImage);
      };
    
    return(
        <Stack spacing={2} alignItems='center' sx={{py: 2}}>
            {archives.map((archive: any) => 
                (archive.titulo.toLowerCase().includes('.webp') || archive.titulo.toLowerCase().includes('.jfif') || archive.titulo.toLowerCase().includes('.png') || archive.titulo.toLowerCase().includes('.jpg') || archive.titulo.toLowerCase().includes('.jpeg')) ?
                <Container maxWidth={'sm'}>
                    <Box sx={{maxWidth:'600px'}}>
                        <Image isLazyLoad={false} src={archive.url} sx={{ borderRadius: 1, '&:hover':{cursor: 'pointer'} }} onClick={() => handleOpenLightbox(archive.url)}/>
                    </Box>
                </Container>
                :
                (archive.titulo.toLowerCase().includes('.mp4') || archive.titulo.toLowerCase().includes('.webm') || archive.titulo.toLowerCase().includes('.ogg') || archive.titulo.toLowerCase().includes('.mov')) ?
                <Box sx={{
                    width: '100%',
                    pt: '56.25%',
                    height: '0px',
                    position: 'relative',
                }}
                >
                    <CardMedia 
                        src={archive.url} 
                        image={archive.url} 
                        component='video' 
                        controls
                        sx={{ 
                            borderRadius: 1,
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                        />
                </Box>
                :
                <List disablePadding sx={{width: '100%'}}>
                    <ListItem
                        sx={{
                            my: 1,
                            py: 0.75,
                            px: 2,
                            borderRadius: 1,
                            border: (theme) => `solid 1px ${theme.palette.divider}`,
                            bgcolor: 'background.paper',
                        }}
                        >
                        <ListItemIcon>
                            <Icon icon={fileOutline} />
                        </ListItemIcon>
                        <ListItemText
                            primary={archive.titulo}
                            primaryTypographyProps={{ variant: 'subtitle2' }}
                            />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" size="small" onClick={() => window.open(archive.url,'_blank')}>
                                <Icon icon={downloadOutline} />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            )}

            <LightboxModal
                images={imageArchives}
                mainSrc={imageArchives[selectedImage]}
                photoIndex={selectedImage}
                setPhotoIndex={setSelectedImage}
                isOpen={openLightbox}
                onCloseRequest={() => setOpenLightbox(false)}
                />
        </Stack>
    )
}