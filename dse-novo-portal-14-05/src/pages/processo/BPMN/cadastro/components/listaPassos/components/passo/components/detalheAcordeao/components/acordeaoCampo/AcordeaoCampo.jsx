import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import DetalheAcordeaoCampo from './components/detalheAcordeaoCampo/DetalheAcordeaoCampo'
import { useAtom } from "jotai"
import { Passos } from '../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  IconButton,
  Grid
} from "@mui/material"

export default function AcordeaoCampo(props) {
  const [expanded, setExpanded] = useState(false);
  const [passos,setPassos] = useAtom(Passos)

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const removeCampo = () => {
    setPassos(update(passos,{
      [props.index]:{
        campos: {
          $splice: [[props.campoIndex, 1]] 
        }
      }
    }))
  }

  return (
    <div>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>

        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Grid container spacing={0}>

            <Grid item lg={4} md={4} sm={4} xs={12}>
              <Typography >{passos[props.index].campos[props.campoIndex].tipo == 'Multi-Seleção' ? 'Seleção de Projetos' : passos[props.index].campos[props.campoIndex].tipo == 'Celular' ? 'Celular/Fixo' : passos[props.index].campos[props.campoIndex].tipo}</Typography>
            </Grid>

            <Grid item lg={7} md={7} sm={7} xs={11}>
              <Typography >{passos[props.index].campos[props.campoIndex].nome}</Typography>
            </Grid>

            <Grid item lg={1} md={1} sm={1} xs={1}>
              <IconButton aria-label="delete" onClick={() => removeCampo()}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>

          </Grid>

        </AccordionSummary>

        <AccordionDetails>
          <DetalheAcordeaoCampo index={props.index} campoIndex={props.campoIndex} setExpanded={setExpanded}/>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
