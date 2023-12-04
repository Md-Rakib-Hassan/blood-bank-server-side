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
  origin: ['http://localhost:5173','https://blood-bank-ee717.web.app','https://spiffy-lollipop-bbb8a6.netlify.app'],
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

    const dataBase = client.db('BloodBank');



    app.post('/api/v1/users', async function (req, res) {
      const Collection = dataBase.collection("users");
      const Info = req.body;
      const result = await Collection.insertOne(Info);
      res.send(result);
    })

    app.post('/api/v1/donetion-req', async function (req, res) {
      const Collection = dataBase.collection("donetionReq");
      const Info = req.body;
      const result = await Collection.insertOne(Info);
      res.send(result);
    })

    app.post('/api/v1/blogs', async function (req, res) {
      const Collection = dataBase.collection("blogs");
      const Info = req.body;
      const result = await Collection.insertOne(Info);
      res.send(result);
    })

    app.get('/api/v1/search-doner', async (req, res) => {
      const donorsCollection = dataBase.collection('users');
      let { blood_group, state, city, email, role } = req.query;

      if (blood_group == 'A ') blood_group = 'A+'
      else if (blood_group == 'B ') blood_group = 'B+'
      else if (blood_group == 'O ') blood_group = 'O+'
      else if (blood_group == 'AB ') blood_group = 'AB+'

      // Build the query based on the provided parameters
      let query = {};
      if (role) query['role'] = role;
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


    app.get('/api/v1/donation-req', async (req, res) => {
      const donorsCollection = dataBase.collection('donetionReq');
      let { status,requesterEmail,id } = req.query;


      // Build the query based on the provided parameters
      let query = {};
      if (status) query['status'] = status;
      if (requesterEmail) {
        query['requesterEmail'] = requesterEmail;
      }
      if(id) query['_id'] =new ObjectId(id);


      try {
        const donors = await donorsCollection.find(query).toArray();
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

    app.get('/api/v1/blogs', async (req, res) => {
      const {status}=req.query;
      let query={};
      if(status)query['status']=status;
      const Collection = dataBase.collection("blogs");
      const coursor = Collection.find(query);
      const result = await coursor.toArray();
      res.send(result);

    })

    app.get('/api/v1/blogs/:id', async (req, res) => {
      const id=req.params.id;
      const Collection = dataBase.collection("blogs");
      const result = await Collection.findOne({_id: new ObjectId(id)});
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
      const coursor = Collection.find({ district_id: `${req.params.district_id}` })
      const result = await coursor.toArray();
      res.send(result);

    })

    app.put('/api/v1/update-profile/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const Collection = dataBase.collection("users");
      const updatedProfile = req.body;

      const user = {


        $set: {
          name: updatedProfile.name,
          blood_group: updatedProfile.blood_group,
          district: updatedProfile.district,
          upazila: updatedProfile.upazila,

        },
      }

      const result = await Collection.updateOne(filter, user, options);
      res.send(result);


    })

    app.put('/api/v1/update-role/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const Collection = dataBase.collection("users");
      const {role} = req.body;

      const user = {


        $set: {
          role: role,
        },
      }

      const result = await Collection.updateOne(filter, user, options);
      res.send(result);


    })

    app.put('/api/v1/status/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const Collection = dataBase.collection("users");
      const {status} = req.body;

      const user = {


        $set: {
          status: status,
        },
      }

      const result = await Collection.updateOne(filter, user, options);
      res.send(result);


    })

    app.delete('/api/v1/blogs/delete/:id', async (req, res) => {
      const id = req.params.id;
      const Collection = dataBase.collection("blogs");
      const query={_id: new ObjectId(id)}
      const result= await Collection.deleteOne(query);
      res.send(result);

    });

    app.delete('/api/v1/users/delete/:id', async (req, res) => {
      const id = req.params.id;
      const Collection = dataBase.collection("users");
      const query={_id: new ObjectId(id)}
      const result= await Collection.deleteOne(query);
      res.send(result);

    });

    app.delete('/api/v1/donation-requests/delete/:id', async (req, res) => {
      const id = req.params.id;
      const Collection = dataBase.collection("donetionReq");
      const query={_id: new ObjectId(id)}
      const result= await Collection.deleteOne(query);
      res.send(result);

    });

    app.put('/api/v1/blogs/publish/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const Collection = dataBase.collection("blogs");
      const updatedBlog = req.body;

      const blog = {


        $set: {
          status: 'published',
        },
      }

      const result = await Collection.updateOne(filter, blog, options);
      res.send(result);


    })

    app.put('/api/v1/update/donetion-req/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const Collection = dataBase.collection("donetionReq");
      const {status} = req.body;

      const up = {


        $set: {
          status: status,
        },
      }

      const result = await Collection.updateOne(filter, up, options);
      res.send(result);


    })

    app.post('/api/v1/contacts-info', async function (req, res) {
      const contactCollection = dataBase.collection("contactsInfo");
      const ContactInfo = req.body;
      const result = await contactCollection.insertOne(ContactInfo);
      res.send(result);
    })


    app.post('/api/v1/subscribers', async function (req, res) {
      const Collection = dataBase.collection("subscribers");
      const ReqInfo = req.body;
      const result = await Collection.insertOne(ReqInfo);
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