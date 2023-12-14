const express = require('express');

const router = express.Router();
const bookingRouter = require('./booking')

    
    const { infoController } = require('../../controllers');


router.get('/info' , infoController.info);
router.use('/booking',bookingRouter);


module.exports = router;