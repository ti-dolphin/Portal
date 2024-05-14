const path = require("path");
const { Storage } = require("@google-cloud/storage");
const stream = require('stream');

const gc = new Storage({
  keyFilename: path.join(__dirname, "./roxcode-1a9ea691cbb8.json"), // arquivo das credenciais do google cloud
  projectId: "roxcode" // nome do projeto google cloud
});

const dolphinBucket = gc.bucket(process.env.BUCKET);
class GoogleCloudStorage{

  // parametro arquivo é composto pelo base64
  // parametro caminho é composto do path completo do arquivo, incluindo seu nome

  static verificaArquivo(caminho){
    return new Promise(function (resolve, reject) {
      try {
        dolphinBucket.file(caminho).exists().then((r)=>{
          resolve(r[0])
        }).catch((err) => {
          resolve(false)
        })
        
      } catch (error) {
        return false
      }
    });
  }

  static upload(arquivo,caminho){
    return new Promise(function (resolve, reject) {

      var base64 = arquivo.split('base64,');

      var bufferStream = new stream.PassThrough();
      if(base64[1]){
        bufferStream.end(Buffer.from(base64[1], 'base64'));
      }else{
        bufferStream.end(Buffer.from(arquivo));
      }

      var file = dolphinBucket.file(caminho);

      bufferStream.pipe(file.createWriteStream({
          resumable: false,
          gzip: true
      })).on('error', function(err) {
          reject(err)
      }).on('finish', function() {
          resolve('Upload feito com sucesso.')
      });

    })
  }

  static getURLArquivo(caminho){
    return new Promise(function (resolve, reject) {

      try {
        const file = dolphinBucket.file(caminho);
  
        return file.getSignedUrl({
            action: 'read',
            expires: '03-09-2100'
        }).then(signedUrls => {
            resolve(signedUrls[0])
        }).catch((err) => {
            resolve('')
            // reject(err);
        })
        
      } catch (error) {
        return ''
      }

    })
  }

  static getURLArquivoDocumento(caminho){

    return new Promise(async function (resolve, reject) {    
      const file = dolphinBucket.file(caminho)

      return file.getSignedUrl({
          action: 'read',
          expires: '03-09-2100'
      }).then(signedUrls => {
          resolve(signedUrls[0])
      }).catch((err) => {
          reject(err);
      })


    })
  }

  static getFilesDirectory(caminho){
    return new Promise(async function (resolve, reject) {  
      try {
        var array = caminho.split('/') 
        const [files] = await dolphinBucket.getFiles({ prefix: caminho, autoPaginate: false })
    
        if(files.length > 0){
          for (const file of files) {
            const metaData = await file.getMetadata()
  
            var nomeArray = file.name.split('/')
  
            const signedUrl = await file.getSignedUrl({
              action: 'read',
              expires: '03-09-2100',
            });
  
            var retorno = {
              id: array[1] ? array[1] : null,
              path: nomeArray[2],
              name: nomeArray[2],
              size: metaData[0].size,
              type: metaData[0].contentType,
              url: signedUrl[0]
            }
      
            resolve(retorno)
          }
        } else{
          resolve(null)
        }
    
      } catch (error) {
        reject(error)
      }
    })
  }

  static getFileArquivoDocumento(caminho){
    return new Promise(async function (resolve, reject) {    
      var array = caminho.split('/') 

      const file = dolphinBucket.file(caminho)
      const metaData = await file.getMetadata()

      var url = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2100'
      })

      var nomeArray = file.name.split('/')
      var retorno = {
        id: array[1] ? array[1] : null,
        path: nomeArray[2],
        // preview: "blob:"+url[0],
        name: nomeArray[2],
        size: metaData[0].size,
        type: metaData[0].contentType,
        url: url[0]
      }

      resolve(retorno)

    })
  }

  static getArquivo(caminho){
    return new Promise(function (resolve, reject) {
      const file = dolphinBucket.file(caminho);
      
      var buf = '';
      file.createReadStream().on('data',function(data){
        buf += data;
      }).on('end', function() {
        resolve(buf)
      }); 

    })
  }

  static delete(caminho){
    return new Promise(function (resolve, reject) {
      dolphinBucket.file(caminho).delete().then(()=>{
        resolve('Arquivo deletado')
      }).catch((err) => {
        reject(err);
      })
    })
  }

  static renomeia(caminhoOrigem,caminhoDestino){
    return new Promise(function (resolve, reject) {

      dolphinBucket.file(caminhoOrigem).exists().then((r)=>{
        if(r.length > 0 && r[0]){
          const file = dolphinBucket.file(caminhoOrigem)
          file.rename(caminhoDestino).then(()=>{
            resolve('Arquivo renomeado com sucesso')
          }).catch((err) => {
            console.log(err)
            resolve(false)
          })
        } else{
          console.log('renomeia arqui nao existe '+caminhoOrigem)
          resolve(false)
        }
      }).catch((err) => {
        console.log(err)
        console.log(caminhoOrigem)
        console.log(caminhoDestino)
        resolve(false)
      })
    })

  }

  static copia(caminhoOrigem,caminhoDestino){
    return new Promise(function (resolve, reject) {
      dolphinBucket.file(caminhoOrigem).copy(dolphinBucket.file(caminhoDestino)).then(()=>{
        resolve('Arquivo copiado com sucesso')
      }).catch((err) => {
        reject(err);
      })
    })
  }

  static move(caminhoOrigem,caminhoDestino){
    return new Promise(function (resolve, reject) {
      dolphinBucket.file(caminhoOrigem).move(caminhoDestino).then(()=>{
        resolve('Arquivo movido com sucesso')
      }).catch((err) => {
        reject(err);
      })
    })
  }

}
  
module.exports = GoogleCloudStorage