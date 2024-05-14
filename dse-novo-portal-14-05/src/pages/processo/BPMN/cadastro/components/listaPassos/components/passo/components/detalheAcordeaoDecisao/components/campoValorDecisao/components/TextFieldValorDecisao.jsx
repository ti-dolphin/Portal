
import { useState, useEffect } from 'react';
import { Passos} from '../../../../../../../PassoAtom'
import { useAtom } from "jotai"
import update from 'immutability-helper';
import { mask } from 'remask'
import { getMascaraId } from '../../../../../../../../../../models/Mascara'

import {
    TextField
} from "@mui/material"

export default function TextFieldValorDecisao(props) {
    console.log('TextFieldValorDecisao')
    const [passos,setPassos] = useAtom(Passos)
    const [valorCampo, setValorCampo] = useState(passos[props.index].processo_fluxo_cadastro[props.indexFluxo].condicoes[props.indexDecisao].valor_condicao)
    const [mascara,setMascara] = useState(null)
    const [type,setType] = useState('text')

    useEffect(()=>{
        switchTipoCampo()
    },[])

    const switchTipoCampo = () => {
        switch (props.campoSelecionado.tipo) {

            case 'Texto com máscara personalizada':
                getMascaraId(props.campoSelecionado.processo_campo_mascara.mascara_id).then((mascara) => {
                    if(mascara.length > 0){
                        setMascara(mascara[0].mascara)
                    }
                })
                break;

            case 'Número':
                setType('number')
                break;

            case 'Data':
                setType('date')
                break;

            case 'Celular':
                setMascara('(99) 99999-9999')
                break;

            case 'Cep':
                setMascara('99999-999')
                break;

            case 'CPF/CNPJ':
                setMascara('999.999.999-99')
                break;
        
            case 'Moeda':
                setValorCampo("R$ 0,00")
                break;
                
            default:
                break;
        }
    }

    const editaValorCondicao = () => {

        setPassos(update(passos,{
            [props.index]:{ // id do passo
                processo_fluxo_cadastro : {
                    [props.indexFluxo] : {
                        condicoes : {
                            [props.indexDecisao] : {
                                valor_condicao : {
                                    $set : props.campoSelecionado.tipo === 'Moeda' ? parseFloat(valorCampo.replace(/[\D]+/g,''))/100 : valorCampo
                                }
                            }
                          }
                    }
                }
            }
        }))
    }

    const editaValorCampo = (event) => {
        if(props.campoSelecionado.tipo === 'CPF/CNPJ'){
            if(event.target.value.length > 14){
                setMascara('99.999.999/9999-99')
            } else{
                setMascara('999.999.999-99')
            }
        } else if(props.campoSelecionado.tipo === 'Moeda'){
            event.target = maskMoney(event.target)
        }
        
        setValorCampo(event.target.value)
        
    }

    const maskMoney = (campo) => {

        if(campo.value){
            campo.value = campo.value.toString();
            if(campo.value.indexOf("R$") === -1){ // caso não exista 'R$' na string, significa que é o primeiro valor, que vem do banco cru
                campo.value = "R$ "+parseFloat(campo.value).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            } else{
                var temp = parseInt(campo.value.replace(/[\D]+/g,'') ); // converte para inteiro e retira todos os caracteres nao numéricos
                var tmp = temp+'';
                if(tmp.length <= 2){
                    if(tmp.length === 1){
                        campo.value = "R$ 0,0"+ tmp;
                    } else{
                        campo.value = "R$ 0,"+tmp;
                    }
                }else{
                    tmp = tmp.replace(/([0-9]{2})$/g, ",$1"); // coloca os digitos de centavos
                    tmp = tmp.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // separa os milhares colocando ponto
    
                    if(tmp === 'NaN' || temp === undefined){
                        tmp = 0;
                    }
                    
                    if(tmp === 0){
                        campo.value = "R$ 0,00";
                    } else{
                        campo.value = "R$ "+ tmp;
                    }
                }
            }
        } else{
            campo.value = "R$ 0,00";
        }

        return campo
    }
    return (
        <TextField
            InputLabelProps={{
                shrink: valorCampo || type === 'date' ? true : false,
            }}
            type={type}
            style={{width: '100%'}} 
            value={mascara ? mask(valorCampo,mascara) : valorCampo}
            onBlur={editaValorCondicao} 
            label="Valor do campo" 
            variant="outlined" 
            onChange={editaValorCampo}
        />
    );
}