'use strict'

const mysql = require('mysql');
require('./config');

const connection = mysql.createPool({
    host           : DATABASE.HOST,
    port           : DATABASE.PORT,
    user           : DATABASE.USER,
    password       : DATABASE.PASSWORD,
    database       : DATABASE.DATA_BASE,
    charset        : DATABASE.charset,
    connectionLimit: 100,
});

connection.getConnection(function(err){
    if(err){
        console.log("Erro ao se conectar ao banco de dados: " + err);
    }else{
        console.log('Conectado ao banco de dados!');
    }
});

module.exports = connection;