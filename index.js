const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.maovuz9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    client.connect();

    const collegesCollection = client.db('endGame').collection('colleges')
    const graduationGalleryCollection = client.db('endGame').collection('graduationGallary')
    const researchPaperCollection = client.db('endGame').collection('researchPaper')
    const reviewCollection = client.db('endGame').collection('review')
    const admissionCollection = client.db('endGame').collection('admission')
    const admissionDetailsCollection = client.db('endGame').collection('admissionDetails')
    const userDetailsCollection = client.db('endGame').collection('userDetails')


    // user details 
    app.get('/users', async(req, res) => {
      const email = req.query.email
      const query = {email: email}
      const result = await userDetailsCollection.find(query).toArray()
      res.send(result)
    })
    app.post('/users', async(req, res) => {
      const userDetails = req.body
      const query = {email: userDetails.email}
      const existingUser = await userDetailsCollection.findOne(query);
      if(existingUser){
        return res.send({ message: 'User already exists' })
      }
      const result = await userDetailsCollection.insertOne(userDetails)
      res.send(result)
    })

    app.put('/users/:id', async(req, res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const saveChange = req.body
      const updateDetails = {
          $set:{
              name: saveChange?.name,
              photo: saveChange?.photo,
              phoneNo: saveChange?.phoneNo,
              age: saveChange?.age,
              college: saveChange?.college,
              address: saveChange?.address,
              dateOfBirth: saveChange?.dateOfBirth
          }
      }
      const result = await userDetailsCollection.updateOne(filter, updateDetails, options)
      res.send(result)
    })


    // colleges
    app.get('/colleges', async (req, res) => {
        const search = req.query.search
        console.log(search)
        const query = {college_name: {$regex: search, $options: 'i'}}
        const result = await collegesCollection.find(query).toArray();
        res.send(result);
    });

    app.get('/colleges/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result =  await collegesCollection.findOne(query)
      res.send(result)
    })

    // admission
    app.get('/admission', async (req, res) => {
      const result = await admissionCollection.find().toArray();
      res.send(result);
    });

    app.get('/admission/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result =  await admissionCollection.findOne(query)
      res.send(result)
    })

    app.get('/admissionDetails', async(req, res) => {
      const email = req.query.email
      const query = {email: email}
      const result = await admissionDetailsCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/admissionDetails', async(req, res) => {
      const admissionDetails = req.body
      const result = await admissionDetailsCollection.insertOne(admissionDetails)
      res.send(result)
    })



    // gallery
    app.get('/gallery', async (req, res) => {
        const result = await graduationGalleryCollection.find().toArray();
        res.send(result);
    });

    // research
    app.get('/research', async (req, res) => {
        const result = await researchPaperCollection.find().toArray();
        res.send(result);
    });

    // review
    app.get('/review', async (req, res) => {
        const result = await reviewCollection.find().toArray();
        res.send(result);
    });

    app.post('/review', async(req, res) => {
      const addReview = req.body
      const result = await reviewCollection.insertOne(addReview)
      res.send(result)
    })





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  finally {
    // await client.close();
  }
}
run().catch(console.log);


app.get('/', (req, res) => {
  res.send('College is running')
})

app.listen(port, () => {
  console.log(`College is running on port ${port}`)
})