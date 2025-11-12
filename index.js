import express from 'express'
import cors from 'cors'
const app = express()
import dotenv from 'dotenv'
import { MongoClient, ServerApiVersion,ObjectId } from 'mongodb';
const port = process.env.PORT || 3000
dotenv.config()
// console.log(process.env.DB_USER);
app.use(cors({
  origin: ['http://localhost:3000',
   'http://localhost:5173',
  'http://localhost:5173',
  'https://velvety-moxie-01f024.netlify.app'
  ],
  credentials: true
}))
app.use(express.json()) 



app.get("/",async(req,res)=>{
    res.send("Hello World")
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2n5zm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection


    const PropertyCollection = client.db('Homenest').collection('Properties');
    const ReviewCollection = client.db('Homenest').collection('Reviews');


    app.get('/properties',async(req,res)=>{
      const result = await PropertyCollection.find().toArray()
      res.send(result)
    })

    app.get('/home-properties',async(req,res)=>{
      const result = await PropertyCollection.find().sort({date:-1}).limit(6).toArray()
      res.send(result)
    })

   app.get('/properties/:sort', async (req, res) => {
  try {
    const sort = req.params.sort;

    if (!sort) {
      return res.status(400).send({ error: "Sort parameter is required" });
    }

    // Determine sort option
    let sortOption = {};
    if (sort === 'asc') {
      sortOption = { Date: 1 }; // oldest first
    } else if (sort === 'desc') {
      sortOption = { Date: -1 }; // newest first
    } else {
      return res.status(400).send({ error: "Sort must be 'asc' or 'desc'" });
    }

    const result = await PropertyCollection.find().sort(sortOption).toArray();

    // Check if result is empty
    if (!result || result.length === 0) {
      return res.status(404).send({ error: "No properties found" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).send({ error: "Failed to fetch properties" });
  }
});

app.get('/property-details/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await PropertyCollection.findOne(query);

    if (!result) {
      return res.status(404).send({ error: "Property not found" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).send({ error: "Failed to fetch property" });
  }
});

app.post('/add-property', async (req, res) => {
  try {
    const property = req.body;

    if (!property || property.length === 0) {
      return res.status(400).send({ error: "Property data is required" });
    }

    const result = await PropertyCollection.insertOne(property);
    res.status(201).send(result);
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).send({ error: "Failed to add property" });
  }
});

app.put('/update-property/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).send({ error: "Update data is required" });
    }

    const query = { _id: new ObjectId(id) };
    const update = { $set: updateData };

    const result = await PropertyCollection.updateOne(query, update);

    if (result.matchedCount === 0) {
      return res.status(404).send({ error: "Property not found" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).send({ error: "Failed to update property" });
  }
});

app.delete('/delete-property/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).send({ error: "ID is required" });
    }

    const query = { _id: new ObjectId(id) };
    const result = await PropertyCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Property not found" });
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).send({ error: "Failed to delete property" });
  }
});


app.get('/my-properties',async(req,res)=>{
      const gmail = req.body.gmail
        if(!gmail){
            return res.status(400).send({error: "Gmail is required"})
        }
      const query = {gmail:gmail}
      const result = await PropertyCollection.find(query).toArray()
      if(!result){
        return  res.status(404).send({error: "No properties found"})
      }
      res.send(result)
    })

    app.get('/reviews',async(req,res)=>{
        const {gmail} = req.body
        if(!gmail){
          return res.status(400).send({error: "Gmail is required"})
        }
        const query = {gmail:gmail}
      const result = await ReviewCollection.find(query).toArray()
      if(!Array(result) || result.length === 0){
        return  res.status(404).send({error: "No reviews found"})
      }
      res.send(result)
    })

    app.post('/create-review',async(req,res)=>{
      const review = req.body
      if(!review || Object.keys(review).length === 0){
        return res.status(400).send({error: "Review data is required"})
      }
      const result = await ReviewCollection.insertOne(review)
      res.send(result)
    })

  }  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})

