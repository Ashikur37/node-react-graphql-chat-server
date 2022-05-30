// import {ApolloServer} from 'apollo-server';

// import resolvers from './resolvers.js';
// import typeDefs from './typeDefs.js';
// import jwt from 'jsonwebtoken';
// import express from 'express';
// import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
// import { createServer } from 'http';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { WebSocketServer } from 'ws';
// import { useServer } from 'graphql-ws/lib/use/ws';



// const context=({req})=>{
//     const {authorization}= req.headers;
//     if(authorization){
//        const {userId}= jwt.verify(authorization,process.env.JWT_SECRET);
//        return {userId};
//     }
// };
// // const server = new ApolloServer({typeDefs,resolvers,context:({req})=>{
// //      const {authorization}= req.headers;
// //      if(authorization){
// //         const {userId}= jwt.verify(authorization,process.env.JWT_SECRET);
// //         return {userId};
// //      }
// // }});
// const app= express();
// const httpServer = createServer(app);
// const schema = makeExecutableSchema({ typeDefs, resolvers });
// // ...
// const wsServer = new WebSocketServer({
//     // This is the `httpServer` we created in a previous step.
//     server: httpServer,
//     // Pass a different path here if your ApolloServer serves at
//     // a different path.
//     path: '/graphql',
//   });

//   // Hand in the schema we just created and have the
//   // WebSocketServer start listening.
//   const serverCleanup = useServer({ schema }, wsServer);

// const server = new ApolloServer({
//     schema,
//     context,
//     csrfPrevention: true,
//     plugins: [
//       // Proper shutdown for the HTTP server.
//       ApolloServerPluginDrainHttpServer({ httpServer }),

//       // Proper shutdown for the WebSocket server.
//       {
//         async serverWillStart() {
//           return {
//             async drainServer() {
//               await serverCleanup.dispose();
//             },
//           };
//         },
//       },
//     ],
//   });
  
// server.listen().then(({url}) => {
//     console.log(`🚀  Server ready at ${url}`);
//     });






    import { ApolloServer } from 'apollo-server-express';
    import { createServer } from 'http';
    import express from 'express';
    import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
    import { makeExecutableSchema } from '@graphql-tools/schema';
    import { WebSocketServer } from 'ws';
    import { useServer } from 'graphql-ws/lib/use/ws';
    import jwt from 'jsonwebtoken';
import resolvers from './resolvers.js';
import typeDefs from './typeDefs.js';
    
    // Create the schema, which will be used separately by ApolloServer and
    // the WebSocket server.

    const context=({req})=>{
      const {authorization}= req.headers;
      if(authorization){
         const {userId}= jwt.verify(authorization,process.env.JWT_SECRET);
         return {userId};
      }
  };
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    
    // Create an Express app and HTTP server; we will attach both the WebSocket
    // server and the ApolloServer to this HTTP server.
    const app = express();
    const httpServer = createServer(app);
    
    // Create our WebSocket server using the HTTP server we just set up.
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql',
    });
    
    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer({ schema }, wsServer);
    
    // Set up ApolloServer.
    const server = new ApolloServer({
      schema,
      context,
      csrfPrevention: true,
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),
    
        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    });
    
    await server.start();
    server.applyMiddleware({ app });
    
    const PORT = 4000;
    // Now that our HTTP server is fully set up, we can listen to it.
    httpServer.listen(PORT, () => {
      console.log(
        `Server is now running on http://localhost:${PORT}${server.graphqlPath}`,
      );
    });