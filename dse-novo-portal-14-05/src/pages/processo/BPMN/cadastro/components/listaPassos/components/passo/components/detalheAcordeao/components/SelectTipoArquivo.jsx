import { useState } from 'react';
import { useAtom } from "jotai"
import {Passos} from '../../../../../PassoAtom'
import {getProjetos} from '../../../../../../../../models/Projeto'

import {
    FormControl,
    Select,
    InputLabel,
    Button,
    Grid
} from "@mui/material"

export default function SelectTipoArquivo(props) {
    const [tipo, setTipo] = useState('')
    const [passos,setPassos] = useAtom(Passos)

    const adicionaCampo = async () => {
        if(tipo){
            setTipo('')
            var novoCampo = {
                id: idAleatorio(),
                tipo: tipo,
                obrigatoriedade: 1,
                status: 'Ativo',
                processo_passo_cadastro_id: passos[props.index].id,
                processo_cadastro_id : passos[props.index].processo_cadastro_id,
            }

            switch (tipo) {
                case 'Texto com máscara personalizada':
                    novoCampo.processo_campo_mascara = {}
                    break;

                case 'Seleção':
                    novoCampo.processo_campo_opcao_select = []
                    break;

                case 'Multi-Seleção':
                    novoCampo.processo_campo_opcao_select = []
                    break;

                case 'Arquivo':
                    novoCampo.processo_campo_arquivo = {}
                    novoCampo.processo_campo_arquivo.converte_imagem = true
                    novoCampo.processo_campo_arquivo.substitui_arquivo = true
                    break;
                
                case 'Campo Cópia':
                    novoCampo.processo_campo_copia = {}
                    break;
            
                default:
                    break;
            }
            props.callback(novoCampo)
        } else{
            alert('Favor selecione um tipo de campo.')
        }
    }

    const idAleatorio = () => { // retorna uma string composta de 4 numeros aleatórios
        return  Math.floor(Math.random() * 10).toString()+Math.floor(Math.random() * 10).toString()+Math.floor(Math.random() * 10).toString()+Math.floor(Math.random() * 10).toString()
    }

    // const opcaoSelectProjetos = async () => {
    //     return new Promise(async function (resolve, reject) {
    //         const projetos = await getProjetos()
    //         var op = []
    //         projetos.map((p) => {
    //             op.push({label: p.nome, value: p.id})
    //         })
    //         resolve(op)
    //     })
    // }

    return(
        <Grid container spacing={3} alignItems="center">

            <Grid item lg={6} md={6} sm={6} xs={12}>
                <FormControl variant="outlined" >
                    <InputLabel htmlFor="outlined-Selecione o tipo de campo-native-simple">Selecione o tipo de campo</InputLabel>

                    <Select
                        native
                        value={tipo}
                        onChange={(event)=>setTipo(event.target.value)}
                        label="Selecione o tipo de campo"
                        inputProps={{
                            name: 'Selecione o tipo de campo',
                            id: 'outlined-Selecione o tipo de campo-native-simple',
                        }}
                    >
                        <option aria-label="None" value="" />
                        <option>Texto</option>
                        <option>Área de texto</option>
                        <option>Texto com máscara personalizada</option>
                        <option>Número</option>
                        <option>Data</option>
                        <option value='Celular'>Celular/Fixo</option>
                        <option>Cep</option>
                        <option>CPF/CNPJ</option>
                        <option>Moeda</option>
                        <option>Seleção</option>
                        <option>Arquivo</option>
                        <option value='Multi-Seleção'>Seleção de Projetos</option>
                        <option>Campo Cópia</option>
                    </Select>

                </FormControl>

            </Grid>

            <Grid item lg={6} md={6} sm={6} xs={12} >
                <Button onClick={() => adicionaCampo()} variant="contained" color="primary">
                    Adicionar
                </Button>
                
            </Grid>

        </Grid>
    )
}