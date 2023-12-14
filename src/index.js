const {serverConfig , Logger, queue} = require('./config/index');
const express = require('express');
const  apiRoutes = require('./routes/index');
const CRON = require('./utils/common/cron-jobs');





// const { AboutController , homecontrller } = require('./config');//when we do this it autonmatically consider file index from congig



const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));  

app.use('/api' , apiRoutes);
//now hit localhost/api/v1/info 
app.use('/bookingService/api', apiRoutes);

app.listen(serverConfig.PORT , async()=>{

    console.log("sucsesfully start server");
    Logger.info("sucessfully starrted server  " , "root" , {});
    CRON();
    await queue.connectqueue();

})