import { prisma } from "@repo/db"
import { Request, Response } from "express"
import bcrypt from 'bcrypt'
import * as z from "zod";
import jwt from 'jsonwebtoken'

const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const userData = z.object({
            email: z.email(),
            password: z.string().min(6),
            name: z.string().min(1)
        });

        const result = userData.safeParse({ email: email, password: password, name: name });
        if (!result.success) {
            return res.status(400).json({
                error: result.error.issues.map(i => i.message).join(", ")
            })
        } else {
            const userExist = await prisma.user.findFirst({
                where: { email: email }
            });

            if (userExist) {
                return res.status(409).json({
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

            const token = jwt.sign({
                userId: user.id
            }, process.env.JWT_SECRET as string, {
                expiresIn: '7d'
            })

            return res.status(200).json({
                message: "user created successfully",
                userId: user.id,
                name: user.name,
                token: token
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

        const { email, password } = req.body;

        const userData = z.object({
            email: z.email(),
            password: z.string(),
        });

        const result = userData.safeParse({
            email: email,
            password: password
        });
        if (!result.success) {
            return res.status(400).json({
                error: result.error.issues.map(i => i.message).join(", ")
            })
        } else {

            const ifExist = await prisma.user.findFirst({
                where: { email: email }
            });

            if (!ifExist) {
                return res.status(401).json({
                    message: "Email does'nt exist"
                })
            }

            const isUser = await bcrypt.compare(password, ifExist.password);

            if (!isUser) {
                return res.status(401).json({
                    message: "Invalid email id or password"
                })
            }

            const token = jwt.sign({
                userId: ifExist.id
            }, process.env.JWT_SECRET as string, {
                expiresIn: "7d"
            })

            return res.json({
                message: "user login successfully",
                userId: ifExist.id,
                name: ifExist.name,
                token: token
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
