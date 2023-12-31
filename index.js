const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ogz7mxs.mongodb.net/?retryWrites=true&w=majority`;

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
        const taskCollection = client.db("taskDB").collection("tasks");
        const userCollection = client.db('taskDB').collection("users");


        //-----------------------GETS---------------------
        app.get('/tasks', async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result);
        })




        //-----------------------POSTS---------------------
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user exist', insertedId: null });
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        })


        //--------------------------PATCHES--------------------
        app.patch('/task/:id', async(req, res) => {
            const task = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id)};
            const updatedDoc = {
                $set: {
                    status: task.status
                }
            }
            const result = await taskCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })




        //------------------------DELETE-----------------------
        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)};
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("task nestle server running...");
})
app.listen(port, () => {
    console.log(`task nestle running on port : ${port}`);
})