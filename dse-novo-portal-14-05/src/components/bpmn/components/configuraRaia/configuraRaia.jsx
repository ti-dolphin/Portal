import {forwardRef, useState, useImperativeHandle} from 'react';
import Modal from '../../../modal/modal'

import { 
    FormControl,
    Select,
    InputLabel,
    Button,
    Grid,
    Box
} from '@mui/material'


const ConfiguraRaia = forwardRef((props,ref) => {

    const [showModalPapel, setShowModalPapel] = useState(false) // quando uma raia é adicionada, recebe o id da raia
    const [papel, setPapel] = useState('')
    const [raiaID, setRaiaID] = useState('')

    useImperativeHandle(ref, () => ({
        setaModal(raiaID){
            setShowModalPapel(true)
            setRaiaID(raiaID)
        },
        retornaRaia(){
            var papel_nome
            props.raias.map((raia) => {
                if(raia.id == papel ){
                    papel_nome = raia.nome
                }
            })

            return {id: raiaID, papel_id: papel, papel_nome: papel_nome  }
        },
        limpaPapel(){
            setPapel('')
        }
    }))

    const salvar = () =>{
        if(papel){
            setShowModalPapel(false)
            props.callback()
        } else{
            alert('Selecione um papel para a raia cadastrada')
        }
    }

    return (
        <Modal 
            fechamodal={()=>{setShowModalPapel(false)}} 
            title='Selecione o papel da raia cadastrada' 
            show={showModalPapel}
        >
            <Box mb={2} />
            <Grid container spacing={2}>
                <Grid item xs={12} sx={{textAlign: 'center'}}>
                    <FormControl variant="outlined" >

                        <InputLabel htmlFor="outlined-Selecione o papel-native-simple">Selecione o papel</InputLabel>
                        <Select
                            native
                            value={papel}
                            onChange={(event)=>setPapel(event.target.value)}
                            label="Selecione o papel"
                            inputProps={{
                                name: 'Selecione o papel',
                                id: 'outlined-Selecione o papel-native-simple',
                            }}
                            >
                                <option aria-label="None" value="" />
                                {props.raias.map((raia) => (
                                    <option value={raia.id}>{raia.nome}</option>
                                ))}

                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sx={{textAlign: 'center'}}>
                    <Button onClick={() => salvar()}  variant="contained" color="primary">
                        Salvar
                    </Button>
                </Grid>
            </Grid>


        </Modal>
    )
})

export default ConfiguraRaia