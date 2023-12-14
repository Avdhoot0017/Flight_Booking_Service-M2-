const { StatusCodes } = require('http-status-codes');


const {Booking} = require('../models');


const {Enums} = require('../utils/common');
const { BOOKED , PENDING , INITIATED , CANCELLED} = Enums.BOOKING_STATUS;
const crudRepository = require('./crud-repository');

const { Op } = require('sequelize')

class Bookingrepository extends crudRepository{
    

    constructor()
    {
        super(Booking)
    }



    async createBooking(data,transaction)
    {
        const responce = await Booking.create(data, {transaction: transaction});
        return responce;

    }




    async get(data,transaction)
    {
        

            const responce = await this.model.findByPk(data , {transaction: transaction});
            
            if(!responce)
            {
                throw new Apperror('Not able to find the resource' ,StatusCodes.NOT_FOUND);

            }

           return responce;

            
        
    }



//we are overriding this functions because we are passing transactions to it
    async update(id,data,transaction)
    {

        

        

            const responce = await this.model.update(data,{
                where:{
                    id: id
                }
            },{transaction: transaction})
           return responce;

            
        
    }


    async cancellBooking(timesatmp)
    {
        const resonce = await Booking.update({status:CANCELLED},{
            where: {

                [Op.and]: [{

                    createdAt:{
                        [Op.lt]: timesatmp
                    }
                    
                },
                {
                    status:{
                        [Op.ne]: BOOKED
                    }
                },
                {
                    status:{
                        [Op.ne]: CANCELLED
                    }
                }

                  
                            
                ]
               
            }
        })

        return resonce;
    }

}


module.exports = Bookingrepository;