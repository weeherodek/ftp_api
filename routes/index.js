const {Router} = require('express');
const MainController = require('../controllers/mainController');
const path = require('path');


const router = Router();

router.get('/', (req,res)=>{
    return res.status(200).json('HOME');
})
router.get('/gif', MainController.generateGif);  
router.get('/images', MainController.getImages);
router.get('/getgif', MainController.getGif);

module.exports = router;