

import Product from "../DB/models/Product.js"

export const getAllProducts = async(req,res)=>{

    try {
        const allProd = await Product.find().limit(20)
        res.status(200).send({data:allProd})
    } catch (error) {
        console.log(error,"err-")
    }
}