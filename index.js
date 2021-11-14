const express = require("express");
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pbvyd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("rentACarDb");

      const carsCollection = database.collection("allCars");
      const reviewCollection = database.collection("customerReviews");
      const buyersCollection = database.collection("buyers");
      const usersCollection = database.collection("users");
      
      //GET CAR API
      app.get('/cars', async(req,res) =>{
        const cars = carsCollection.find({});
        const result = await cars.toArray();
        res.json(result)
      });

      //GET CAR WITH ID API
      app.get('/cars/:id',async(req,res) =>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await carsCollection.findOne(query);
          res.json(result)
      });

      //GET CAR API
      app.get('/reviews', async(req,res) =>{
        const review = reviewCollection.find({});
        const result = await review.toArray();
        res.json(result)
      });

      //GET MY ORDERS API
      app.get('/myOrders', async (req,res) =>{
        const email = req.query.email;
        const query = {email:email}
        const booking = buyersCollection.find(query);
        const result = await booking.toArray();
        res.json(result);
      });

      //GET MY ORDERS API
      app.get('/manageOrders', async (req,res) =>{
        const allOrders = buyersCollection.find({});
        const result = await allOrders.toArray();
        res.json(result);
      });

      //GET ADMIN ROLE API
      app.get('/user/:email', async(req,res) =>{
        const email = req.params.email;
        const query = {email:email};
        let isAdmin = false;
        const result = await usersCollection.findOne(query);
        if(result?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin:isAdmin});
      });

      //ADDDED CAR API
      app.post('/addCar', async (req,res) =>{
        const addCar = req.body;
        const result = await carsCollection.insertOne(addCar);
        res.json(result);
      });

      //POST REVIES API
      app.post('/reviews', async (req,res) =>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.json(result);
      });

      //POST BUYER INFO API
      app.post('/buyer', async (req,res) =>{
        const buyerInfo = req.body;
        const result = await buyersCollection.insertOne(buyerInfo);
        res.json(result)
      });

      //USER DATA API
      app.post('/user', async (req,res) =>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result)
      });

      // USER DATA UPDATE API 
      app.put('/user', async (req,res) =>{
          const user = req.body;
          const filter = {email:user.email};
          const options = { upsert: true };
          const updateDoc = {$set:user};
          const result = await usersCollection.updateOne(filter,updateDoc,options);
          res.json(result);
      });

      // MAKE ADMIN API 
      app.put('/users/admin', async (req,res) =>{
          const email = req.body.email;
          const query = {email:email}
          const updateDoc = {$set:{role:"admin"}}
          const result = await usersCollection.updateOne(query,updateDoc);
          res.json(result);
      })

      //UPDATE STATUS API
      app.put('/myOrders/:id', async (req,res) =>{
        const id = req.params.id;
        const upadetData = req.body;
        const filter = {_id:ObjectId(id)};
        const updateDoc = {
          $set:{
            status:upadetData.status
          }
        }
        const result = await buyersCollection.updateOne(filter,updateDoc);
        res.json(result);
      });

      //DELETE BOOKINGS API
      app.delete('/myOrders/:id', async (req,res) =>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await buyersCollection.deleteOne(query);
          res.json(result);
      });

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get("/" ,(req, res) =>{
    res.send("Car Sales Server Running");
});

app.listen(port ,() =>{
    console.log("Listen Port is",port);
});