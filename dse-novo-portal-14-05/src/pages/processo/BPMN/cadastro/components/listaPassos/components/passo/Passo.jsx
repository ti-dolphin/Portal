import React, { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SwitchAcompanhamentoProcesso from './components/SwitchAcompanhamentoProcesso'

import DetalheAcordeao from './components/detalheAcordeao/DetalheAcordeao'
import DetalheAcordeaoDecisao from './components/detalheAcordeaoDecisao/DetalheAcordeaoDecisao';
import DetalheAcordeaoSubprocesso from './components/detalheAcordeaoSubprocesso/DetalheAcordeaoSubprocesso'
import {useAtom } from "jotai"
import {Passos} from '../../PassoAtom'


import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Grid,
  Stack
} from "@mui/material"

import CircularProgress from '@mui/material/CircularProgress';

export default function ControlledAccordions(props) {
  const [passos, setPassos] = useAtom(Passos)
  const [expanded, setExpanded] = useState(false);
  const [render, setRender] = useState(false)

  const handleChange = () => (event) => {
    if(!(event.target.type == 'checkbox')){ // não abre/fecha o acordeão se clicar na checkbox
      setExpanded(!expanded);
      setRender(true)
    }
  };

  const renderAccordionDetails = () => {
   if(passos[props.index].decisao == "sim"){
      return <DetalheAcordeaoDecisao index={props.index}/>
    } else if(passos[props.index].subprocesso === 1){
      return <DetalheAcordeaoSubprocesso index={props.index} />
    } else{
      return <DetalheAcordeao index={props.index}/>
    }
  }
  
  return (
      <Accordion expanded={expanded === true} onChange={handleChange()}>

        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Grid container spacing={3}>

            <Grid item lg={4} md={4} sm={4} xs={12}>
              <Typography >
                {passos[props.index].nome}
              </Typography>
            </Grid>

            <Grid item lg={4} md={4} sm={4} xs={12}>
              <Typography>
                {passos[props.index].papel}
              </Typography>
            </Grid>

            <Grid item lg={4} md={4} sm={4} xs={12}>
              <SwitchAcompanhamentoProcesso index={props.index}/> 
            </Grid>

          </Grid>

        </AccordionSummary>

        <AccordionDetails>
          {render ? 
            renderAccordionDetails() : 
            <Stack alignItems="center">
              <CircularProgress />
            </Stack>
            }
        </AccordionDetails>

      </Accordion>
  );
}
