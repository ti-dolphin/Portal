import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'

import {
  Stack,
  MenuItem,
  TextField
} from "@mui/material"

export default function SelectCampoPasso(props) {
  const [passos,setPassos] = useAtom(Passos)
  const [ opcoesPassos, setOpcoesPassos ] = useState([])
  const [ opcoesCampos, setOpcoesCampos ] = useState([]);
  const [selecionado,setSelecionado] = useState([])

  useEffect(()=>{
    setaOpInicio()
  },[passos])

  const setaOpInicio = () =>{
    if(props.valorInicial && props.valorInicial != -1){
      var opPassos = [];
      var opCampos = [];
      var idPasso;
      passos.map((p, pindex) => {
        if(p.decisao != 'sim'){
          p.index = pindex
          opPassos.push(p);
          p.campos.map((c) => {
            if(c.id == props.valorInicial){
              idPasso = p.id;
            }
          })
        }
      })
      passos.map((p, pindex) => {
        if(p.decisao != 'sim'){
          if(p.id === idPasso){
            p.campos.map((c, cindex) => {
              c.index = cindex;
              opCampos.push(c);
            })
          }
        }
      })
      setOpcoesCampos(opCampos);
      setOpcoesPassos(opPassos);
      encontraCampo();
    }else{
      var opPassos = [];
      passos.map((p, pindex) => {
        if(p.decisao != 'sim'){
          p.index = pindex
          opPassos.push(p);
        }
      })
      setOpcoesPassos(opPassos);
    }
  }

  const encontraCampo = () => {
    var verifica = true
    passos.map((p, pindex) => {
      if(p.decisao != 'sim'){
        p.campos.map((c, cindex) => {
          if(c.id == props.valorInicial){
            p.index = pindex;
            c.index = cindex;
            setSelecionado([p,c])
            verifica = false
          }
        })
      }
    })

    if(verifica){ // se foi procurar o campo e nao achou, reseta
      props.reset()
    }
  }

  const handleChangePasso = (newValue) =>{
    if(newValue === '' || !newValue){
      setSelecionado([])
      if(props.reset){
        props.reset()
      }
    }else{
      var op = [];
      var aux = [newValue];
      setSelecionado(aux);
      passos.map((p) => {
          if(p.id == aux[0].id){
              p.campos.map((campo,index) => {
                if(campo.tipo !== 'Campo Cópia'){
                  campo.campoIndex = index
                  op.push(campo)
                }
              })
          }
      })
      if(props.reset){
        props.reset()
      }
      setOpcoesCampos(op);
    }
  }

  const handleChangeCampo = (newValue) =>{
    if(newValue === '' || !newValue){
      var aux = [selecionado[0]];
      setSelecionado(aux)
      if(props.reset){
        props.reset()
      }
    }else{
      var aux = [...selecionado, newValue];
      setSelecionado(aux);
      if(aux.length == 2){
        var obj = {
          passoIndex : aux[0].index,
          passoId : aux[0].id,
          campoIndex : aux[1].campoIndex,
          campoId : aux[1].id
        }
        if(props.callback){
          props.callback(obj)
        }
      }
    }
  }

  return (
    <Stack spacing={2}>
      {opcoesPassos.length > 0 &&
        <TextField
          fullWidth
          label='Selecione o Passo'
          select
          value={selecionado[0]}
          defaultValue={selecionado[0]}
          onChange={(e) => {
            handleChangePasso(e.target.value);
          }}
        >
          <MenuItem value=''></MenuItem>
          {opcoesPassos.map((option) =>
            <MenuItem value={option}>{option.nome ? option.nome : option.tipo === 'Multi-Seleção' ? 'Seleção de Projetos' : option.tipo || ""}</MenuItem>  
          )}  
        </TextField>
      }

      {selecionado[0] && opcoesCampos &&
        <TextField
          fullWidth
          label='Selecione o Campo'
          select
          value={selecionado[1]}
          onChange={(e) => {
            handleChangeCampo(e.target.value);
          }}
        >
          <MenuItem value=''></MenuItem>
          {opcoesCampos.map((option) =>
            <MenuItem value={option}>{option.nome ? option.nome : option.tipo === 'Multi-Seleção' ? 'Seleção de Projetos' : option.tipo || ""}</MenuItem>  
          )}  
        </TextField>
      }
    </Stack>
  );
}

