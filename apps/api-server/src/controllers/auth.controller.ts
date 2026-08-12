import {prisma} from "@repo/db"
import { Request,Response } from "express"

const signup = async (req:Request,res:Response) =>{
    try {
        const {email,password,name} = req.body();
        
        if(!email || !password || !name){
            return res.json({
                "message":"All feilds are required"
            })
        }

        const user = await 
        
    } catch (error) {
        if(error instanceof Error){
            return res.status(400).json({
                "error":error.message
            })
        }
    }
}

export{
    signup
}