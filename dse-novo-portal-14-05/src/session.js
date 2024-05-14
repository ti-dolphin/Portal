export const SetSession = (chave, valor) =>{
    var str = JSON.stringify(valor);
    localStorage.setItem(chave, str);
}

export const GetSession = (chave) =>{
    const retorno = JSON.parse(localStorage.getItem(chave));
    return retorno;
}