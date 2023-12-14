var cron = require('node-cron');

const { bookingService } = require('../../services');


function scheduleCrons()
{

    cron.schedule('*/30  * * * * ', async () => {

       const responce =  await bookingService.cacellOldBooking(); 
       console.log(responce); 
        
      });

}


module.exports = scheduleCrons;


