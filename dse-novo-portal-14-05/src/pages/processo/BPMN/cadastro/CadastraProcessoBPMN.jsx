import { useState, useEffect } from 'react';
import ListaPassos from './components/listaPassos/ListaPassos'
import { api } from '../../../../config.ts'
import { useParams } from 'react-router-dom'
import Page from '../../../../components/Page';
import Header from '../../../../components/Header'
import Loading from '../../../../components/Loading'
import ReactBpmn from 'react-bpmn';
import { validaTasks } from '../models/Processo'
import { useAtom } from "jotai"
import { useNavigate } from 'react-router-dom'
import { Passos, Passo } from './components/listaPassos/PassoAtom'
import { cadastraProcesso }  from '../models/Processo'
import FullScreenDialog from '../../../../components/FullScreenDialog'
import './style.css'
import { useDispatch } from '../../../../redux/store';
import { getUsers, getUsersObservadores } from '../../../../redux/slices/users'
import ObservadoresForm from '../../../../components/processo/ObservadoresForm'
import TituloDinamicoForm from './components/tituloDinamico/TituloDinamicoForm'
import PrazoProcessoForm from './components/prazoProcessoForm/PrazoProcessoForm'
import {
    Container,
    Box
} from "@mui/material"

export default function CadastraProcessoBPMN(props){
    const dispatch = useDispatch();
    const params = useParams()
    const [processo, setProcesso] = useState()
    const [loading, setLoading] = useState(false)
    const [showModalObservadores, setShowModalObservadores] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [showModalTitulo, setShowModalTitulo] = useState(false)
    const [showModalPrazo, setShowModalPrazo] = useState(false)
    const [processoPapeisPrazo, setProcessoPapeisPrazo] = useState([])
    const [passos, setPassos] = useAtom(Passos)
    const navigate = useNavigate();

    useEffect(() => {
        getProcesso()
    },[])

    const getProcesso = () => {
        api.get('processo-cadastro/diagrama/'+params.id).then((processo) => {
            setProcesso(processo.data)
        })
        getProcessoPapeisPrazo()
    }

    const getProcessoPapeisPrazo = () => {
        api.get('/define-prazo-processo/processo/'+params.id).then((papel) => {
            setProcessoPapeisPrazo(papel.data)
        })
    }

    const salvar = () => {
        var errTask = validaTasks(passos)
        if(!errTask){
            setLoading(true)
            cadastraProcesso({
                processo_anterior: params.id_anterior,
                processo_atual: params.id,
                passos: passos
            }).then((result) => {
                setLoading(false)
                setPassos(null)
                navigate('/configuracao-processo')
            }).catch((error) => {
                console.log(error)
            })
        }
    } 

    const observadores =  async () => {
        await dispatch(getUsersObservadores(params.id, 'Cadastro'))
        await dispatch(getUsers())
        setShowModalObservadores(true)
    }   

    const tituloDinamico = () => {
        setShowModalTitulo(true)
    }

    const prazoProcesso = () => {
        setShowModalPrazo(true)
    }

    return(
        processo ? 
            <Page title="Configuração de processos">
                <Loading open={loading}/>
                <Container maxWidth={false}>
                    <Header 
                        title='CONFIGURAÇÃO DE PROCESSO' 
                        subtitle='CONFIGURAÇÃO DE PROCESSO' 
                        buttons={[
                            {text: "Prazo do Processo", callback: prazoProcesso},
                            {text: "Título dinâmico", callback: tituloDinamico },
                            {text: "Observadores", callback: observadores },
                            {text: "Abrir Diagrama", callback: () => setShowModal(true) }, 
                            {text: "Salvar Processo", callback: salvar } 
                        ]}/>
                    <Box mb={3}/>
                    <ListaPassos processo={processo}/>
                </Container>

                <FullScreenDialog
                    open={showModal} handleClose={()=>setShowModal(false)}
                >
                    <Box sx={{height: '100%'}}>
                        <ReactBpmn
                            diagramXML={processo.xml}
                        />
                    </Box>
                </FullScreenDialog>

                <FullScreenDialog
                    open={showModalObservadores} handleClose={()=>setShowModalObservadores(false)}
                >
                    <ObservadoresForm processo_id={params.id} setOpen={setShowModalObservadores}/>
                </FullScreenDialog>

                <FullScreenDialog
                    open={showModalTitulo} handleClose={()=>setShowModalTitulo(false)}
                >
                    <TituloDinamicoForm processo_id={params.id} setOpen={setShowModalTitulo}/>
                </FullScreenDialog>
                
                <FullScreenDialog
                    open={showModalPrazo} handleClose={()=>setShowModalPrazo(false)}
                >
                    <PrazoProcessoForm getProcessoPapeisPrazo={getProcessoPapeisPrazo} processoPapeisPrazo={processoPapeisPrazo} processo_id={params.id} setOpen={setShowModalPrazo} />
                </FullScreenDialog>
            </Page>
        : null
    )
}
