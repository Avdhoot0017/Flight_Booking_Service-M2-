



const info = (req, res) =>{

    return res.json({

        sucsess : true,
        message:"ok",
        error: {},
        data: {}
    })
}

module.exports ={
    info
}