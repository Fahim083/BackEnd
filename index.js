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

    app.get('/reviews',async(req,res)=>{
        const {gmail} = req.query
        if(!gmail){
          return res.status(400).send({error: "Gmail is required"})
        }
        const query = {gmail:gmail}
      const result = await ReviewCollection.find(query).toArray()
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

