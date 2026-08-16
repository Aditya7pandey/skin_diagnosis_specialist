import { prisma } from "@repo/db"
import { Request, response, Response } from "express"
import bcrypt, { hash } from 'bcrypt'
import * as z from "zod";

const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body();

        const userData = z.object({
            email: z.string(),
            password: z.string(),
            name: z.string()
        });

        const result = userData.safeParse({ email: email, password: password, name: name });
        if (!result.success) {
            return res.json({
                error: result.error
            })
        } else {

            const userExist = await prisma.user.findFirst(email);

            if (userExist) {
                return res.json({
                    message: "user already exist"
                })
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    email: email,
                    password: hashedPassword,
                    name: name
                }
            })

            return res.status(200).json({
                message: "user created successfully",
                userId: user.id
            })
        }
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                "error": error.message
            })
        }
    }
}

const login = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body();

        const userData = z.object({
            email: z.string(),
            password: z.string(),
        });

        const result = userData.safeParse({
            email:email,
            password:password
        });
        if (!result.success) {
            return res.json({
                error:result.error
            })
        } else {

        const ifExist = await prisma.user.findFirst(email);

        if (!ifExist) {
            return res.json({
                message: "Email does'nt exist"
            })
        }

        const isUser = await bcrypt.compare(ifExist.password, password);

        if (!isUser) {
            return res.json({
                message: "Invalid email id or password"
            })
        }

        return res.json({
            message: "user login successfully",
            id: ifExist.id
        })
    }
    
    } catch (error) {
        if (error instanceof Error) {
            return res.json({
                error: error.message
            })
        }
    }
}

export {
    signup,
    login
}