import Image from '../../../components/Image'
import { Box, CardMedia } from '@mui/material'
import { styled } from '@mui/material/styles';

type Props = {
    archive: any;
}

const BoxStyled = styled(Box)(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        width: '100%'
    },
  }));

export default function FeedPostArchive({archive}: Props){
    return(
        
        archive ?
            <Box sx={{py: 2}}>
                {(!archive.titulo.toLowerCase().includes('.mp4') && !archive.titulo.toLowerCase().includes('.webm') && !archive.titulo.toLowerCase().includes('.ogg') && !archive.titulo.toLowerCase().includes('.mov')) ?
                    <BoxStyled>
                        <Image isLazyLoad={false} src={archive.url} sx={{ borderRadius: 1 }}/>
                    </BoxStyled>
                    :
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
                }
            </Box>
        :
        <></>
    )
}