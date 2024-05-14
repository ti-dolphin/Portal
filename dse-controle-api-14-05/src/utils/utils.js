const moment = require('moment')
class Utils {
    /**
     * quebra um objeto em dois vetores um contendo as chaves e outro
     * contendo os valores
     * @param {object} objeto um objeto qualquer
     * @returns {object} que contem um array de chaves e um de valores 
     */
    static objec_decompose(objeto) {
        var chaves = []
        var valores = []
        for (const [key, value] of Object.entries(objeto)) {
            chaves.push(key)
            valores.push(value)
            //console.log(key, value);
        }
        return {
            chaves: chaves,
            valores: valores
        }
    }

    /**
     * @returns uma string que contem diaDoAno/Ano
     */
    static get_day_year() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 0);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        var day = Math.floor(diff / oneDay);
        //console.log('Day of year: ' + day);
        return day + "-" + (new Date()).getFullYear()
    }

    /**
     * Verifica se um objeto está vazio ou não.
     * @returns {bool} true, se o objeto estiver vazio. false, se o objeto não estiver vazio.
     */
    static isEmptyObject(obj) {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }

    static dateTimeAtual() {
        const dateFormated = moment().format('YYYY-MM-DD HH:mm:ss')
        return dateFormated
    }

    static formatarDataParaMySQL(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Recebe uma lista de objetos que podem ter as mesmas chaves ou não
     * Retorna uma lista onde TODOS objetos tem TODAS as chaves, preenchendo com null as não existentes
     * @param {*} objs 
     */
    static matchObjects(objs){
        const keys = objs.reduce((acc, obj) => {
            return acc.concat(Object.keys(obj))
        }, [])
        const uniqueKeys = [...new Set(keys)]
        return objs.map(obj => {
            const newObj = {}
            uniqueKeys.forEach(key => {
                newObj[key] = obj[key] || null
            })
            return newObj
        })
    }

}
module.exports = Utils