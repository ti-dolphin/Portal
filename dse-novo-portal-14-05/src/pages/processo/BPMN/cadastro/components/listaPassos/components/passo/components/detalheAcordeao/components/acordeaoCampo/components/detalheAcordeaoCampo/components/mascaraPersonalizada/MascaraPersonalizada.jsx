import { useState, useEffect } from 'react';
import {getMascara} from '../../../../../../../../../../../../../models/Mascara'
import Modal from '../../../../../../../../../../../../../../../../components/modal/modal'
import CadastroMascaraPersonalizada from './components/CadastroMascaraPersonalizada';
import { useAtom } from "jotai"
import {Passos} from '../../../../../../../../../../PassoAtom'
import update from 'immutability-helper';

import {
    TextField,
    Autocomplete
} from "@mui/material"


export default function MascaraPersonalizada(props) {
    const [passos,setPassos] = useAtom(Passos)
    const [mascaras,setMascaras] = useState([])
    const [mascaraSelecionada,setMascaraSelecionada] = useState({id: 0, mascara: 'Cadastrar máscara'})
    const [showModal,setShowModal] = useState(false)

    useEffect(()=>{
        GetMascara()
    },[])

    useEffect(()=>{
        setaValueMascara(mascaras)
    },[mascaras,passos[props.index].campos[props.campoIndex].processo_campo_mascara.mascara_id])

    const GetMascara = () => {
        getMascara().then((mascaras) => {
            mascaras.push({id: 0, mascara: 'Cadastrar máscara'})
            setMascaras(mascaras)
        })
    }

    const onChangeMascara = (event, newValue) => {
        console.log(newValue)
        var val
        if(!newValue) {
            val = -1
        } else {
            val = newValue.id
        }
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_mascara: { 
                            mascara_id : { $set: val}
                        }
                    }
                }
            }
        }))

        if(newValue && newValue.id == 0){
            setShowModal(true)
        }
    }

    const callbackMascaraCadastrada = (novaMascara) => {
        setPassos(update(passos,{
            [props.index]:{ // id do passo
                campos: { // array de campos
                    [props.campoIndex]: { // id do campo 
                        processo_campo_mascara: { 
                            mascara_id : { $set: novaMascara.id}
                        }
                    }
                }
            }
        }))
        GetMascara()
        setShowModal(false)
    }

    const setaValueMascara = () => {
        mascaras.map((mascara) => {
            if(mascara.id == passos[props.index].campos[props.campoIndex].processo_campo_mascara.mascara_id){
                setMascaraSelecionada(mascara)
            }
        })
    }

    return (
        mascaras.length > 0 ?
        <>
            <Autocomplete
                id="combo-box-demo"
                options={mascaras}
                value={mascaraSelecionada}
                onChange={onChangeMascara}
                getOptionLabel={(option) => option.mascara || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                style={{ width: '100%' }}
                renderInput={(params) => <TextField {...params} label="Selecione a máscara" variant="outlined" />}
            />

            <Modal
                fechamodal={()=>{
                    setShowModal(false)
                    setMascaraSelecionada({id: 0, mascara: 'Cadastrar máscara'})
                }} 
                title='Cadastro de máscara personalizada' 
                show={showModal}
                btnsave={false} 
                btnclose={false}
            >
                <CadastroMascaraPersonalizada callback={callbackMascaraCadastrada}/>
            </Modal>
        </>
        : null 
    );
}