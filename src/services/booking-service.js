const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const Apperror = require('../utils/errors/app-error');

const { BookingRepository } = require('../repository');
const db = require('../models');
const { serverConfig, queue } = require('../config');

const bookingrepo = new BookingRepository();

const {Enums} = require('../utils/common');
const { BOOKED , PENDING , INITIATED , CANCELLED} = Enums.BOOKING_STATUS;



async function createBooking(data)
{

    const transaction = await db.sequelize.transaction();

  try {

  
        const flight = await axios.get(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightdata = flight.data.data;
        

        if(data.noOfSeats > flightdata.totalSeats)
        {
         throw new Apperror('Not enough seats available', StatusCodes.BAD_REQUEST);
        }

        const totalPrice = data.noOfSeats * flightdata.price;
        const flightId = data.flightId;
        const userId = data.userId;
        const noOfSeats = data.noOfSeats;

        const bookingPayload = {flightID:flightId,userId: userId,noOfSeats: noOfSeats ,totalCost:totalPrice};
        const booking =  await bookingrepo.create(bookingPayload, transaction);

        await axios.patch(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
        {
            seats: data.noOfSeats
        });



        await transaction.commit();
 
        return booking;


    



    
  } catch (error) {

    await transaction.rollback();
    throw error;


    
  }
}



async function makePayments(data)
{
    const transaction = await db.sequelize.transaction();

    try {
        const bookingDetails = await bookingrepo.get(data.bookingId,transaction);

        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000)
        {

            await cacelBooking(data.bookingId);
            // await bookingrepo.update(data.bookingId,{status: CANCELLED} , transaction);

            throw new Apperror('the booking time has expried !', StatusCodes.BAD_REQUEST);

        } 

        if(bookingDetails.totalCost != data.totalCost)
        {
            throw new Apperror('the amount dosent match !', StatusCodes.BAD_REQUEST);
        }


        if(bookingDetails.userId != data.userId)
        {
            throw new Apperror('userID dosent  match !', StatusCodes.BAD_REQUEST);
        }
//after all this if payment is sucessfull
            const responce = await bookingrepo.update(data.bookingId,{status: BOOKED} , transaction);

             queue.sendData({
            recipientEmail: 'avdhootwalunjkar@gmail.com',
            subject:'flight booked',
            text: `booking sucesfully Done for the flight ${data.bookingId}`
        })
        
            await transaction.commit();

            
       


        
    } catch (error) {

        await transaction.rollback();
        throw error;

        
    }

}


async function cacelBooking(bookingId)
{

    const transaction = await db.sequelize.transaction();


    try {

        const bookigdetails = await bookingrepo.get(bookingId,transaction);
        if(bookigdetails.status == CANCELLED)
        {
            await transaction.commit();
            return true;

        }

        await axios.patch(`${serverConfig.FLIGHT_SERVICE}/api/v1/flights/${bookigdetails.flightID}/seats`,
        {
            seats: bookigdetails.noOfSeats,
            dec: 0
        })

        await bookingrepo.update(bookingId,{status: CANCELLED} , transaction);
        await transaction.commit();


        
    } catch (error) {

        await transaction.rollback();
        throw error;

        
    }

}


async function cacellOldBooking()
{
    try {

        const currTime = new Date(Date.now() - 1000*300);
        const responce = await bookingrepo.cancellBooking(currTime);
        return responce;
        
    } catch (error) {

        console.log(error);
        
    }
}




module.exports = {
    createBooking,
    makePayments,
    cacellOldBooking
}