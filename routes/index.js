const path = require('path');

const {Router} = require('express');
const router = Router();

const MainController = require('../controllers/mainController');
const Schedule = require('../helper/schedule');

// Schedule.teste();
Schedule.updateImage();
Schedule.updateGif();

router.get('/', (req,res)=>{
    return res.status(200).json('HOME');
})

router.get('/images', MainController.getImages);
router.get('/gif', MainController.generateGif);
router.get('/getgif', MainController.getGif);
router.get('/lastimage', MainController.lastImage);

module.exports = router;