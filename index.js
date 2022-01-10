const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

require('dotenv/config');
const {MongoClient} = require("mongodb");
//express app initialize
const app = express();
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cmdn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// const serviceAccount = require('./ping-bd-firebase-adminsdk-tc6zi-484fce3e23.json');



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];

        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }

    }
    next();
}


async function run() {
    try {
        await client.connect();
        const database = client.db("ping-bd");
        const applicationCourseCollection = database.collection('application-course');
        const usersCollection = database.collection('users');




        //Course Api
        app.get('/course', async(req, res)=>{
            res.send('');
        })


        //Application-Course

        app.post('/application',async (req, res)=>{
            const body = req.body;
            console.log(body);
            var today = new Date();
            var year = today.getFullYear();
            var mes = today.getMonth()+1;
            var dia = today.getDate();
            var date =dia+"-"+mes+"-"+year;
            body.date = date;
            const result = await applicationCourseCollection.insertOne(body);
            res.json(result);
        })

        app.get('/applications', async(req,res)=>{
            const query={};
            const cursor = applicationCourseCollection.find(query).sort({ _id: -1 });
            const result = await cursor.toArray();
            res.json(result);
        });

        app.put("/applications/status/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const data = req.body;
            const updateDoc = {
                $set: {
                    status: data.status,
                },
            };
            console.log(data);
            const order = await applicationCourseCollection.updateOne(query, updateDoc);
            res.json(order);
        });

        //Delete Admission
        app.delete("/applications/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await applicationCourseCollection.deleteOne(query);
            res.send(result);
        });


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            console.log(query);
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/users', async (req, res) => {
            let user = req.body;
            user.role = 'user';
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const requester = user.email;
            if (requester)
            {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role) {
                    const filter = { email: user.email };
                    const options = { upsert: true };
                    const updateDoc = { $set: user };
                    const result = await usersCollection.updateOne(filter, updateDoc, options);
                    res.json(result);
                }
                else {
                    const filter = { email: user.email };
                    const options = { upsert: true };
                    user.role = 'user'
                    const updateDoc = { $set: user };
                    const result = await usersCollection.updateOne(filter, updateDoc, options);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        });

        app.put('/users/admin', verifyToken, async (req, res) => {
            const user = req.body;
            console.log(user);
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        })



    }
    finally {
    // await client.close();
}
}

run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("server start");
})

app.listen(5000,()=>{
    console.log("Port listen 5000");
})
