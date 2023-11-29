const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  optionSuccessStatus: 200
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

    const dataBase = client.db('BloodBank');



    app.post('/api/v1/users', async function (req, res) {
      const Collection = dataBase.collection("users");
      const Info = req.body;
      const result = await Collection.insertOne(Info);
      res.send(result);
    })

    app.get('/api/v1/search-doner', async (req, res) => {
      const donorsCollection = dataBase.collection('users');
      let { blood_group, state, city, email,role } = req.query;

      if (blood_group == 'A ') blood_group = 'A+'
      else if (blood_group == 'B ') blood_group = 'B+'
      else if (blood_group == 'O ') blood_group = 'O+'
      else if (blood_group == 'AB ') blood_group = 'AB+'

      // Build the query based on the provided parameters
      let query = {role:role};

      if (blood_group) {
        query['blood_group'] = blood_group;
      }

      if (state) {
        query['state'] = state;
      }

      if (city) {
        query['city'] = city;
      }
      if (email) {
        query['email'] = email;
      }

      console.log(query);

      try {
        // Find donors in the database based on the query
        const donors = await donorsCollection.find(query).toArray();
        // console.log(query);
        // console.log(donors);

        // Send the list of donors as the response
        res.send(donors);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }

    });



    app.get('/api/v1/user/:email', async (req, res) => {
      console.log(req.params.email);
      const Collection = dataBase.collection("users");
      const coursor = Collection.find({ email: `${req.params.email}` })
      const result = await coursor.toArray();
      res.send(result);

    })

    app.get('/api/v1/districts', async (req, res) => {
      console.log(req.params.email);
      const Collection = dataBase.collection("districts");
      const coursor = Collection.find()
      const result = await coursor.toArray();
      res.send(result);

    })

    app.get('/api/v1/upazilas', async (req, res) => {
      console.log(req.params.email);
      const Collection = dataBase.collection("upazilas");
      const coursor = Collection.find()
      const result = await coursor.toArray();
      res.send(result);

    })

    app.get('/api/v1/upazilas/:district_id', async (req, res) => {
      console.log(req.params.email);
      const Collection = dataBase.collection("upazilas");
      const coursor = Collection.find({district_id:`${req.params.district_id}`})
      const result = await coursor.toArray();
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

app.get('/', (req, res) => {
  res.send('Hello World');
})

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});