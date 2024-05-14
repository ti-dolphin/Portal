
import React, { useState, useEffect } from 'react';
import {atom, useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../../PassoAtom'

import {
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  TextField
} from "@mui/material"

export default function SelectCampoPasso(props) {
  const [passos,setPassos] = useAtom(Passos)
  const [opcoes,setOpcoes] = useState([])
  const [selecionado,setSelecionado] = useState([])

  useEffect(()=>{
    setaOpPassos()
  },[passos,selecionado])

  const setaOpPassos = () => {
    var op = []

    if(props.valorInicial && props.valorInicial != -1 && selecionado.length == 0){
      encontraCampo()
    } else if(props.valorInicial && props.valorInicial != -1 && selecionado.length > 1 && selecionado[1].id != props.valorInicial){
      encontraCampo()
    } else{

      if(selecionado.length == 0){ // seleciona os passos
          passos.map((p,index) => {
              if(p.decisao != 'sim'){
                p.index = index 
                op.push(p)
              }
          })
          if(props.reset){
            props.reset()
          }
      } else if(selecionado.length == 1){ // seleciona os campos do passo
          passos.map((p) => {
              if(p.id == selecionado[0].id){
                  p.campos.map((campo,index) => {
                    if(campo.tipo != 'Arquivo'){
                      campo.campoIndex = index
                      op.push(campo)
                    }
                  })
              }
          })
          if(props.reset){
            props.reset()
          }
      } else if(selecionado.length == 2){
        var obj = {
          passoIndex : selecionado[0].index,
          passoId : selecionado[0].id,
          campoIndex : selecionado[1].campoIndex,
          campoId : selecionado[1].id
        }
        if(props.callback){
          props.callback(obj)
        }
      }
      
    }
    setOpcoes(op)

  }

  const encontraCampo = () => {
    var verifica = true
    passos.map((p) => {
      if(p.decisao != 'sim'){
        p.campos.map((c) => {
          if(c.id == props.valorInicial){
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

  const handleChange = (newValue) => {
    if(!newValue.length == 1 || !newValue[0].tipo){ // nao permite excluir o passo quando tem campo selecionado
      setSelecionado(newValue)
    }
  }

  return (
    <FormControl variant="outlined" sx={{width: '100%'}}>
        <Autocomplete
            multiple
            id="tags-outlined"
            options={opcoes}
            value={selecionado}
            getOptionLabel={(option) => option.nome ? option.nome : option.tipo === 'Multi-Seleção' ? 'Seleção de Projetos' : option.tipo || ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            onChange={(event,newValue)=>{
                handleChange(newValue)
            }}
            renderInput={(params) => (
            <TextField
                {...params}
                variant="outlined"
                label="Selecione o campo"
            />
            )}
        />
    </FormControl>
  );
}





// import React, { useState, useEffect } from 'react';
// import {atom, useAtom } from "jotai"
// import {Passos} from '../../../../../../../../../../../PassoAtom'

// import {
//   FormControl,
//   InputLabel,
//   Select,
//   Autocomplete,
//   TextField
// } from "@mui/material"

// export default function SelectCampoPasso(props) {
//   const [passos, setPassos] = useAtom(Passos)

//   let [ops, campo] = [[], []];
//   try {
//     // [ops, campo] = getPassos(props.valorInicial, [], passos, props.reset, props.callback);
//   } catch (error) {
//     console.error(error);
//   }
//   const [opcoes,setOpcoes] = useState(ops ?? [])
//   const [selecionado,setSelecionado] = useState(campo ?? [])

//   // useEffect(()=>{
//   //   setaOpPassos()
//   // },[passos,selecionado])

//   const setaOpPassos = () => {
//     var op = []
    
//     if(props.valorInicial && props.valorInicial != -1 && selecionado.length == 0){
//       encontraCampo()
//     } else if(props.valorInicial && props.valorInicial != -1 && selecionado.length > 1 && selecionado[1].id != props.valorInicial){
//       encontraCampo()
//     } else{

//       if(selecionado.length == 0){ // seleciona os passos
//           passos.map((p,index) => {
//               if(p.decisao != 'sim'){
//                 p.index = index 
//                 op.push(p)
//               }
//           })
//           if(props.reset){
//             props.reset()
//           }
//       } else if(selecionado.length == 1){ // seleciona os campos do passo
//           passos.map((p) => {
//               if(p.id == selecionado[0].id){
//                   p.campos.map((campo,index) => {
//                     if(campo.tipo != 'Arquivo'){
//                       campo.campoIndex = index
//                       op.push(campo)
//                     }
//                   })
//               }
//           })
//           if(props.reset){
//             props.reset()
//           }
//       } else if(selecionado.length == 2){
//         var obj = {
//           passoIndex : selecionado[0].index,
//           passoId : selecionado[0].id,
//           campoIndex : selecionado[1].campoIndex,
//           campoId : selecionado[1].id
//         }
//         if(props.callback){
//           props.callback(obj)
//         }
//       }
      
//     }
//     setOpcoes(op)

//   }

//   const encontraCampo = () => {
//     var verifica = true
//     passos.map((p) => {
//       if(p.decisao != 'sim'){
//         p.campos.map((c) => {
//           if(c.id == props.valorInicial){
//             setSelecionado([p,c])
//             verifica = false
//           }
//         })
//       }
//     })

//     if(verifica){ // se foi procurar o campo e nao achou, reseta
//       props.reset()
//     }
//   }

//   const handleChange = (newValue) => {
//     if(!newValue.length == 1 || !newValue[0].tipo){ // nao permite excluir o passo quando tem campo selecionado
//       setSelecionado(newValue)
//     }
//   }

//   return (
//     <FormControl variant="outlined" sx={{width: '100%'}}>
//         <Autocomplete
//             multiple
//             id="tags-outlined"
//             options={opcoes}
//             value={selecionado}
//             getOptionLabel={(option) => option.nome ? option.nome : option.tipo === 'Multi-Seleção' ? 'Seleção de Projetos' : option.tipo || ""}
//             isOptionEqualToValue={(option, value) => option.id === value.id}
//             filterSelectedOptions
//             onChange={(event,newValue)=>{
//                 handleChange(newValue)
//             }}
//             renderInput={(params) => (
//             <TextField
//                 {...params}
//                 variant="outlined"
//                 label="Selecione o campo"
//             />
//             )}
//         />
//     </FormControl>
//   );
// }

// function getPassos (valorInicial, selecionado, passos, onReset, callback) {
//   var op = []
//   let campo;
//   if(valorInicial && valorInicial != -1 && selecionado.length == 0){
//     campo = encontraCampo(passos, valorInicial, onReset)
//   } else if(valorInicial && valorInicial != -1 && selecionado.length > 1 && selecionado[1].id != valorInicial){
//     campo = encontraCampo(passos, valorInicial, onReset)
//   } else{

//     if(selecionado.length == 0){ // seleciona os passos
//         passos.map((p,index) => {
//             if(p.decisao != 'sim'){
//               p.index = index 
//               op.push(p)
//             }
//         })
//         if(onReset){
//           onReset()
//         }
//     } else if(selecionado.length == 1){ // seleciona os campos do passo
//         passos.map((p) => {
//             if(p.id == selecionado[0].id){
//                 p.campos.map((campo,index) => {
//                   if(campo.tipo != 'Arquivo'){
//                     campo.campoIndex = index
//                     op.push(campo)
//                   }
//                 })
//             }
//         })
//         if(onReset){
//           onReset()
//         }
//     } else if(selecionado.length == 2){
//       var obj = {
//         passoIndex : selecionado[0].index,
//         passoId : selecionado[0].id,
//         campoIndex : selecionado[1].campoIndex,
//         campoId : selecionado[1].id
//       }
//       if(callback){
//         callback(obj)
//       }
//     }
    
//   }
//   return [op ?? [], campo ?? []];
//   // setOpcoes(op)
// }

// function encontraCampo (passos, valorInicial, onReset) {
//   var verifica = true
//   let returnData = null;
//   passos.map((p) => {
//     if(p.decisao != 'sim'){
//       p.campos.map((c) => {
//         if(c.id == valorInicial){
//           verifica = false
//           returnData = [p,c];
//         }
//       })
//     }
//   })

//   if(verifica){ // se foi procurar o campo e nao achou, reseta
//     onReset()
//   }

//   return returnData;
// }