const express = require('express');

const router = express.Router();

    
    const {bookingController} = require('../../controllers');

    router.post('/',bookingController.craeteBooking);

    router.post('/payment' , bookingController.makepayments);


module.exports = router;