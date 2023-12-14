const { bookingService } = require('../services');

const { successresponce, errorresponce } = require('../utils/common');
const { StatusCodes } = require('http-status-codes');
const inmemDB = {};


//localhost:4000/api/v1/booking
async function craeteBooking(req,res)
 {
   
        try {
            const responce = await bookingService.createBooking({
                flightId: req.body.flightId,
                userId: req.body.userId,
                noOfSeats: req.body.noOfSeats
            })
    
            successresponce.data = responce;
            return res.status(StatusCodes.OK).json(successresponce);
    
            
        } catch (error) {
    
            errorresponce.error = error;
                       
    
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorresponce);
            
        }
    
    }


    async function makepayments(req,res)
    {
      
           try {
            //if you want to make booking payment then you must have to rpovide key in post request 
            //localhost:4000/api/v1/booking/payment
            const idemptencyKey = req.headers['x-idempotency-key'];

            if(!idemptencyKey)
            {

                return res.status(StatusCodes.BAD_REQUEST).json({message: 'idempotency key is missing...!'});

            }


            if(inmemDB[idemptencyKey])
            {

                return res.status(StatusCodes.BAD_REQUEST).json({message: 'plz cannot retry after sucessful payment...!'});

            }
               const responce = await bookingService.makePayments({
                bookingId: req.body.bookingId,
                userId: req.body.userId,
                totalCost: req.body.totalCost
               })

               inmemDB[idemptencyKey] = idemptencyKey;
       
               successresponce.data = responce;
               return res.status(StatusCodes.OK).json(successresponce);
       
               
           } catch (error) {
       
               errorresponce.error = error;
                          
       
               return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorresponce);
               
           }
       
       }
 


 module.exports = {
    craeteBooking,
    makepayments
 }