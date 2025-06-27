require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('connecting  to the recipeBOOk')
})


//............................... ............... */
// recipebook  TpeziKSUQBlhGOpv


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.owvc9jc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//mongoDb function 

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
   // await client.connect();

    //create  databace collection name recipebd and 
    //under create the data recipes

     const recipeCollection = client.db('recipeDB').collection('recipes')
const newsletterCollection =client.db('recipeDB').collection('newsletter');
     //read  5 top recepies
     app.get('/top-recipe',async(req,res)=>{
      const topRecipe = await recipeCollection
      .find()
      .sort({likeCount :-1})
      .limit(6)
      .toArray()
      res.send (topRecipe)
     })

//  .................count convert into string.....................................
     app.get('/fix-like-types', async (req, res) => {
  try {
    
    const result = await recipeCollection.updateMany(
      { likeCount: { $type: "string" } },
      [
        { $set: { likeCount: { $toInt: "$likeCount" } } }
      ]
    );
    res.send({ message: 'Fixed likeCount types', result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Update failed' });
  }
});
//..............................................***.................................

     

     // read all recipe from mongo db
     app.get('/addrecipes',async(req,res)=>{
      const  result  = await recipeCollection.find().toArray()
      res.send(result)
     })

    // send all  repice to mongodb
  app.post('/addrecipes',async(req,res)=>{

    const newRecipe = req.body;
    console.log(newRecipe)
     const result =await recipeCollection.insertOne(newRecipe)
    res.send(result)

  })

  // email response 
  app.post('/newsletter-subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: 'No email provided' });

  try {
    const existing = await newsletterCollection.findOne({ email });
if (existing) {
  return res.json({ success: false, message: 'Already subscribed' });
}

await newsletterCollection.insertOne({ email, subscribedAt: new Date() });
res.json({ success: true, message: 'Subscribed successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});


  // update only like 
  // Update like count for a recipe
// Update like count only
app.patch('/addrecipes/:id/like', async (req, res) => {
  const { id } = req.params;
  const { likeCount } = req.body;

  const result = await recipeCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { likeCount } }
  );
  res.send(result);
});

// update whole recipe

    // ✅ Update full recipe
 app.put('/addrecipes/:id', async (req, res) => {
  const { id } = req.params;
  const updatedRecipe = { ...req.body };
  
  // Remove _id before update
  delete updatedRecipe._id;
  
  const result = await recipeCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedRecipe }
  );
  res.send(result);
});
 
//
app.delete('/addrecipes/:id', async (req, res) => {
  const { id } = req.params;
  
  const result = await recipeCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});



    //Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);

 // ................................ *******.....................
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})