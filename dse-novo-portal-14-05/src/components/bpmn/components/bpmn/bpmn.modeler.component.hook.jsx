import React, { useState, useEffect } from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-font/dist/css/bpmn-embedded.css';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
import XMLParser from 'react-xml-parser'
import ConfiguraRaia from '../configuraRaia/configuraRaia'
import { notification } from '../../../notification/notiflix'
import { api } from '../../../../config'


import {
    Button,
    Stack,
    Typography
} from '@mui/material'

export default function BpmnModelerComponent(props) {

    const configuraRaiaRef = React.createRef();

    var modeler = {};
    var inicial
    var eventBus = null
    var ElementRegistry = null
    var caminho_padrao = props.caminhoPadrao
    var caminho_padrao_ordenado = []

    var _getPaletteEntries = PaletteProvider.prototype.getPaletteEntries;
    PaletteProvider.prototype.getPaletteEntries = function (element) {
        var entries = _getPaletteEntries.apply(this);
        delete entries['create.data-object'];
        delete entries['create.data-store'];
        delete entries['create.intermediate-event'];
        delete entries['create.participant-expanded'];
        return entries;
    }

    const _getContextPadEntries = ContextPadProvider.prototype.getContextPadEntries;

    ContextPadProvider.prototype.getContextPadEntries = function (element) {
        const entries = _getContextPadEntries.apply(this, [element]);
        delete entries["append.intermediate-event"];
        delete entries["replace"];
        return entries;
    };

    useEffect(() => {
        modeler = new BpmnModeler({
            container: '#bpmnview',
            keyboard: {
                bindTo: window
            },
            // propertiesPanel: {
            //     parent: '#propview'
            // },
            additionalModules: [
                propertiesPanelModule,
                propertiesProviderModule,
            ],
            moddleExtensions: {
                camunda: camundaModdleDescriptor
            }
        });

        newBpmnDiagram();

    }, [])

    const newBpmnDiagram = () => {
        // openBpmnDiagram(emptyBpmn);
        openBpmnDiagram(props.diagrama);
    }

    const openBpmnDiagram = (xml) => {
        modeler.importXML(xml, (error) => {
            if (error) {
                return console.log('fail import xml');
            }

            var canvas = modeler.get('canvas');

            canvas.zoom('fit-viewport');
            events()
            // pintaCaminhoPadrao()
        });

    }

    const encontaPassoCaminhoPadrao = (event) => {
        var retorno = false
        caminho_padrao.map((c, index) => {
            if (c === event.id) {
                retorno = index
            }
        })

        return retorno
    }

    const events = () => {
        ElementRegistry = modeler.get("elementRegistry")
        eventBus = modeler.get("eventBus");
        var modeling = modeler.get('modeling');
        var priority = 10000

        Object.keys(ElementRegistry._elements).map(async (key) => {
            if (ElementRegistry._elements[key].element.type === 'bpmn:SubProcess') {
                const passo = await api.get('processo-passo-cadastro?target[]=id_diagrama&target_value[]=' + key + '&target[]=processo_cadastro_id&target_value[]=' + props.processoAnterior)
                if (passo.data.length > 0) {
                    modeling.updateProperties(ElementRegistry._elements[key].element, {
                        name: passo.data[0].nome
                    });
                }
            }
        })

        eventBus.on('element.dblclick', priority, function (event) {
            if (event.element.type == "bpmn:Lane") { // cancela a edição de raia
                configuraRaiaRef.current.setaModal(event.element.id) // passa o id da raia cadastrada
            } else if (event.element.type == "bpmn:SubProcess") { // impede mudança de nome quando é subprocesso
                return 0;
            }
        });

        eventBus.on("create.start", function (event) { // impede de criar mais raias
            if (event.shape.type == "bpmn:SubProcess") {
                event.shape.height = 80
                event.shape.width = 100
                modeling.updateProperties(event.shape, {
                    collapsed: true,
                    name: "Sub-Processo"
                });
            }

            if (event.shape.type == "bpmn:Participant") {
                return false
            }
        });

        eventBus.on("element.click", function (event) {
            if (event.element.type === "bpmn:Task" || event.element.type === "bpmn:SubProcess") {
                const indexElement = encontaPassoCaminhoPadrao(event.element);
                if (indexElement === false) {
                    modeling.setColor(event.element, {
                        stroke: '#229A16',
                        fill: '#AAF27F'
                    });
                    caminho_padrao.push(event.element.id)
                } else {
                    modeling.setColor(event.element, null);
                    caminho_padrao.splice(indexElement, 1)
                }
            }
        });

    }

    // const pintaCaminhoPadrao = () => {
    //     var modeling = modeler.get('modeling');

    //     Object.keys(ElementRegistry._elements).map((key) => {
    //         if(caminho_padrao.indexOf(ElementRegistry._elements[key].element.id) !== -1){
    //             modeling.setColor(ElementRegistry._elements[key].element, {
    //                 stroke: '#229A16',
    //                 fill: '#AAF27F'
    //             });
    //         }
    //     })
    // }

    const saveBpmn = () => {
        modeler.saveXML({ format: true }, function (err, xml) {
            convertToJSON(xml)
        });
    }

    const convertToJSON = (xml) => {
        var json = new XMLParser().parseFromString(xml);

        var res = obterRaias(json);
        if (res && res.length > 0) {
            if (validaDiagrama(res)) {
                validaCaminhoPadrao(res, xml)
            } else {
                alert(`Diagrama inválido. 
                O diagrama deve conter um e somente um evento de início, ao menos um evento de fim e ao menos uma tarefa. 
                Com exceção do evento final, todos os eventos devem ter uma flecha apontando para o próximo evento. 
                Com exceção do evento inicial, todos os eventos devem ter uma flecha chegando de outro evento.
                Com exceção de eventos de decisão, todos os eventos não podem ter mais de uma flecha entrando ou saindo do evento.
                Nenhum evento pode conter uma flecha apontando para si mesmo.`)
            }
        } else {
            alert('É necessário configurar as raias, atribuindo um papel')
        }

    }

    const validaCaminhoPadrao = async (res, xml) => {
        caminho_padrao_ordenado = []
        props.callback(res, xml)
    }

    const notificaErroCaminhoPadrao = () => {
        notification('errorOnly', "O caminho padrão não foi corretamente definido, tente novamente")
    }

    var valid = false

    const mapeiaElementos = async (res, elemento, xml) => {
        return new Promise(async function (resolve, reject) {
            try {
                var retorno
                const map = res.map(async (r) => {
                    if (r.id === elemento) {
                        switch (r.type) {
                            case "decision":
                                var i = 0
                                var novoElemento
                                r.children.map((c) => {
                                    if (caminho_padrao_ordenado.indexOf(c) == -1) { // nao está no caminho padrão ordenado, ou seja, não é um elemento que retorna a um passo anterior do próprio caminho padrão
                                        if (caminho_padrao.indexOf(c) !== -1) {
                                            novoElemento = c
                                            i++
                                        }
                                    }
                                })

                                if (i >= 1) {
                                    await mapeiaElementos(res, novoElemento, xml)
                                } else {
                                    var EndEvent = false;

                                    for (const c of r.children) {
                                        if (c.includes("EndEvent")) {
                                            EndEvent = true;
                                            await mapeiaElementos(res, c, xml);
                                        }
                                    }

                                    if (!EndEvent) {
                                        for (const c of r.children) {
                                            if (c.includes("Gateway")) {
                                                await mapeiaElementos(res, c, xml);
                                            }
                                        }
                                    }

                                    // Se nenhum "EndEvent" for encontrado, e nenhum "Gateway" for encontrado, resolve com false
                                    resolve(!EndEvent && !r.children.some(c => c.includes("Gateway")));

                                }
                                break;
                            case "task":
                                caminho_padrao_ordenado.push(elemento)
                                r.caminho_padrao = caminho_padrao_ordenado.length
                                var novoElemento = r.children[0]
                                if (caminho_padrao.indexOf(novoElemento) !== -1 || novoElemento.indexOf("Gateway") !== -1 || novoElemento.indexOf("EndEvent") !== -1) {
                                    await mapeiaElementos(res, novoElemento, xml)
                                } else {
                                    resolve(false) // o filho do elemento em questão nao está no caminho padrao
                                }
                                break;
                            case "subprocess":
                                caminho_padrao_ordenado.push(elemento)
                                r.caminho_padrao = caminho_padrao_ordenado.length
                                var novoElemento = r.children[0]
                                if (caminho_padrao.indexOf(novoElemento) !== -1 || novoElemento.indexOf("Gateway") !== -1 || novoElemento.indexOf("EndEvent") !== -1) {
                                    await mapeiaElementos(res, novoElemento, xml)
                                } else {
                                    resolve(false) // o filho do elemento em questão nao está no caminho padrao
                                }
                                break;



                            case "end": // se chegou aqui varreu ate achar um fim, validando o caminho padrao
                                retorno = true
                                break;

                            default:
                                break;
                        }

                    }
                })

                await Promise.all(map)
                if (retorno) {
                    if (caminho_padrao_ordenado.length) {
                        notification('successOnly', "Processo validado com sucesso!")
                        valid = true
                        props.callback(res, xml)
                    } else {
                        notificaErroCaminhoPadrao()
                    }
                } else {
                    resolve(retorno)
                    if (!valid) {
                        notificaErroCaminhoPadrao()
                    }
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    const validaDiagrama = (res) => {
        var tipos = []
        var start = 0

        for (var elemento of res) {
            tipos.push(elemento.type)

            if (elemento.type != 'end') { // verifica se todos os elementos possuem filhos com exceção do final 
                if (elemento.children.length == 0) {
                    return false
                }
            }

            if (elemento.type != 'start') { // verifica se todos os elementos que não são inicio, são filho de alguem
                var filho = true
                for (var e of res) {
                    if (e.children.indexOf(elemento.id) != -1) {
                        filho = false
                    }
                }

                if (filho) {
                    return false
                }

            }

            if (elemento.type != "decision") { // verifica que todos os elementos que não são decisão tem somente um filho
                if (elemento.children.length > 1) {
                    return false
                }
            }

            if (elemento.type == 'start') {
                inicial = elemento.children[0]
                start++
            }
        }

        if (start > 1) { // se tiver mais de um inicio retorna false
            return false
        }

        if (tipos.indexOf("start") == -1 || tipos.indexOf("end") == -1 || (tipos.indexOf("task") == -1 && tipos.indexOf("subprocess") == -1)) { // verifica se tem um inicio, fim e task
            return false
        }

        return true
    }

    const retornaType = (name) => {
        switch (name) {
            case 'bpmn2:startEvent':
                return 'start';
            case 'bpmn2:exclusiveGateway':
                return 'decision'
            case 'bpmn2:task':
                return 'task'
            case 'bpmn2:subProcess':
                return 'subprocess'
            case 'bpmn2:endEvent':
                return 'end'
            default:
                return 'task'
        }
    }

    const retornaChildren = (id, json) => {
        var ids = []
        json.children.map((row) => {
            if (row.name === 'bpmn2:process') {
                row.children.map((passo) => {
                    if (passo.name === 'bpmn2:sequenceFlow' && passo.attributes.sourceRef === id) {
                        ids.push(passo.attributes.targetRef)
                    }
                })
            }
        })
        return ids
    }

    const retornaRaia = (id, json) => {
        var att
        json.children.map((row) => {
            if (row.name === 'bpmn2:process') {
                row.children.map((passo) => {
                    if (passo.name === 'bpmn2:laneSet') {
                        passo.children.map((lane) => {
                            lane.children.map((campo) => {
                                if (campo.value === id) {
                                    att = lane.attributes
                                    if (!lane.attributes.papel_id) {
                                        att = false
                                    } else {
                                        att = lane.attributes
                                    }
                                }
                            })
                        })
                    }
                })
            }
        })
        return att
    }

    const obterRaias = (json) => {
        // raias = [];
        var nos = []
        json.children.map((row) => {
            if (row.name === 'bpmn2:process') {
                row.children.map((passo) => {
                    if (passo.name === 'bpmn2:startEvent' ||
                        passo.name === 'bpmn2:exclusiveGateway' ||
                        passo.name === 'bpmn2:task' ||
                        passo.name === 'bpmn2:subProcess' ||
                        passo.name === 'bpmn2:endEvent') {
                        var raia = retornaRaia(passo.attributes.id, json)
                        if (raia) {
                            nos.push({
                                type: retornaType(passo.name),
                                id: passo.attributes.id,
                                children: retornaChildren(passo.attributes.id, json),
                                name: passo.attributes.name,
                                raia: retornaRaia(passo.attributes.id, json)
                            })
                        } else {
                            nos.push(false)
                        }
                    }
                })
            }
        })

        if (nos.indexOf(false) == -1) {
            return nos
        } else {
            return false
        }
    }

    const salvaRaia = () => {
        var raia = configuraRaiaRef.current.retornaRaia()
        var raiaCadastrada = ElementRegistry._elements[raia.id]
        var modeling = modeler.get('modeling');

        modeling.updateProperties(raiaCadastrada.element, {
            name: raia.papel_nome,
            papel_id: raia.papel_id
        });

        configuraRaiaRef.current.limpaPapel()

    }

    return (
        <div id="bpmncontainer">
            <Stack direction="row" spacing={2} alignItems='center' justifyContent="space-between">
                <Button onClick={() => saveBpmn()} variant="contained" color="primary">Salvar Processo</Button>
                <Typography>Clique sobre as etapas para definir o caminho padrão do processo.</Typography>
                <Typography />
            </Stack>
            <div id="bpmnview" style={{ width: '100%', height: '80vh', float: 'left' }}></div>

            <ConfiguraRaia callback={salvaRaia} raias={props.raias} ref={configuraRaiaRef} />
        </div>
    )
}
