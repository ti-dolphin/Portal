import { useState, useEffect } from 'react'
import { 
    TableRow, 
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Button,
    Box
 } from '@mui/material';
import FolderAttributesTableRowContent from './FolderAttributesTableRowContent'
import FolderAttributesTableRowForm from './FolderAttributesTableRowForm'
import FolderAttributesTableRowActions from './FolderAttributesTableRowActions'
import { getPasteAtrributes, inativePasteAtrribute } from '../../redux/slices/paste'
import { useDispatch } from '../../redux/store'
import ConfigureAttributeSelect from './ConfigureAttributeSelect'

export default function FolderAttributesTableRow({ initialMode, folder, attribute, setAddAttribute }){
    const dispatch = useDispatch();
    const [mode, setMode] = useState(initialMode) // 0 - Estado inicial, 1 - Adicionando atributo, 2 - Editando Atributo
    const [submitForm, setSubmitForm] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [tipoSelect, setTipoSelect] = useState(false) // Quando o usuário seleciona o tipo do atributo como seleção, esta váriavel é setada como true
    const [configSelect, setConfigSelect] = useState(attribute?.configSelect ? attribute.configSelect : [])

    const deleteClick = async () => {
        await dispatch(inativePasteAtrribute(attribute.id))
        await dispatch(getPasteAtrributes(folder.id))
    }

    const editClick = () => {
        if(!tipoSelect){
            setMode(2)
        } else{
            setShowModal(true)
        }
    }

    const cancelClick = () => {
        setTipoSelect(false)
        if(mode === 1){
            setAddAttribute(false)
        } else{
            setMode(0)
        }
    }

    const saveClick = () => {
        setSubmitForm(true)
    }

    const switchMode = () => {
        switch (mode) {
            case 0: // Estado inicial, mostra o conteudo do atributo
                return <FolderAttributesTableRowContent attribute={attribute} />

            case 1: // Adição de atributo, renderiza o formulario vazio
                return <FolderAttributesTableRowForm 
                            folder={folder} 
                            submitForm={submitForm} 
                            setSubmitForm={setSubmitForm} 
                            setMode={setMode}
                            tipoSelect={tipoSelect} 
                            setTipoSelect={setTipoSelect} 
                            configSelect={configSelect}
                            setAddAttribute={setAddAttribute}
                        />

            case 2: // Edição de atributo, renderiza o formulario com os valores do atributo
                return <FolderAttributesTableRowForm 
                            folder={folder} 
                            isEdit 
                            attribute={attribute} 
                            submitForm={submitForm} 
                            setSubmitForm={setSubmitForm} 
                            setMode={setMode}
                            tipoSelect={tipoSelect} 
                            setTipoSelect={setTipoSelect}
                            configSelect={configSelect}
                        />

            default:
                break;
        }
    }

    const closeModalSelect = () => {
        setShowModal(false)
    }

    return(
        <>
            <TableRow hover>

                {switchMode()}

                <FolderAttributesTableRowActions 
                    tipoSelect={tipoSelect}
                    mode={mode}
                    Delete={deleteClick} 
                    Edit={editClick} 
                    Cancel={cancelClick}
                    Save={saveClick}
                />
                
            </TableRow>

            <Dialog open={showModal} onClose={closeModalSelect} maxWidth={'md'}>
                <DialogTitle>Cadastro de opções e valores do atributo de seleção.</DialogTitle>

                <Box mb={1} />

                <DialogContent>
                    <ConfigureAttributeSelect configSelect={configSelect} setConfigSelect={setConfigSelect}/>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => closeModalSelect()}>Fechar</Button>
                </DialogActions>

            </Dialog>
        </>
    )

}