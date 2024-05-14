import { useEffect, useState } from 'react';
import { 
    Box,
    Dialog,
    Slide,
    AppBar, 
    Toolbar,
    IconButton,
    Container,
    Stack,
    Typography,
    Button,
    Alert,
    AlertTitle
    } from '@mui/material';
import { forwardRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { alpha, styled } from '@mui/material/styles';
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
  } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { CustomImage } from '../convertImageToPdf/custom-image';
import { fileToImageURL } from '../convertImageToPdf/helpers';
import { GetSession, SetSession } from 'src/session';
import Iconify from '../Iconify';
import Loading from '../Loading'
import Image from '../Image';


const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

function centerAspectCrop(
    mediaWidth,
    mediaHeight,
    aspect,
    isMuralEdit
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: isMuralEdit ? 'px' : '%',
          width: isMuralEdit ? mediaWidth : isMobile ? 50 : 85,
          height: isMuralEdit ? mediaHeight : isMobile ? 50 : 85,
        },
        isMuralEdit ? 16/9 : aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

const StyledCrop = styled(ReactCrop)(({ theme }) => ({
    maxHeight:'700px',
    width: '100%',
    '& .ReactCrop__drag-handle::after':{
        width: isMobile ? '25px' : '10px',
        height: isMobile ? '25px' : '10px',
    }
  }));
  

