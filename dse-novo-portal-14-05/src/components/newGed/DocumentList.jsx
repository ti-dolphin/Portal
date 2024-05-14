import { useState, useEffect } from 'react'
import { Grid, Stack, Box } from '@mui/material'
import { useDispatch, useSelector } from '../../redux/store'
import { getPastes, getPastePath, setPastePath } from '../../redux/slices/paste'
import { getArchives, setArchives } from '../../redux/slices/archives'
import OptionsDocumentList from './OptionsDocumentList'
import BreadcrumbDocumentList from './BreadcrumbDocumentList'
import PasteButton from './PasteButton'
import ArchiveButton from './ArchiveButton'
import Loading from '../Loading'
import SearchInput from '../SearchInput'
import { verifyPermission } from '../../utils/utils'
import { useSearchParams } from 'react-router-dom'


export default function DocumentList({ idCategoria, idProjeto, active }){
    const dispatch = useDispatch();
    const { pastes, pastePath } = useSelector((state) => state.paste)
    const { archives } = useSelector((state) => state.archives)
    const [ view, setView ] = useState('List');
    const [ pastesState, setPastesState ] = useState([]);
    const [ archivesState, setArchivesState ] = useState([]);
    const isLoadingPaste = useSelector((state) => state.paste.isLoading)
    const isLoadingArchives = useSelector((state) => state.archives.isLoading)
    const [status, setStatus] = useState(0); // 0 ativo, 1 inativo, 2 todos
    const [selectedPaste, setSelectedPaste] = useState('');
    const [searchParams] = useSearchParams()
    const [actualActive, setActualActive] = useState(0);
    const selectedPasteId = searchParams.get("selectedPasteId")

    useEffect(() => {
        if (selectedPasteId !== undefined) {
            setSelectedPaste(parseInt(selectedPasteId));
        }
    }, [selectedPasteId]);

    useEffect(() => {
        setPastesState(pastes);
        setArchivesState(archives);
    },[pastes, archives])

    useEffect(() => {
        GetPastesAndArchives()
    },[selectedPaste, status])

    useEffect(() => {
        if(active !== actualActive){
            setActualActive(active);
            setSelectedPaste(null);
            GetPastesAndArchives(true)
        }
    },[active])

    const GetPastesAndArchives = (changeCategorie) => {
        if(idCategoria !== 0){
            dispatch(getPastes(idCategoria, idProjeto, status, selectedPaste))
        } else{
            dispatch(setPastePath([]));
        }
        if(changeCategorie){
            dispatch(setPastePath([]));
            dispatch(setArchives([]));
        }else{
            if(selectedPaste !== null && selectedPaste !== undefined && selectedPaste !== ''){
                dispatch(getPastePath(selectedPaste))
                dispatch(getArchives(status, selectedPaste))
            } else{
                dispatch(setPastePath([]));
                dispatch(setArchives([]));
            }
        }
    }

    const selectPaste = (paste) => {
        setSelectedPaste(paste.id)
    }

    const callbackSearch = (value) => {
        if(value && value !== ''){
            var filteredPastes = pastes.filter((paste) => {
                var verify = false
                if(paste.nome.toString().toLowerCase().indexOf(value.toLowerCase()) !== -1){
                    verify = true
                }
                if(verify){
                    return paste
                }
            })
            var filteredArchives = archives.filter((archive) => {
                var verify = false
                if(archive.titulo.toString().toLowerCase().indexOf(value.toLowerCase()) !== -1){
                    verify = true
                }
                if(verify){
                    return archive
                }
            })
            setPastesState(filteredPastes)
            setArchivesState(filteredArchives)
        } else{
            setPastesState(pastes)
            setArchivesState(archives)
        }
    }

    return(
        <Grid container spacing={2} sx={{mt:2}}>
            <Loading open={isLoadingPaste || isLoadingArchives}/>
            <Grid item xs={12} mb={1}>
                <BreadcrumbDocumentList path={pastePath} callback={setSelectedPaste}/>
            </Grid>
            
            <Grid item xs={12} mb={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={2}>
                        <SearchInput live callback={callbackSearch} label='Pesquisar' idCategoria={idCategoria}/>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <Stack direction='row' alignItems='center' spacing={2}>
                            <OptionsDocumentList GetPastesAndArchives={GetPastesAndArchives} idCategoria={idCategoria} idProjeto={idProjeto} status={status} setStatus={setStatus} selectedPaste={selectedPaste} view={view} setView={setView}/>
                        </Stack>
                    </Grid>
                </Grid>

            </Grid>

            
            {pastesState.map((paste) => {
                if(verifyPermission(paste.permissao)[1]){
                    return (
                        view === 'Grid' ?
                            <Grid key={'paste_'+paste.id} item lg={3} md={4} sm={6} xs={12}>
                                <PasteButton GetPastesAndArchives={GetPastesAndArchives} paste={paste} callback={selectPaste}/>
                            </Grid> 
                        :
                            <Grid key={'paste_'+paste.id} item xs={12}>
                                <PasteButton GetPastesAndArchives={GetPastesAndArchives} paste={paste} callback={selectPaste}/>
                            </Grid> 
                    )
                }
            })}
            {archivesState.map((archive) =>
                view === 'Grid' ?
                    <Grid key={'paste_'+archive.id} item lg={3} md={4} sm={6} xs={12}>
                        <ArchiveButton GetPastesAndArchives={GetPastesAndArchives} archive={archive}/>
                    </Grid>
                :
                <Grid key={'paste_'+archive.id} item xs={12}>
                    <ArchiveButton GetPastesAndArchives={GetPastesAndArchives} archive={archive}/>
                </Grid>
            )}
            

        </Grid>
    )
}