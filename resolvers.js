import client from '@prisma/client';
import { ApolloError, AuthenticationError, ForbiddenError } from 'apollo-server';
import argon from 'argon2';
import jwt from 'jsonwebtoken';

const prisma=new client.PrismaClient();
let users=[
    {
        id:"1",
        name:'piash',
        email:'piash@gmail.com',
        password:'123658'
    },
    {
        id:"2",
        name:'polash',
        email:'polash@gmail.com',
        password:'12365'
    },
]
const todos=[
    {
        id:1,
        title:"first todo",
        by:"1"
    },
    {
        id:2,
        title:"second todo",
        by:"1"
    }
];

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
            
           
        }
    }
}

export default resolvers;