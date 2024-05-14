'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const morgan = require('morgan');
const admin = require('firebase-admin');
const app = express();
const handleExpressError = require('./api/error_handler/express_error_handler');
// const { taskLate } = require('./cronJobs');
const { documentToExpire } = require('./cronJobs');
const expressAsyncErrors = require('express-async-errors');
const connection = require('../data_base');
const { ErrorHandler, ExpressLogFormatter, ErrorModel } = require("rox-lib");

documentToExpire.start();
// taskLate.start();

app.use(express.static('static'));

app.use(cors());

app.use((req, res, next) => {
  req.header('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  next();
});

// Middleware para liberação automática de conexões
const releaseConnectionMiddleware = (req, res, next) => {
    connection.getConnection((error, connection) => {
        if (error) {
            console.error('Erro ao adquirir conexão do pool:', error);
            return next(error);
        }

        req.mysqlConnection = connection;

        // Define um middleware para ser executado após a resposta ser enviada
        res.on('finish', () => {
            // Libera a conexão de volta para o pool após a resposta ser enviada
            connection.release();
        });

        next();
    });
};

app.use(releaseConnectionMiddleware);
//app.set('secret', config.secret);

//Define onde o log de acesso será salvo
var accessLogStream = fs.createWriteStream('./access', {
    flags: 'a'
});

//Define onde o log de erro será salvo
var errorLogStream = fs.createWriteStream('./error', {
    flags: 'a'
});

var serviceAccount = require("./chave_firebase_server.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://webarcondicionado-app.firebaseio.com"
});

app.use(morgan("combined", {
    skip: function(req, res) {
        return res.statusCode < 400;
    },
    stream: errorLogStream
}));

app.use(morgan("combined", {
    skip: function(req, res) {
        return res.statusCode >= 400;
    },
    stream: accessLogStream
}));

var rawBodySaver = function(req, res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || 'utf8');
    }
};

app.use(bodyParser.json({
    limit: '50mb',
    verify: rawBodySaver
}));


app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    verify: rawBodySaver
}));

app.use(bodyParser.raw({
    verify: rawBodySaver,
    type: '*/*'
}));



//   // middleware de log para quando o request foi bem sucedido
// app.use((req, res, next) => {
//     const start = performance.now();
//     res.on('finish', () => {
//         try {
//             const duration = performance.now() - start;
//             // // Se o request for para a raiz e o ip for o do load balancer, não loga
//             if (req.originalUrl === '/' && req?.headers['user-agent'] == 'GoogleHC/1.0') {
//                 return;
//             }

//             console.log(`Request: ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration.toFixed(2)}ms]`);
//         } catch (error) {
//             console.error('Erro ao logar request:', error);
//         }
//     });
//     next();
// });

// middleware de log para quando o request foi bem sucedido
app.use((req, res, next) => {
    const start = new Date();
    res.on("finish", () => {
      try {
        const duration = new Date() - start;
        // // Se o request for para a raiz e o ip for o do load balancer, não loga
        if (
          req.originalUrl === "/" &&
          req?.headers["user-agent"] == "GoogleHC/1.0"
        ) {
          return;
        }
        logger.log(
          ExpressLogFormatter.formatCompletedRequest(req, res, duration)
        );
      } catch (error) {
        logger.error(error);
      }
    });
    next();
  });

