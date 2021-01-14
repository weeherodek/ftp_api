const express = require('express');
const app = express();

const routes = require('./routes');
const Schedule = require('../FTP_API/helper/schedule');

const port  = process.env.PORT || 3003;

Schedule.updateImage();
Schedule.updateGif();

app.use(routes);

app.listen(port,()=>{
    console.log(`Running app... PORT: ${port}`);
});