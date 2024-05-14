import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import CustomSelector from './components/CustomSelector';
import CustomSwitchField from './components/CustomSwitchField';
import CustomAutoComplete from './components/CustomAutoComplete';
import { Box } from '@material-ui/core';
import { getPastasPaiTemplate, getPastasTemplateFilhas } from '../../../../../../../../../../../../../../../../models/Template';
import { getPastasPaiProjeto,getPastasFilhas } from '../../../../../../../../../../../../../../../../models/ProjetoPasta';
import { getProjetos } from '../../../../../../../../../../../../../../../../models/Projeto';
import { FolderSpecialSharp } from '@material-ui/icons';

export default function Arquivo(props) {
    
    //Campos Seletores
    const [saveDirectory, setSaveDirectory] = useState(null)
    const [folder, setFolder] = useState(null)
    const [project, setProject] = useState(null)
    const [category, setCategory] = useState(null)
    const [registered, setRegistered] = useState(null)
    const [path, setPath] = useState(null)

    //Switches
    const [savePDF, setSavePDF] = useState(false)   //Estado referente ao Switch de salvar o PDF.
    const [switchChildFolder, setSwitchChildFolder] = useState(false) //Estado referente ao Switch de pasta filha.
    const [newFolder, setNewFolder] = useState(false) //Estado referente ao Switch de cadastrar nova pasta.
    const [ged, setGed] = useState(false) //Estado referente ao Switch de GED nova pasta.

    //Lista de opções para pasta de salvamento.
    const saveDir = [
        "Template",
        "Pasta específica de projeto"
    ]

    //Estados para controlar as listas dos seletores
    const [childDir, setChildDir] = useState([])
    const [listProject, setListProject] = useState([])

    const navigation = (actualFolder) => {
        if((String(saveDirectory) === "Template")){
            if (!actualFolder){
                getPastasPaiTemplate().then((data) => {
                    return (
                        setChildDir(data),
                        setFolder(null)
                    )
                })
            } else {
                getPastasTemplateFilhas(actualFolder.id).then((data) => {
                    return (
                        setChildDir(data)
                    )
                })
            }
        } else if(String(saveDirectory) === "Pasta específica de projeto"){
            //Caso dos projetos
            // if (!actualFolder){
            //     getPastasPaiTemplate().then((data) => {
            //         return (
            //             setChildDir(data),
            //             setFolder('/')
            //         )
            //     })
            // } else {
            //     getPastasTemplateFilhas(actualFolder.id).then((data) => {
            //         return (
            //             setChildDir(data)
            //         )
            //     })
            // }
        } else {
            console.log('Caso limpa child')
        }
    }

    //Template
    useEffect(() => {   //Efeito usado para carregar a pasta pai do local de salvamento.
        if(!folder) {
            if(String(saveDirectory) === "Template") {
                getPastasPaiTemplate().then((data) => {
                    return (
                        setChildDir(data),
                        setFolder('/')
                    )
                })
            }else if (String(saveDirectory) === "Pasta específica de projeto") {
                //Parte específica para o Projeto
                console.log('Projeto')
            } else {
                setChildDir([])
                setListProject([])
            }
        }
    },[saveDirectory,folder])
    
    useEffect(() => {   //Efeito que garante que o switch de pasta nova desative o switch de pasta filha
        if (switchChildFolder) {
            setNewFolder(false)
            setSwitchChildFolder(true)
        }
    },[switchChildFolder])

    useEffect(() => {   //Efeito que garante que o switch de pasta filha desative o switch de pasta nova
        if (newFolder) {
            setNewFolder(true)
            setSwitchChildFolder(false)
        } else {    //Caso o switch de nova pasta fique falso, reseta o estado da pasta já cadastrada
            setRegistered(null)
        }
    },[newFolder])

    useEffect(() => {   //Efeito utilizado para garantir que os Switches que dependem do local de salvamento não carreguem lixo caso não existam.
        if (String(saveDirectory) !== "Pasta específica de projeto") {
            setFolder(null)
            setRegistered(null)
            setProject(null)
            setCategory(null)
            setSwitchChildFolder(false)
            setNewFolder(false)
            setGed(false)
        }
    },[saveDirectory])

    useEffect(() => {   //Efeito utilizado para garantir que o campo de categorias retornara para null caso check list não faça parte da lista de pastas
        let tmp = false
        if(String(folder) === "Check List") {
            tmp = true
        }
        if(!tmp){
            setCategory(null)
        }
    },[folder])

    const mockCategory = [
        "Categoria 1",
        "Categoria 2",
        "Categoria 3",
        "Categoria 4",
        "Categoria 5",
        "Categoria 6",
        "Categoria 7"
    ]

    const mockRegistered = [
        "Registrado 1",
        "Registrado 2",
        "Registrado 3",
        "Registrado 4",
        "Registrado 5",
        "Registrado 6",
        "Registrado 7"
    ]

    return (
        <Grid container spacing={3}>

            <Grid item lg={12} md={12} sm={12} xs={12}>
                <CustomSelector 
                    value={saveDirectory}
                    id='outlined-Selecione o local de salvamento-native-simple'
                    label='Selecione o local de salvamento'
                    dados={saveDir} callback={setSaveDirectory}
                />
                <Box mb={2}/>
                {String(saveDirectory) === "Pasta específica de projeto"
                    ?
                    <Grid item lg={12} md={12} sm={12} xs={12}>

                        <CustomSwitchField  //Switch de PDF
                            state={savePDF}
                            callback={setSavePDF}
                            name='Salvar como PDF'
                            label='Converter imagem para PDF'
                        />

                        <Box mb={2}/>
                        <CustomSelector //Seletor de Projetos
                            value={project}
                            id='outlined-Selecione o projeto-native-simple'
                            label="Selecione o Projeto"
                            dados={listProject} callback={setProject}
                        />

                        <Box mb={2}/>
                        <CustomAutoComplete //Selecionador AutoComplete de Pastas
                            value={folder}
                            id='outlined-Selecione a pasta-native-simple'
                            label="Selecione a pasta do projeto"
                            dados={childDir} callback={setFolder}
                        />

                        <Box mb={2}/>
                        <CustomSwitchField  //Switch de pasta filha
                            state={switchChildFolder}
                            callback={setSwitchChildFolder}
                            name='Seleção de pasta filha'
                            label='Exigir seleção de pasta filha ao cadastrar arquivo'
                        />

                        <Box mb={2}/>
                        <CustomSwitchField  //Switch de nova pasta
                            state={newFolder}
                            callback={setNewFolder}
                            name='Cadastrar nova pasta'
                            label='Cadastrar nova pasta com base em campo anterior'
                        />

                        <Box mb={2}/>
                        <CustomSwitchField  //Switch de GED
                            state={ged}
                            callback={setGed}
                            name='GED'
                            label='Permitir seleção de arquivos do próprio GED'
                        />

                        { 
                                String(folder) === "Check List"
                                ?
                                <div key={"Caixa do seletor de categoria"}>
                                <Box mb={2}/>
                                <CustomSelector
                                    key={"Seletor de Categoria"}
                                    value={category}
                                    id='outlined-Selecione a categoria-native-simple'
                                    label="Selecione a categoria de atributos da pasta"
                                    dados={mockCategory} callback={setCategory}
                                />
                                </div>
                                :
                                null
                        }

                        {
                            newFolder?
                            <div>
                                <Box mb={2}/>
                                <CustomSelector //Seletor de Projetos
                                    value={registered}
                                    id='outlined-Campo já cadastrado-native-simple'
                                    label="Selecione um campo já cadastrado"
                                    dados={mockRegistered} callback={setRegistered}
                                />
                            </div>
                            :
                            null
                        }
                    </Grid>


                    :

                    <Grid item lg={12} md={12} sm={12} xs={12}>
                        <CustomAutoComplete //Selecionador AutoComplete de Pastas
                            value={folder}
                            id='outlined-Selecione a pasta-native-simple'
                            label="Selecione a pasta"
                            dados={childDir} callback={navigation}
                        />

                        <Box mb={2}/>
                        <CustomSwitchField  //Switch de PDF
                            state={savePDF}
                            callback={setSavePDF}
                            name='Salvar como PDF'
                            label='Converter imagem para PDF'
                        />
                    </Grid>
                }

            </Grid>

        </Grid>
    );
}