//rotas
const auth_route = require('./api/routes/auth_routes');
const usuario_route = require('./usuario/usuario_routes');
const localizacao_route = require('./localizacao/localizacao_routes');
const comunicacao_route = require('./comunicacao/comunicacao_routes');
const empresa_route = require('./empresa/empresa_routes');
const grupo_route = require('./grupo/grupo_routes');
const usuario_grupo_route = require('./usuario_grupo/usuario_grupo_routes');
const usuario_empresa_route = require('./usuario_empresa/usuario_empresa_routes');
const projeto_cadastro_route = require('./projeto/projeto_cadastro/projeto_cadastro_routes');
const projeto_timeline_route = require('./projeto/projeto_timeline/projeto_timeline_routes');
const projeto_grupo_route = require('./projeto/projeto_grupo/projeto_grupo_routes');
const projeto_pasta_route = require('./projeto/projeto_pasta/projeto_pasta_routes');
const pasta_cadastro_route = require('./pasta/pasta_cadastro/pasta_cadastro_routes');
const pasta_atributo_route = require('./pasta/pasta_atributo/pasta_atributo_routes');
const pasta_permissao_route = require('./pasta/pasta_permissao/pasta_permissao_routes');
const pasta_documento_nome_route = require('./pasta/pasta_documento_nome/pasta_documento_nome_routes');
const pasta_documento_nome_tipo_route = require('./pasta/pasta_documento_nome_tipo/pasta_documento_nome_tipo_routes');
const projeto_documento_route = require('./projeto/projeto_documento/projeto_documento_routes');
const projeto_documento_atributo_route = require('./projeto/projeto_documento_atributo/projeto_documento_atributo_routes');
const projeto_favoritos_route = require('./projeto/projeto_favoritos/projeto_favoritos_routes');
const processo =  require('./processo/processo/processo_routes');
const processo_cadastro = require('./processo/processo_cadastro/processo_cadastro_routes');
const processo_campo_cadastro = require('./processo/processo_campo_cadastro/processo_campo_cadastro_routes');
const processo_campo_opcao_select =  require('./processo/processo_campo_opcao_select/processo_campo_opcao_select_routes');
const processo_campos =  require('./processo/processo_campos/processo_campos_routes');
const processo_fluxo_cadastro =  require('./processo/processo_fluxo_cadastro/processo_fluxo_cadastro_routes');
const processo_passo =  require('./processo/processo_passo/processo_passo_routes');
const processo_passo_cadastro =  require('./processo/processo_passo_cadastro/processo_passo_cadastro_routes');
const processo_campo_arquivo = require('./processo/processo_campo_arquivo/processo_campo_arquivo_routes');
const processo_arquivo = require('./processo/processo_arquivo/processo_arquivo_routes');
const processo_favoritos_route = require('./processo/processo_favoritos/processo_favoritos_routes');
const processo_observadores_route = require('./processo/processo_observadores/processo_observadores_routes');
const processo_passo_comentarios_route = require('./processo/processo_passo_comentarios/processo_passo_comentarios_routes');
const processo_campo_mascara_route = require('./processo_campo_mascara/processo_campo_mascara_routes');
const papel = require('./papel/papel/papel_routes');
const usuario_papel = require('./papel/usuario_papel/usuario_papel_routes');
const permissao = require('./permissao/permissao_routes');
const categoria_route = require('./categoria/categoria_routes')
const fornecedor_route = require('./fornecedor/fornecedor_routes')
const material_routes = require('./material/material/material_routes')
const material_detalhe_routes = require('./material/material_detalhe/material_detalhe_routes')
const programa_route = require('./programa/programa_routes')
const requisicao_material_route = require('./requisicao_material/requisicao_material/requisicao_material_routes')
const requisicao_material_documento_route = require('./requisicao_material/requisicao_material_documento/requisicao_material_documento_routes')
const requisicao_material_itens_route = require('./requisicao_material/requisicao_material_itens/requisicao_material_itens_routes')
const unidade_route = require('./unidade/unidade_routes')
const categoria_atributo_routes = require('./categoria_atributo/categoria_atributo/categoria_atributo_routes')
const categoria_tem_atributo = require('./categoria_atributo/categoria_tem_atributo/categoria_tem_atributo_routes')
const mascara_route = require('./mascara/mascara_routes')
const pasta_atributo_opcao_select_route = require('./pasta/pasta_atributo_opcao_select/pasta_atributo_opcao_select_routes')
const processo_titulo_route = require('./processo/processo_titulo/processo_titulo_routes')
const post_route = require('./post/post/post_routes')
const post_comentario_route = require('./post/post_comentario/post_comentario_routes')
const post_conteudo_route = require('./post/post_conteudo/post_conteudo_routes')
const post_like_route = require('./post/post_like/post_like_routes')
const post_projeto_route = require('./post/post_projeto/post_projeto_routes')
const post_usuarios_route = require('./post/post_usuarios/post_usuarios_routes')
const define_prazo_processo_route = require('./define_prazo_processo/define_prazo_processo_routes');
const execucao_processo_route = require('./api/routes/execucao_processo_routes.js');



