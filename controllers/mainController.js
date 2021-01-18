const GIFEncoder = require('gif-encoder-2')
const { createCanvas, Image } = require('canvas')
const fs = require('fs');
const { createWriteStream, readdir, readdirSync } = require('fs')
const { promisify } = require('util')
const path = require('path')
const ftp = require('basic-ftp');
const schedule = require('node-schedule');

class MainController{
    static async getImages(req,res){
          const client = new ftp.Client()
          client.ftp.verbose = false;
          try {
              await client.access({
                  host: "riomidia.cor.rio.gov.br",
                  user: "yellowpages",
                  password: "cTbB7jUM",
                  secure: false,
              })
              client.trackProgress(info=> {
                  console.log("File: " , info.name);
                  console.log("Bytes: ", info.bytes);
              });
              await client.downloadToDir('ftp/commapa', "commapa");
              await fs.unlinkSync(path.join(__dirname,'../','ftp','commapa','Thumbs.db'));
              await fs.unlinkSync(path.join(__dirname,'../','ftp','commapa','radarsem.png'));
              client.trackProgress();
              client.close();
              return res.status(200).json('Imagens atualizadas !');
          } catch (error) {
              console.log('Erro ao atualizar imagens.', error);
              return res.status(400).json('Erro ao atualizar imagens.');
          }

    }

    static async generateGif(req,res){
        const readdirAsync = promisify(readdir)
        const imagesFolder = path.join(__dirname, '../', 'ftp', 'commapa');
        
        async function createGif(algorithm) {
          return new Promise(async resolve1 => {
            // read image directory
            const files = await readdirAsync(imagesFolder);
         
            // find the width and height of the image
            const [width, height] = await new Promise(resolve2 => {
              const image = new Image()
              image.onload = () => resolve2([image.width, image.height])
              image.src = path.join(imagesFolder, files[0])
            })
         
            // base GIF filepath on which algorithm is being used
            const dstPath = path.join(__dirname, '../','ftp', `intermediate-${algorithm}.gif`);
            // create a write stream for GIF data
            const writeStream = createWriteStream(dstPath)
            // when stream closes GIF is created so resolve promise
            writeStream.on('close', () => {
              resolve1()
            })
            
            const encoder = new GIFEncoder(width, height, algorithm)
            // pipe encoder's read stream to our write stream
            encoder.createReadStream().pipe(writeStream)
            encoder.start()
            encoder.setDelay(600);
            
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext('2d')
            
            // draw an image for each file and add frame to encoder
            for (const file of files) {
              console.log(file);
              await new Promise(resolve3 => {
                const image = new Image()
                image.onload = () => {
                  ctx.drawImage(image, 0, 0)
                  encoder.addFrame(ctx)
                  resolve3()
                }
                image.src = path.join(imagesFolder, file)
              })
            }
          })
        }        
          try {
           await createGif('octree');
           return res.status(200).json('Gif gerado com sucesso !');
          } catch (error) {
           console.log('Erro ao gerar gif ', error);
           return res.status(400).json('Erro ao gerar gif');
          }
    }

    static async getGif(req,res){
        try {
            const gifPath = path.join(__dirname,'../','ftp','intermediate-octree.gif');
            return res.status(200).sendFile(gifPath);
        } catch (error) {
            console.log('Gif não foi gerado.');
            return res.status(400).json(`Gif não encontrado, tente novamente mais tarde.`);
        }
    }

    static async lastImage(req,res){
      const imagesFolder = path.join(__dirname, '../', 'ftp', 'commapa');
      const client = new ftp.Client()
        client.ftp.verbose = false;
      try {
        await client.access({
            host: "riomidia.cor.rio.gov.br",
            user: "yellowpages",
            password: "cTbB7jUM",
            secure: false,
        })
        const filesFolder = await client.list('commapa');
        let fileName;
        let lastChange = 0;
        filesFolder.forEach(element =>{
          if(element.name != 'Thumbs.db' && element.name != 'radarsem.png'){
            if(element.modifiedAt > lastChange){
              fileName = element.name;
              lastChange = element.modifiedAt;
            }
          }
        })
        client.close();
        const lastImageChanged = path.join(imagesFolder, fileName);
        return res.status(200).sendFile(lastImageChanged);
    } catch (error) {
        console.log('Erro ao pegar ultima imagem.', error);
        return res.status(400).json('Erro ao pegar ultima imagem.');
    }
    }
}

module.exports = MainController;