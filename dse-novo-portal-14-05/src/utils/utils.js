import { GetSession } from '../session';
import moment from 'moment-business-time'

moment.locale('pt-br', {
    workinghours: {
        0: null,
        1: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        2: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        3: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        4: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        5: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        6: null
    }
});

export const GenerateFilterQuery = (array) =>{
    var where = '?'

    array.map((value,index) => {
        if(value.target_value != '' && value.target_value != '0') {
            var op = ''
            if(value.target_operator) {
                op = '&target_operator[]='+value.target_operator;
            } else {
                op = '&target_operator[]==';
            }
            if(index != 0) {
                where += "&target[]=" + value.target + op + '&target_value[]=' + value.target_value
            } else {
                where += "target[]=" + value.target + op + '&target_value[]=' + value.target_value
            }
        }
    })
    return where
}

const pad = (number) => {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

export const myFormat = (string_data, horas = null) => { // formata a data para exibição no padrão dd/mm/yyyy hh:mm:ss

    var date = new Date(string_data);

    if(!horas){
        var data_formatada = pad(date.getDate()) + // padrão para exibição dd/mm/yyyy hh:mm:ss
            '/' + pad(date.getMonth() + 1) +
            '/' + date.getFullYear() +
            '-' + pad(date.getHours()) +
            ':' + pad(date.getMinutes())
            } else{
        var data_formatada = pad(date.getDate()) + // padrão para exibição dd/mm/yyyy
        '/' + pad(date.getMonth() + 1) +
        '/' + date.getFullYear()
    }

    return data_formatada
    
}

export const myFormatWhere = (string_data) => {

    var date = new Date(string_data);

    var data_formatada = date.getFullYear() + // padrão para exibição yyyy-mm-dd
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate())

    return data_formatada

}

export const dataAtual = (datetimeLocal = null) => {

    // datetimeLocal flag se for true retorna a data no formato para colocar como valor de um input datetime-local 
    
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
}

export const Money = (valor) => { // formata o valor para o formato 'R$ 00,00' para exibição
    var valor_formatado = "R$ "+parseFloat(valor).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
    return valor_formatado;
}

export const maskMoney = (campo) => {
    if(campo.value){
        campo.value = campo.value.toString();
        if(campo.value.indexOf("R$") == -1){ // caso não exista 'R$' na string, significa que é o primeiro valor, que vem do banco cru
            campo.value = "R$ "+parseFloat(campo.value).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
        } else{
            var temp = parseInt(campo.value.replace(/[\D]+/g,'') ); // converte para inteiro e retira todos os caracteres nao numéricos
            var tmp = temp+'';
            if(tmp.length <= 2){
                if(tmp.length == 1){
                    campo.value = "R$ 0,0"+ tmp;
                } else{
                    campo.value = "R$ 0,"+tmp;
                }
            }else{
                tmp = tmp.replace(/([0-9]{2})$/g, ",$1"); // coloca os digitos de centavos
                tmp = tmp.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // separa os milhares colocando ponto

                if(tmp == 'NaN' || temp == undefined){
                    tmp = 0;
                }
                
                if(tmp == 0){
                    campo.value = "R$ 0,00";
                } else{
                    campo.value = "R$ "+ tmp;
                }
            }
        }
    } else{
        campo.value = "R$ 0,00";
    }
}

export const desMoney = (valor) => { // recebe um valor (string) no formato 'R$ 00,00' e converte para o formato 0.0 como float, para fazer calculos, cadastrar no banco, etc
    var valor_formatado = parseFloat(valor.replace(/[\D]+/g,''))/100
    return valor_formatado;
}

export const formataString = (string) => { // retira cedilha, espaços, acentos, hífens, pontos, apóstofros, etc. (mantém a extensão do arquivo)
    var stringArray = string.split('.')

    var str = ''

    stringArray.map((s,index) => {
        if(index < stringArray.length - 1){
            str += s
        }
    })

    return str.normalize("NFD").replace(/[^a-zA-Zs]/g, "")+'.'+stringArray[stringArray.length-1]

}

export const limpaValuesCamposForm = (campos) => {
    campos.map((c) =>{
        if(c.type == 'select'){
            c.value = c.options[0].value
        } if(c.type == 'multi-select'){
            c.optionsDefault = [];
        }else{
            c.value = null
        }
    })

    return campos
}

