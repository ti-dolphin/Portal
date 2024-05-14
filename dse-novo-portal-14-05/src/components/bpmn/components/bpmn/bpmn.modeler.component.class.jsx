import React, { Component }  from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-font/dist/css/bpmn-embedded.css';
import { emptyBpmn } from '../../assets/empty.bpmn';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
import XMLParser from 'react-xml-parser'
import {dataAtual} from '../../../../main/Utils';
import {GetSession} from '../../../../main/session';
import api from '../../../../main/Api'

class BpmnModelerComponent extends Component {

    constructor(props) {
        super(props);
  
        this.state = {

        };
        
        this.convertToJSON = this.convertToJSON.bind(this)
        this.mapeiaProcesso = this.mapeiaProcesso.bind(this)
        this.teste = this.teste.bind(this)
        this.saveBpmn = this.saveBpmn.bind(this)
    }
    
    modeler = null;
    tasks = [];
    decisoes = [];
    setas = [];
    startNode = null;
    endNode = null;
    raias = [];
    nodes = [];
    
    componentDidMount = () => {
        this.modeler = new BpmnModeler({
            container: '#bpmnview',
            keyboard: {
                bindTo: window
            },
            propertiesPanel: {
                parent: '#propview'
            },
            additionalModules: [
                propertiesPanelModule,
                propertiesProviderModule
            ],
            moddleExtensions: {
                camunda: camundaModdleDescriptor
            }
        });

        this.newBpmnDiagram();
    }

    newBpmnDiagram = () => {
        this.openBpmnDiagram(emptyBpmn);
    }

    openBpmnDiagram = (xml) => {
        this.modeler.importXML(xml, (error) => {
            if (error) {
                return console.log('fail import xml');
            }

            var canvas = this.modeler.get('canvas');

            canvas.zoom('fit-viewport');
        });
    }

    saveBpmn = () => {
        this.modeler.saveXML({ format: true }, function (err, xml) {
            this.convertToJSON(xml)
        }.bind(this));
    }

    convertToJSON = (xml) => {
        this.tasks = [];
        this.decisoes = [];
        this.setas = [];
        this.startNode = [];
        this.endNode = [];
        this.raias = [];
        this.nodes = [];
        var json = new XMLParser().parseFromString(xml);
        console.log(json);

        this.obterRaias(json);

        json.children.map((filho) => {
            if(filho.name == "bpmn2:process") this.mapeiaProcesso(filho);
        });

        this.startNode.forEach((node) =>  this.nodes.push({type: 'start', children: [], ...node})); 
        
        this.tasks.forEach((element) => {
            this.nodes.push({type: 'task', ...element, children: [], });
        })

        this.decisoes.forEach((element) => {
            this.nodes.push({type: 'decision', ...element, children: [], });
        })

        this.endNode.forEach((element) => this.nodes.push({type: 'end', ...element}));

        // console.log(this.setas);
        this.setas.forEach((seta) => {
            const indexOrigem = this.nodes.findIndex((node) => node.id == seta.sourceRef);
            this.nodes[indexOrigem].children.push(seta.targetRef);
        });
    }

    obterRaias = (json) => {
        this.raias = [];
        json.children.map((filho) => {
            if(filho.name == 'bpmn2:collaboration'){
                filho.children.map((filho2) => {
                    if(filho2.name.includes('participant')) this.raias.push(filho2.attributes);
                    if(filho2.name.includes('Flow')) this.setas.push(filho2.attributes); // Seta entre raias é um messageFlow
                })
            }
        })        
    }

