import ip from 'ip'
import { Request,Response,NextFunction } from 'express'
import redis from '../lib/redisConnect';

const MAX_TIME =30; 
const MAX_REQ = 5;


const rateLimitter = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        const myIp = ip.address();
        
        const request = await redis.incr(myIp);

        if(request === 1){
            await redis.expire(myIp,MAX_TIME);
        }

        if(request>MAX_REQ){
            return res.status(429).json({
                message:"Too many requests"
            })
        }

        next();
    }   
    catch(error){
        return res.status(400).json({
            error:error
        })
    }
}

export default rateLimitter;