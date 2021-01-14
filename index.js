const express = require('express');
const app = express();
const cors = require('cors');

const routes = require('./routes');
const Schedule = require('../FTP_API/helper/schedule');

const port  = process.env.PORT || 3003;

Schedule.updateImage();
Schedule.updateGif();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(routes);

app.listen(port,()=>{
    console.log(`Running app... PORT: ${port}`);
});