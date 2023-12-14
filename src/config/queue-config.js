const amqplib = require('amqplib');


let channel, connect;


async function connectqueue()
{
    try {
         connect = await amqplib.connect("amqp://localhost");
         channel = await connect.createChannel();

        await channel.assertQueue("noti-queue");
        // await channel.sendToQueue("test-message",Buffer.from("this is a msg")); 
        // setInterval(()=>{
            // channel.sendToQueue("noti-queue",Buffer.from('one more'));
        // },1000);
        
    } catch (error) {

        console.log(error); 

        
    }
}



async function sendData(data)
{
    try {

        channel.sendToQueue("noti-queue",Buffer.from(JSON.stringify(data)));
        
    } catch (error) {

        console.log(error); 

        
    }
}

module.exports = {
    connectqueue,
    sendData
}