app.use('/auth', auth_route);
app.use('/processo-execucao', execucao_processo_route);
app.use('/post', post_route);
app.use('/post-comentario', post_comentario_route);
app.use('/post-conteudo', post_conteudo_route);
app.use('/post-like', post_like_route);
app.use('/post-projeto', post_projeto_route);
app.use('/post-usuarios', post_usuarios_route);
app.use('/categoria-atributo', categoria_atributo_routes);
app.use('/categoria-tem-atributo', categoria_tem_atributo);
app.use('/fornecedor', fornecedor_route);
app.use('/material', material_routes);
app.use('/material-detalhe', material_detalhe_routes);
app.use('/programa', programa_route);
app.use('/requisicao-material', requisicao_material_route);
app.use('/requisicao-material-documento', requisicao_material_documento_route)
app.use('/requisicao-material-itens', requisicao_material_itens_route)
app.use('/processo', processo);
app.use('/processo-cadastro',processo_cadastro);
app.use('/processo-campo-cadastro',processo_campo_cadastro);
app.use('/processo-campo-opcao-select',processo_campo_opcao_select)
app.use('/processo-campos',processo_campos);
app.use('/processo-fluxo-cadastro',processo_fluxo_cadastro);
app.use('/processo-passo',processo_passo);
app.use('/processo-passo-cadastro',processo_passo_cadastro);
app.use('/processo-campo-arquivo',processo_campo_arquivo);
app.use('/processo-arquivo',processo_arquivo);
app.use('/processo-favoritos',processo_favoritos_route)
app.use('/processo-observadores',processo_observadores_route)
app.use('/processo-passo-comentarios',processo_passo_comentarios_route)
app.use('/empresa', empresa_route);
app.use('/grupo', grupo_route);
app.use('/usuario', usuario_route);
app.use('/usuario-grupo', usuario_grupo_route);
app.use('/usuario-empresa', usuario_empresa_route);
app.use('/projeto-cadastro', projeto_cadastro_route);
app.use('/projeto-timeline', projeto_timeline_route);
app.use('/projeto-grupo', projeto_grupo_route);
app.use('/projeto-pasta', projeto_pasta_route);
app.use('/projeto-documento', projeto_documento_route);
app.use('/projeto-documento-atributo', projeto_documento_atributo_route);
app.use('/projeto-favoritos',projeto_favoritos_route)
app.use('/pasta-cadastro', pasta_cadastro_route);
app.use('/pasta-atributo', pasta_atributo_route);
app.use('/pasta-permissao', pasta_permissao_route);
app.use('/pasta-documento-nome', pasta_documento_nome_route);
app.use('/pasta-documento-nome-tipo', pasta_documento_nome_tipo_route);
app.use('/permissao', permissao)
app.use('/papel',papel)
app.use('/usuario-papel',usuario_papel)
app.use('/localizacao', localizacao_route);
app.use('/documentos', express.static(__dirname + "static/documentos"));
app.use("/comunicacao", comunicacao_route);
app.use('/categoria', categoria_route)
app.use('/unidade',unidade_route)
app.use('/mascara',mascara_route)
app.use('/processo-campo-mascara',processo_campo_mascara_route)
app.use('/pasta-atributo-opcao-select', pasta_atributo_opcao_select_route)
app.use('/processo-titulo', processo_titulo_route)
app.use('/define-prazo-processo', define_prazo_processo_route)
app.use('/health-check', healthCheck);
app.use("/", serverOnline);
app.use(handleExpressError);

function healthCheck(req, res) {
    setTimeout(() => {
        res.send({
            status: "Running",
            message: "O servidor está rodando!"
        });
    }, 10000);
}

function serverOnline(req, res) {
    res.send({
        status: "Online",
        message: "O servidor está online!"
    });
}

module.exports = app;