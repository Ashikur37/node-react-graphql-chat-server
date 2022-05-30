import client from '@prisma/client';
import { ApolloError, AuthenticationError, ForbiddenError } from 'apollo-server';
import argon from 'argon2';
import jwt from 'jsonwebtoken';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const prisma=new client.PrismaClient();

const MESSAGE_ADDED='messageAdded';

const resolvers={
    Query:{
        users:async(_,args,{userId})=>{
            if(!userId){
                throw new ForbiddenError('you must be logged in');
            }
            const users=await prisma.user.findMany({
                orderBy:{
                    createdAt:"desc"
                },
                where:{
                    id:{
                        not:userId
                    }
                }
            });
            return users;
        },
        messagesByUser:async(_,{receiverId},{userId})=>{
            if(!userId){
                throw new ForbiddenError('you must be logged in');
            }
            const messages=await prisma.message.findMany({
                orderBy:{
                    createdAt:"asc"
                },
                where:{
                    OR:[
                        {
                            receiverId,
                            senderId:userId
                        },
                        {
                            receiverId:userId,
                            senderId:receiverId
                        }
                    ]
                }
            });
            return messages;

        }
        
    },
    User:{
        todos:(parent,args,context)=>{
            return todos.filter(t=>t.by==parent.id);
        }
    },
    Mutation:{
        signupUser: async(_,{userNew},ctx)=>{
            console.log(userNew);
//check exist user
            const user=await prisma.user.findFirst({
                where:{
                    email:userNew.email
                }
            });

            if(user){
                throw new ApolloError('user already exists','409');
            }
            const hashedPassword=await argon.hash(userNew.password);

            const createdUser=await  prisma.user.create({
                data:{
                    name:userNew.name,
                    email:userNew.email,
                    password:hashedPassword

                }
            });
            return createdUser;

        },
        signinUser:async (_,{userSignin},ctx)=>{
            const user=await prisma.user.findFirst({
                where:{
                    email:userSignin.email,
                  
                }
            });
            if(!user){
                throw new AuthenticationError("Email doen't exist");
            }
            const match =await argon.verify(user.password,userSignin.password);
            if(match){
              const token=  jwt.sign({
                    userId:user.id,
                    email:user.email
                },
                
                process.env.JWT_SECRET,);
                return {
                    token};
            }
            else{
                throw new AuthenticationError("password is incorrect");
            }
            
           
        },
        createMessage:async(_,{receiverId,text},{userId})=>{
            if(!userId){
                throw new ForbiddenError('you must be logged in');
            }
            const createdMessage=await prisma.message.create({
                data:{
                    text,
                    receiverId ,
                    senderId:userId
                }
            });
            pubsub.publish(MESSAGE_ADDED,{
                messageAdded:createdMessage
            });
            return createdMessage;
        }
         
    },
    Subscription:{
        messageAdded:{
            subscribe:()=>pubsub.asyncIterator(MESSAGE_ADDED)
        }
    }
}

export default resolvers; 