    mapeiaProcesso = (processo) => {
        const raia = this.raias.find(element => element.processRef == processo.attributes.id);
        console.log(processo.children)
        processo.children.map((filho) => {
            if(filho.name.includes('task')){
                this.tasks.push({raia, ...filho.attributes});
            }else if(filho.name.includes('sequenceFlow')){
                this.setas.push({raia, ...filho.attributes});
            }else if(filho.name.includes('Gateway')){
                this.decisoes.push({raia, ...filho.attributes});
            }else if(filho.name.includes('start')){
                this.startNode.push({raia, ...filho.attributes});
            }else if(filho.name.includes('end')){
                this.endNode.push({raia, ...filho.attributes});
            }
        })
    }

    teste = async () => {
        console.log(this.nodes);
        console.log(this.setas);

        const verificaEstagioFim = (no) => {
            var retorno = false
            if(no.children){
                no.children.map((f) => {
                    if(f.includes('EndEvent')){
                        retorno = true
                    }
                })
            }
            return retorno
        }

        const achaFilho = (filho) => {
            var retorno = false

            if(!filho.includes('Gateway') && !filho.includes('EndEvent')){
                this.nodes.map((no) => {
                    if(filho == no.id){
                        retorno = no.idBanco
                    }
                })
            }
            return retorno
        }

        const achaPai = (id) => {
            var retorno = false
            this.nodes.map((no) => {
                if(no.children){
                    no.children.map((filho) => {
                        if(filho == id){
                            retorno = no.idBanco
                        }
                    })
                }
            })
            return retorno
        }

        api.post('processo-cadastro',{ // cadastra o processo em si
            nome: 'PROCESSO TESTE',
            date: dataAtual(),
            status: 'Ativo',
            usuario_id : GetSession('@dse-usuario').id,
            empresa_id: GetSession('@dse-usuario').empresa_id,
            offsetx: 0,
            offsety: 0,
            zoom: 0,
            ref_id: 0,
            tipo: 'Operacional',
            categoria_id : 1
        }).then(async (r) => {
            var startNode = this.nodes[0].children[0]

            const map = this.nodes.map(async (no,index) => { // cadastra os passos
                if(no.type != 'start' && no.type != 'end'){
                    var resultPasso = await api.post('processo-passo-cadastro',{
                        nome: no.name ? no.name : 'passo '+index,
                        descricao: no.name ? no.name : 'passo '+index,
                        decisao : no.type == "decision"  ? 'sim' : 'nao',
                        estagio: no.id == startNode ? 'inicial' : verificaEstagioFim(no) ? 'final' : 'intermediario',
                        processo_cadastro_id : r.data.rows.insertId,
                        papel_id: 0,
                        flag: 'Sim',
                        status: 'Ativo',
                        x: 0,
                        y: 0
                    })
                    no.idBanco = resultPasso.data.rows.insertId
                }
            })

            await Promise.all(map)
    
            this.nodes.map(async (no,index) => { // cadastra o fluxo 

                if(no.type != 'start' && no.type != 'end'){
                    no.children.map((filho) => {

                        var idBancoFilho = achaFilho(filho)

                        if(idBancoFilho){
                            api.post('processo-fluxo-cadastro',{
                                condicao: no.type == "decision"  ? 'sim' : 'nao',
                                valor_condicao : '',
                                status: 'Ativo',
                                passo_atual : no.type == "decision"  ? achaPai(no.id) : no.idBanco,
                                passo_seguinte: idBancoFilho,
                                passo_decisao: no.type == "decision"  ? no.idBanco : 0,
                                processo_cadastro_id : r.data.rows.insertId,
                            }).then((result) => {
                                console.log(result)
                            })
                        }
                    })
                }
            })
        })

    }

    render = () => {
        return(
            <div id="bpmncontainer">
                <button onClick={() => this.saveBpmn()}>teste</button>
                <button onClick={() => this.teste()}> Revelem-se </button>
                <div id="propview" style={{ width: '25%', height: '98vh', float: 'right', maxHeight: '98vh', overflowX: 'auto' }}></div>
                <div id="bpmnview" style={{ width: '75%', height: '98vh', float: 'left' }}></div>
            </div>
        )
    }
}

export default BpmnModelerComponent;
