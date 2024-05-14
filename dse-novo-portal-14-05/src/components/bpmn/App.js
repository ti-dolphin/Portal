import React, { useState, useEffect } from 'react';
import './App.css';
import BpmnModelerComponent from './components/bpmn/bpmn.modeler.component.hook'
// import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';
import api from '../../main/Api'

export default function App(){

  const [papel,setPapel] = useState()

  useEffect(()=>{
    api.get('/papel').then((papel) => {
      setPapel(papel.data)
    })
  },[])

  return (
    <div>
      {papel ? 
        <BpmnModelerComponent raias={papel}/>
        : null
      }
    </div>
  );

}