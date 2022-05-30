import { gql } from "apollo-server";

const  typeDefs= gql`
    type Query{
        users:[User]
        messagesByUser(receiverId:Int!):[Message]
    }
    input UserInput {
        name:String!
        email:String!
        password:String!
    }
    input UserSigninInput {
        email:String!
        password:String!
    }

    scalar Date


    type Message{
        id:ID!
        text:String
        receiverId:Int!
        senderId:Int!
        createdAt:Date
    }
    type Mutation{
        signupUser(userNew:UserInput!):User
        signinUser(userSignin:UserSigninInput!):Token
        createMessage(receiverId:Int!,text:String!):Message
    }


    type Token{
        token:String!
        
    }

    type User{
        id:String
        name:String
        email:String
        todos:[Todo]
    }
    type Todo{
        
        title:String
        by:ID!
    }

    type Subscription{
        messageAdded:Message
    }
    
`;


export default typeDefs;