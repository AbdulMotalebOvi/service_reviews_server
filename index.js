const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Assignament eleven server is running')
})


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5urggkk.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const newCollections = client.db('serviceReview').collection('allServices')
        const reviewCollection = client.db('serviceReview').collection('reviews')
        const addProducts = client.db('serviceReview').collection('addProducts')
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = newCollections.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })
        app.get('/allServices', async (req, res) => {
            const query = {}
            const cursor = newCollections.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
        app.get('/allServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const singleService = await newCollections.findOne(query)
            res.send(singleService)
        })
        // reviews api

        app.post('/reviews', async (req, res) => {
            const reviews = req.body
            const result = await reviewCollection.insertOne(reviews)
            res.send(result)
        })
        app.get('/allReviews', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        // app.get('/allReviews/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }
        //     const singleService = await reviewCollection.findOne(query)
        //     res.send(singleService)
        // })
        app.post('/servicesReviews', async (req, res) => {
            const order = req.body
            const result = await reviewCollection.insertOne(order)
            res.send(result)
        })
        app.post('/products', async (req, res) => {
            const products = req.body
            const result = await addProducts.insertOne(products)
            res.send(result)
        })
        app.get('/addedProducts', async (req, res) => {
            const query = {}
            const cursor = addProducts.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })
    }
    finally {

    }
}
run().catch(console.dir)




app.listen(port, () => {
    console.log(`server running on port${port}`);
})