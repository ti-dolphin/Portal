const fs = require('fs');
const axios = require ('axios')

const api = axios.create({
    baseURL: 'http://35.192.163.150:1100/', //Online
    // baseURL: 'http://192.168.0.3:1100/', //Local
}); 

function consulta(){
    api.get('projeto-documento').then((r) => {

        r.data.map((d) => {

            fs.access("/var/www/dse-controle-api/static/documentos/"+d.url, fs.constants.F_OK, (err) => { // Online
            // fs.access("C:/Users/vitor/projetos/dse-controle-api/static/documentos"+d.url, fs.constants.F_OK, (err) => { // Local
                if(err){
                    console.log('nao existe')
                    api.post('projeto-documento/banco/'+d.id).then((r) => {
                        console.log(r)
                    })
                    console.log(d)
                } else{
                    console.log('existe')
                    console.log(d)
                }
            });
        })
    })
}


consulta()