export const verifyPermission = (permissao) => {
    // 0 - Create
    // 1 - Read
    // 2 - Update
    // 3 - Delete
    const usuario = GetSession("@dse-usuario")
    var permissionTrue = [true, true, true, true]

    if(usuario.tipo !== "Administrador" && permissao.length > 0){
        var retorno = [false,false,false,false]
        var verify = false

        permissao.map((p) => {

            var c = p.permissao[0] === '1'
            var r = p.permissao[1] === '1'
            var u = p.permissao[2] === '1'
            var d = p.permissao[3] === '1'

            if(p.alvo === "Grupo"){
                if(usuario.grupos.indexOf(p.alvo_id) !== -1){
                    verify = true
                    if(!retorno[0] && c){
                        retorno[0] = true
                    } 
                    if(!retorno[1] && r){
                        retorno[1] = true
                    } 
                    if(!retorno[2] && u){
                        retorno[2] = true
                    } 
                    if(!retorno[3] && d){
                        retorno[3] = true
                    } 
                }
            } else{
                if(p.alvo_id == usuario.id){
                    verify = true
                    if(!retorno[0] && c){
                        retorno[0] = true
                    } 
                    if(!retorno[1] && r){
                        retorno[1] = true
                    } 
                    if(!retorno[2] && u){
                        retorno[2] = true
                    } 
                    if(!retorno[3] && d){
                        retorno[3] = true
                    } 
                }
            }
        })

        if(verify){
            return retorno
        } else{
            return permissionTrue
        }

    }else {
        return permissionTrue
    }
}

export const getPrazo = (estimativa) =>{
    const novoPrazo = moment(moment(new Date()).addWorkingTime(estimativa, 'hours')).format("YYYY/MM/DD HH:mm:ss");
    return novoPrazo;
}

export const validaCPF = (cpf) => {
    if(cpf){
        if((cpf = cpf.replace(/[^\d]/g,"")).length != 11)
        return false
    
      if (cpf === "00000000000")
        return false;
      var i;
      var r;
      var s = 0;
    
      for (i=1; i<=9; i++)
        s = s + parseInt(cpf[i-1]) * (11 - i);
    
      r = (s * 10) % 11;
    
      if ((r == 10) || (r == 11))
        r = 0;
    
      if (r != parseInt(cpf[9]))
        return false;
    
      s = 0;
    
      for (i = 1; i <= 10; i++)
        s = s + parseInt(cpf[i-1]) * (12 - i);
    
      r = (s * 10) % 11;
    
      if ((r == 10) || (r == 11))
        r = 0;
    
      if (r != parseInt(cpf[10]))
        return false;
    
      return true;
    }
    return false;
}

export const validarCNPJ = (cnpj) => {
 
    cnpj = cnpj.replace(/[^\d]+/g,'');
 
    if(cnpj == '') return false;
     
    if (cnpj.length != 14)
        return false;
 
    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" || 
        cnpj == "11111111111111" || 
        cnpj == "22222222222222" || 
        cnpj == "33333333333333" || 
        cnpj == "44444444444444" || 
        cnpj == "55555555555555" || 
        cnpj == "66666666666666" || 
        cnpj == "77777777777777" || 
        cnpj == "88888888888888" || 
        cnpj == "99999999999999")
        return false;
         
    // Valida DVs
    var tamanho = cnpj.length - 2
    var numeros = cnpj.substring(0,tamanho);
    var digitos = cnpj.substring(tamanho);
    var soma = 0;
    var pos = tamanho - 7;
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
         
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
          return false;
           
    return true;
    
}
// const getUserData = async (userId) => {
//     try {
//         const response = await api.get(`usuario/userForSession/${userId}`);
//         return response.data;
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// }

// const Start = async () => {
//     const navigate = useNavigate();
//     try {
//         const userSession = GetSession("@dse-usuario");
    
//         if(userSession) {
//             const userData = await getUserData(userSession.id);
//             if(userData.status === 'Inativo') {
//                 localStorage.removeItem('@dse-usuario');
//                 navigate('/login');
//             }
//         }
//     } catch (error) {
//         console.error(error); 
//     }
// }

// export const TesteUser = () => {
//     Start()
// }