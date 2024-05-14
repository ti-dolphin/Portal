import { 
    Box,
    Card,
    CardContent,
    Typography,
    Rating,
    Stack,
    CardActionArea,
    Tooltip
} from '@mui/material'
import { useState } from 'react';
import Avatar from './Avatar'
import MAvatar from './MAvatar'
import createAvatar from '../utils/createAvatar';
import Label from './Label'
import Prazo from './tarefas-processo/Prazo'
import { useTheme } from '@mui/material/styles';
import OfflinePinOutlinedIcon from '@mui/icons-material/OfflinePinOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';


export default function CustomCard({ callbackCard, callbackRating, headerOnly, data, acompanhando }) {
  const theme = useTheme();
  var date = new Date(data.prazo_tarefa)

  const [ratingValue, setRatingValue] = useState(data.acompanhando ? 1 : 0)

  return (
    <Card sx={{height: '100%'}}>
      <CardActionArea  sx={{height: '100%'}} onClick={() => callbackCard(data)}>
        <CardContent>

          <Stack direction='row' spacing={2} alignItems='center'>
              <Avatar variant='rounded' src={data.avatar} />
              <Typography variant='caption' color={headerOnly ? theme.palette.grey[900] : theme.palette.grey[500]}>
                  {data.title}
              </Typography>
              <Box flexGrow={1}/>
              <Rating max={1} 
              onClick={(e)=>{
                e.stopPropagation()
              }}
              value={ratingValue} 
              defaultValue={ratingValue}
              onChange={(event, newValue) => {
                setRatingValue(newValue);
                callbackRating(data, newValue)
              }}/>
          </Stack>

          {!headerOnly &&
          <>
              <Box mb={3}/>

              <Stack spacing={0.7} display='flex' alignItems='flex-start'>
                <Label>{data.processo}</Label>
                <Tooltip title={data.titulo}>
                  <Typography variant='subtitle1'>{data.titulo.length > 30 ? data.titulo.substring(0, 30) +'...' : data.titulo}</Typography>         
                </Tooltip>
                <Typography variant='h6' >{data.tarefa_atual}</Typography>
              </Stack>

              <Box mb={2}/>

              <Stack direction='row' spacing={1} alignItems='center'>
                {acompanhando &&
                    <MAvatar
                        color={createAvatar(data.responsavel).color}
                        sx={{ width: 24, height: 24 }}
                    >
                        {createAvatar(data.responsavel).name}
                    </MAvatar>

                }
                {data.prazo_tarefa ? 
                    <Prazo prazo={data.prazo_tarefa} icon/>
                    :
                    <Label color='default'>Sem Prazo</Label> 
                }
                <Stack direction='row' alignItems='center'>
                  <OfflinePinOutlinedIcon />
                  {data.andamento ? data.andamento : '-'}
                </Stack>

                
                <ChatBubbleOutlineIcon fontSize='small' sx={{ color:theme.palette.grey[300] }}/>
                

              </Stack>
          </>
          } 
        </CardContent>
      </CardActionArea>
    </Card>
  );
}