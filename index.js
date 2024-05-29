const  express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const port = process.env.PORT || 5000;

// MIDDLEWARE
 app.use(cors());
 app.use(express.json())

console.log(process.env.res_USER);


 const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
 const uri =`mongodb+srv://${process.env.res_USER}:${process.env.res_PASS}@cluster0.7ijeqqy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
 
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
       
       const menuCollection = client.db('resDb').collection('menu');
       const userCollection = client.db('resDb').collection('users');
       const reviewCollection = client.db('resDb').collection('review');
       const cartCollection = client.db('resDb').collection('carts');

       app.get('/menu', async(req,res)=>{
         const result = await menuCollection.find().toArray();
         res.send(result);
       })

       app.get('/review', async(req,res)=>{
         const result = await reviewCollection.find().toArray();
         res.send(result);
       })


       app.get('/carts', async(req,res)=>{
        const email = req.query.email;
        console.log(email);
        const query = { email: email };
        console.log(query);
        const result = await cartCollection.find(query).toArray();
        res.send(result)
      })

      //  sending user daata to db
      app.post('/carts', async(req,res)=>{
        const    cartItem  = req.body;
        const result = await cartCollection.insertOne(cartItem);
        console.log('in result', result);
        res.send(result)
      })
      // delete item
      app.delete('/carts/:id', async(req,res)=>{
        const id = req.params.id;
        const query ={_id: new ObjectId(id)}
        const result = await cartCollection.deleteOne(query);
        res.send(result);
      })
      
      // to save user info in db
      app.post('/users', async(req,res)=>{
         const user = req.body;
         const query = {email: user.email}
         const existingUser = await userCollection.findOne(query);
         if (existingUser){
          return  res.send ({messeage:'user exits', insertedId:null})
         }
         const result = await userCollection.insertOne(user);
         res.send(result);
      })
    // get user from db for admin page
    app.get('/users', async(req,res)=>{
      const result = await userCollection.find().toArray();
      res.send(result)
    })

    // delete user apis_____________
     app.delete('/users/:id', async(req,res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);
     })
    //  make admin api__________________
    app.patch('/users/admin/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set:{
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter,updateDoc);
      res.send(result)
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
 


 app.get('/', (req,res)=>{
    res.send('restaurent server is running')
 })

 app.listen(port,   () =>{
    console.log(`website running on port:${port}`);
 })