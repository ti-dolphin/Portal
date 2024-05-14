import { useEffect, useState } from 'react'
import { Drawer, Stack, Typography, TextField, CircularProgress } from '@mui/material'
import { TreeView, TreeItem } from '@mui/x-tree-view'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Scrollbar from '../Scrollbar';
import { useSelector, useDispatch } from '../../redux/store'
import { getFolderTree } from '../../redux/slices/paste'
import { getArchiveGoogle } from '../../redux/slices/archives'
import SearchInput from '../../components/SearchInput'

export default function DrawerTreeView({ open, onCloseDrawer, id_folder, id_projeto, setTreeView, nome_projeto }){
    const dispatch = useDispatch()
    const { process } = useSelector((state) => state.process)
    const [nomeProjeto, setNomeProjeto] = useState(" ")
    const [nomeArquivo, setNomeArquivo] = useState("")
    const [folderTree, setFolderTree] = useState([])
    const [folderTreeRender, setFolderTreeRender] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState([]);
    const [errorSearch, setErrorSearch] = useState(false)

    const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
    };

    useEffect(() => {
        getFolderTreeLocal()
    },[id_folder])

    useEffect(()=>{
        if(folderTree.length > 0){
            if(folderTree[0]['nome_projeto'] !== undefined){
                setNomeProjeto(folderTree[0].nome_projeto)
            } else{
                setNomeProjeto(nome_projeto)
            }
        }
    },[folderTree])

    const mapeiaArquivos = (pasta, expandedAux) => {
        pasta.arquivos = pasta.arquivos.filter((a) => a.titulo.toLowerCase().includes(nomeArquivo.toLowerCase()));
        if (pasta.arquivos.length > 0) {
            expandedAux.push(pasta.id)
            pasta.render = true
        } else{
            pasta.render = false
        }
        if(pasta.filhos){
            pasta.filhos.map((f) => {
                return mapeiaArquivos(f, expandedAux)
            })
        }
    }

    const callbackSearch = (value) => {
        if(value !== nomeArquivo){
            setLoading(true)
            setNomeArquivo(value)
        }
    }

    useEffect(() => {
        if(folderTree.length > 0){
            if(nomeArquivo.length > 2){ // pesquisa na arvore
                const expandedAux = [folderTree[0].id]
                const folderTreeClone = JSON.parse(JSON.stringify(folderTree));
                mapeiaArquivos(folderTreeClone[0], expandedAux)
                folderTreeClone[0].render = true
                setFolderTreeRender(folderTreeClone)
                setExpanded(expandedAux)
                setErrorSearch(false)
            } else if(nomeArquivo.length === 0){ // o usuário zerou a pesquisa, reseta a arvore para o estado inicial
                setFolderTreeRender(folderTree)
                setExpanded([folderTree[0].id])
                setErrorSearch(false)
            } else{ // caso o usuário pesquise entre 1 e 2 caracteres somente, erro de pesquisa
                setErrorSearch(true)
            }
            setLoading(false)
        }
    },[nomeArquivo])

    const getFolderTreeLocal = async () => {
        var foldertree = await dispatch(getFolderTree(id_folder, id_projeto, process.projeto_id))
        setFolderTree(foldertree)
        setFolderTreeRender(foldertree)
        setLoading(false)
    }

    const getArquivo = async (arquivo) => {
        var result = await dispatch(getArchiveGoogle(arquivo.url));
        if(result && result.data){
            result.data.ged = 1
            setTreeView(result.data)
            onCloseDrawer()
        }else{
            onCloseDrawer()
            console.log('Erro ao pegar o arquivo')
        }
    }

    const mapeamento = (pais) => {
        return(
            pais.map((pai) => {
                if(!('render' in pai) || (pai.render)){ // renderiza se nao existir a chave render, ou se existir e ela for true
                    return (
                        <TreeItem key={'PaiNode_'+pai.id} nodeId={pai.id} label={pai.nome}>
                            {pai.filhos &&
                                mapeamento(pai.filhos)
                            }
    
                            {pai.arquivos && 
                                pai.arquivos.map((arquivo) => 
                                    <TreeItem key={'ArquivoNode_'+arquivo.id}  nodeId={arquivo.id} label={arquivo.titulo} onDoubleClick={() => getArquivo(arquivo)}/>
                                )
                            }
                        </TreeItem>
                    )
                }

            })
        )
        
    }

    return(
        <Drawer
            open={open}
            onClose={onCloseDrawer}
            anchor='right'
            sx={{zIndex:9999}}
            PaperProps={{ sx: { width: '350px'} }}
        >
            <Scrollbar
                sx={{
                    height: 1,
                    '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
                }}
                >
                <Stack
                    spacing={3}
                    sx={{
                        pt: 3,
                        pb: 2,
                        px: 2.5,
                        flexShrink: 0,
                    }}
                >
                    <Typography variant='h6'>
                        Selecione arquivo do GED
                    </Typography>

                    <TextField inputProps={{shrink: true}} disabled label='Projeto' value={nomeProjeto}/>
                    <SearchInput 
                        label='Nome do Arquivo' 
                        placeholder='Pesquise por um arquivo' 
                        callback={callbackSearch} 
                        error={errorSearch} 
                        helperText={errorSearch ? "Você precisa digitar ao menos três letras." : ""}/>

                    <Typography variant='subtitle2'>
                        Selecione o arquivo
                    </Typography>

                    {loading ?      
                        <Stack
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            spacing={2}
                        > 
                            <CircularProgress sx={{ color: '#9ba7b3' }} />
                        </Stack>
                        :
                    folderTreeRender.length > 0  && folderTreeRender[0].id?
                        <TreeView
                            defaultCollapseIcon={<ExpandMoreIcon />}
                            defaultExpandIcon={<ChevronRightIcon />}
                            defaultEndIcon={null}
                            expanded={expanded}
                            onNodeToggle={handleToggle}
                        >
                            {mapeamento(folderTreeRender)}
                        </TreeView>
                        :
                        <Typography variant='subtitle2' color='error'>
                            Não existem arquivos para selecionar.
                        </Typography>
                    }
                    
                </Stack>
            </Scrollbar>
        </Drawer>
    )
}