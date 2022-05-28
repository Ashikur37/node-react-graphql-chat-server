import client from '@prisma/client';
import { ApolloError, AuthenticationError } from 'apollo-server';
import argon from 'argon2';
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
        users:()=>users,
        user:(parent,args,context)=>{
           
            return users.find(u=>u.id==args.id);
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
                return {
                    token:"abc"
                }
            }
            else{
                throw new AuthenticationError("password is incorrect");
            }
            
           
        }
    }
}

export default resolvers;