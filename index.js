const express=require('express');
const cors=require('cors');
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const port= process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors({
    origin:['http://localhost:5173' ],
    // credentials:true,           
    // optionSuccessStatus:200
  }));
  app.use(express.json());
  app.use(cookieParser());


  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kxdlhgg.mongodb.net/?retryWrites=true&w=majority`;


  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });



  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

      const dataBase=client.db('BloodBank');

      

      app.post('/api/v1/users',async function (req, res) {
        const Collection = dataBase.collection("users");
        const Info=req.body;
        const result = await Collection.insertOne(Info);
        res.send(result);
      })








      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);

  app.get('/',(req, res)=>{
    res.send('Hello World');
})

app.listen(port, ()=>{
    console.log(`server listening on ${port}`);
});