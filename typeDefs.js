import { gql } from "apollo-server";

const  typeDefs= gql`
    type Query{
        users:[User]
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
    type Mutation{
        signupUser(userNew:UserInput!):User
        signinUser(userSignin:UserSigninInput!):Token
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
    
`;


export default typeDefs;