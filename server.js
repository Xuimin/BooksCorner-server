const { ApolloServer } = require('apollo-server-express')
const express = require('express');
const cors = require('cors')

const typeDefs = require('./Controllers/typeDefs')
const resolvers = require('./Controllers/resolvers')
const { graphqlUploadExpress } = require('graphql-upload')

const mongoose = require('mongoose')
// mongoose.connect('mongodb://localhost:27017/BooksCorner')
mongoose.connect("mongodb+srv://xuiminNcass:bookscorner@bookscorner.xejjs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
mongoose.connection.once('open', () => console.log('Connected to MongoDB'))

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()
  
  const app = express()
  app.use(express.static('Public'))
  app.use(cors())
  
  app.use(graphqlUploadExpress())
  server.applyMiddleware({ app })

  await new Promise(r => app.listen({ port: 4000 }, r))

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}
startServer();