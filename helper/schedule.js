const schedule = require('node-schedule');
const GIFEncoder = require('gif-encoder-2')
const { createCanvas, Image } = require('canvas')
const fs = require('fs');
const { createWriteStream, readdirSync } = require('fs')
const path = require('path')
const ftp = require('basic-ftp');


class Schedule{
    static async updateAll(){
        const imagesFolder = path.join(__dirname, '../', 'ftp', 'commapa');
        const starTime = new Date(Date.now() + 9000000)
        const job = schedule.scheduleJob('0,15,30,45 * * * *', async ()=>{
            const client = new ftp.Client()
          client.ftp.verbose = false;
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

              async function generateGif(algorithm) {
                return new Promise(async resolve1 => {
                    // read image directory
                    const files = await readdirSync(imagesFolder);
                 
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
            generateGif('octree');
        })

    }

    static async updateImage(){
        const job = schedule.scheduleJob('* */5 * * *', async ()=>{
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
          } catch (error) {
              console.log('Erro ao atualizar imagens.', error);
          }
        })
    }

    static async updateGif(){
        const imagesFolder = path.join(__dirname, '../', 'ftp', 'commapa');

        async function generateGif(algorithm) {
            return new Promise(async resolve1 => {
                // read image directory
                const files = await readdirSync(imagesFolder);
             
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
        const startTime = new Date(Date.now() + 900000);
        const endTime = new Date(startTime.getTime() + 20000);
        const job = schedule.scheduleJob({start:startTime}, ()=>{
                console.log('Gerando gif...');
                generateGif('octree');
                console.log('Gif Gerado');
        })
    }
    static async teste(){
        const job = schedule.scheduleJob({start: Date.now + 5000}, ()=>{
            console.log('teste');
        })
    }
}

module.exports = Schedule;