export default function ImageEditModal({handleClose, open, image, callback, isMuralEdit}){
    const [ imageToEdit, setImageToEdit ] = useState()
    const [ targetImage, setTargetImage ] = useState(null)
    const [ crop, setCrop ] = useState()
    const [ showAlert, setShowAlert ] = useState(GetSession('showAlert'))
    const [ rotate, setRotate ] = useState(0)
    const [ aspect, setAspect ] = useState(16/9)
    const [ loading, setLoading ] = useState(false);
    const [ completedCrop, setCompletedCrop ] = useState();
    
    useEffect(() =>{
        if(image){
            startImage()
        }
    },[open])

    const startImage = async () =>{
        setLoading(true)
        var newImage = await fileToImageURL(image)
        const { width, height } = newImage
        const img64 = await toBase64(image)
        setImageToEdit(img64.toString() || '')
        setLoading(false);
        if(!isMuralEdit){
            setRotate(0)
            let cropAux
            if(width >= height){
                setAspect(16/9)
                cropAux = centerAspectCrop( width, height, 16/9)
            }else{
                setAspect(9/16)
                cropAux = centerAspectCrop( width, height, 9/16)
            }
            setCrop(cropAux)
            editCompletedCrop(cropAux)
        }
    }
    
    const editRotate = async () =>{
        var newImage = await fileToImageURL(image)
        const { width, height } = newImage
        let cropAux
        if(aspect === 16/9){
            setAspect(9/16)
            setRotate(rotate+90)
            cropAux = centerAspectCrop( width, height, 9/16, isMuralEdit)
        }else{
            setAspect(16/9)
            setRotate(rotate+90)
            cropAux = centerAspectCrop( width, height, 9/16, isMuralEdit)
        }
        setCrop(cropAux)
        editCompletedCrop(cropAux)
    }

    const editCompletedCrop = async (cropAux) => {
        var newImage = await fileToImageURL(image)
        const { width, height } = newImage

        const CompletedCrop = {
            unit: 'px',
            height: cropAux.height/100 * height,
            width: cropAux.width/100 * width,
            x: (width - (cropAux.width/100 * width))/2,
            y: (height - (cropAux.height/100 * height))/2
        }
        setCompletedCrop(CompletedCrop)
    }

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const onClickSave = async () => {
        try {
            const canvas = document.createElement("canvas");
            const scaleX = targetImage.naturalWidth / targetImage.width;
            const scaleY = targetImage.naturalHeight / targetImage.height;
            const pixelRatio = 1

            canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio)
            canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio)
            const ctx = canvas.getContext('2d')

            ctx.scale(pixelRatio, pixelRatio)
            ctx.imageSmoothingQuality = 'high'
            const cropX = completedCrop.x * scaleX
            const cropY = completedCrop.y * scaleY
            const rotateRads = rotate * Math.PI / 180
            const centerX = targetImage.naturalWidth / 2
            const centerY = targetImage.naturalHeight / 2
            ctx.save()

            ctx.translate(-cropX, -cropY)
            ctx.translate(centerX, centerY)
            ctx.rotate(rotateRads)
            ctx.scale(1, 1)
            ctx.translate(-centerX, -centerY)
            ctx.drawImage(
                targetImage,
                0,
                0,
                targetImage.naturalWidth,
                targetImage.naturalHeight,
                0,
                0,
                targetImage.naturalWidth,
                targetImage.naturalHeight,
            )
            ctx.restore()
            const base64Image = canvas.toDataURL(image.type, 1);
            let index
            if(!image.index){
                if(image.index === 0){
                    index = 0
                } else{
                    index = null
                }
            } else{
                index = image.index
            }
            callback(base64Image, image.name, index)
            handleClose()
        } catch (e) {
            console.log(e)
        }
    }; 

    useEffect(() =>{
        if(targetImage && isMuralEdit){
            setLoading(true);
            setRotate(0)
            let cropAux
            if(targetImage.width >= targetImage.height){
                setAspect(16/9)
                cropAux = centerAspectCrop( targetImage.width, targetImage.height, 16/9, isMuralEdit)
            }else{
                setAspect(9/16)
                cropAux = centerAspectCrop( targetImage.width, targetImage.height, 9/16, isMuralEdit)
            }
            setCrop(cropAux)
            setLoading(false);
        }
    },[targetImage])

    return(
        loading ?
            <Loading open={true} sx={{ zIndex:9999 }}/>
            :
            <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                    <AppBar position="relative" sx={{backgroundColor: 'transparent', boxShadow:'none'}}>
                        <Toolbar>
                            <Stack direction='row' alignItems='center' spacing={2}>
                                <IconButton onClick={() =>handleClose()} sx={{color: (theme) => theme.palette.grey[900]}}>
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant='body1' fontWeight='bold' sx={{color: (theme) => theme.palette.grey[900]}}>
                                    Editar Imagem
                                </Typography>
                            </Stack>
                            <Box flexGrow={1}/>
                            <Button variant='contained' color='success' onClick={() => onClickSave()}>
                                Salvar Imagem
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <Box mb={2}/>
                    
                    <Container sx={{height: '100%'}}>
                            <Stack alignItems='center' spacing={5} p={4}>
                                <Dialog open={!showAlert} onClose={() => {setShowAlert(true); SetSession('showAlert', true)}}>
                                    <Alert severity='info' onClose={() => {setShowAlert(true); SetSession('showAlert', true)}}>
                                        <AlertTitle> Como usar o editor de imagens </AlertTitle>
                                        Utilize a caixa tracejada para enquadrar o conteúdo desejado na imagem. Para rotacionar a imagem, clique o botão localizado na parte inferior da interface.
                                    </Alert>
                                </Dialog>
                                <StyledCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => {
                                        setCrop(percentCrop) 
                                    }}
                                    onComplete={(c) =>{
                                        setCompletedCrop(c)
                                    }}
                                >
                                    <img
                                        src={imageToEdit}
                                        style={{ transform: `scale(${1}) rotate(${rotate}deg)`}}
                                        onLoad={(e) => setTargetImage(e.target)}
                                    />
                                </StyledCrop>

                                <Button
                                    startIcon={
                                        <Iconify icon={'ic:round-rotate-90-degrees-ccw'}/>
                                    }
                                    variant='outlined'
                                    color='inherit'
                                    onClick={() => editRotate()}
                                >
                                    Rotacionar
                                </Button>
                            </Stack>
                    </Container>
            </Dialog>
    )
}