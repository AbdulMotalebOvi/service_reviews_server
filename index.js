const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Assignament eleven server is running')
})

// jwt token
function verifyJwt(req, res, next) {
    const authHeaders = req.headers.authorization
    if (!authHeaders) {
        res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeaders.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded
        next()
    })
}

// server api
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5urggkk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const newCollections = client.db('serviceReview').collection('allServices')
        const reviewCollection = client.db('serviceReview').collection('reviews')
        const addProducts = client.db('serviceReview').collection('addProducts')

        // jwt token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })
        // services api
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = newCollections.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })
        app.get('/allServices', verifyJwt, async (req, res) => {
            // const decoded = req.decoded;
            // console.log(decoded);
            // if (decoded.email !== req.query.email) {
            //     res.status(403).send({ message: 'unauthorized access' })
            // }
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
        app.get('/allReviews', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
        })
        app.delete('/allReviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) }
            const singleService = await reviewCollection.deleteOne(query)
            res.send(singleService)
        })
        // update
        app.put('/allReviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const options = { upsert: true };
            const updatedUser = {
                $set: {
                    serviceName: user.name,
                    photo: user.photoURL,
                    message: user.message
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedUser, options)
            res.send(result)
        })

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