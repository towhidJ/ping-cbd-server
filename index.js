const express = require('express');
const cors = require('cors');
const admin = require("firebase-admin");
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 7000;
const fileUpload = require('express-fileupload');


require('dotenv/config');
const {MongoClient} = require("mongodb");
//express app initialize
const app = express();
app.use(express.json())
app.use(cors())
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8g4ei.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
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
        const coursesCollection = database.collection('courses');
        const courseNameListCollection = database.collection('courses-name-lists');
        const universityCollection = database.collection('university');
        const trainersCollection = database.collection('trainers');
        const bannerImgCollection = database.collection('bannerImg');
        const newsCollection = database.collection('news-list');
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");






        //Course Api
        app.get('/courses', async(req, res)=>{
            const cursor = coursesCollection.find({"isActive":true}).sort({_id:-1});
            const result = await cursor.toArray();
            res.json(result);
        })

        // post course api
        app.post('/courses',async (req, res)=>{
            const body = req.body;
            const result = await coursesCollection.insertMany(body);
            res.json(result);
        })


        //news Api
        app.get('/news', async(req, res)=>{
            const cursor = newsCollection.find({}).sort({_id:-1});
            const result = await cursor.toArray();
            res.json(result);
        })

        // post news api
        app.post('/news',async (req, res)=>{
            // const body = req.body;
            console.log(req.body)
            var today = new Date();
            var year = today.getFullYear();
            var mes = today.getMonth()+1;
            var dia = today.getDate();
            var date =dia+"-"+mes+"-"+year;
            const newsTitle = req.body.newsTitle;
            const newsMessage = req.body.newsMessage;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const news = {
                newsTitle,
                newsMessage,
                img: imageBuffer,
                date
            }


            const result = await newsCollection.insertOne(news);
            res.json(result);
        })
//Delete news
        app.delete("/news/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await newsCollection.deleteOne(query);
            res.send(result);
        });

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


        // app.post('/ckdata', async (req, res) => {
        //     console.log(req.body);
        //     let user = req.body;
        //     const result = await ckData.insertOne(user);
        //     console.log(result);
        //     res.json(result);
        // });


        //Delete Admission
        app.delete("/applications/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await applicationCourseCollection.deleteOne(query);
            res.send(result);
        });

        //Get Course NAme list

        app.get("/coursenamelist", async (req, res) => {

            const query = {};
            const cursor = await courseNameListCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //post Course NAme list

        app.post("/courseNameList", async (req, res) => {
            const body = req.body;

            const result = await courseNameListCollection.insertMany(body);
            res.send(result);
        });


        //delete Course NAme list

        app.delete("/courseNameList/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await courseNameListCollection.deleteOne(query);
            res.send(result);
        });



        //Get University List

        app.get("/university", async (req, res) => {

            const query = {};
            const cursor = await universityCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //post university list

        app.post("/university", async (req, res) => {
            const body = req.body;

            const result = await universityCollection.insertMany(body);
            res.send(result);
        });


        //Get bannerImg List

        app.get("/bannerImg", async (req, res) => {

            const query = {};
            const cursor = await bannerImgCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //post bannerImg list

        app.post("/bannerImg", async (req, res) => {
            const body = req.body;

            const result = await bannerImgCollection.insertMany(body);
            res.send(result);
        });

        //delete university list

        app.delete("/university/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await universityCollection.deleteOne(query);
            res.send(result);
        });


//Trainner Api

        //get Trainer
        app.get('/trainers',async (req, res)=>{
           const query = {};
           const cursor =  trainersCollection.find(query).sort({ seqId: 1 });
           const result = await cursor.toArray();
           res.json(result);
        });

        //post triner
        app.post('/trainer',async (req, res)=>{
            const body = req.body;
            const result = await trainersCollection.insertOne(body);
            res.json(result);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            console.log(email);
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


        //Get Products
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find({}).sort({ _id: -1 });
            const count = await cursor.count();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            if (page) {
                products = await cursor
                    .skip(page * size)
                    .limit(size)
                    .toArray();
            } else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products,
            });
        });

        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        //Delete Products
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });
//use post to Get Products By Key
        app.post("/products/byId", async (req, res) => {
            const keys = req.body;
            let a = [];
            for (const k of keys) {
                a.push(ObjectId(k));
            }

            const query = { _id: { $in: a } };
            console.log(query);
            const products = await productsCollection.find(query).toArray();
            console.log(products);
            res.json(products);
        });
        //Post Product
        app.post("/product", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(product);
        });

        //use post to Get Order By Email
        app.post("/orders/byEmail", async (req, res) => {
            const email = req.body;
            const query = { email: email.email };

            const orders = await ordersCollection.find(query).toArray();
            res.json(orders);
        });

        //Get Order
        app.get("/orders", async (req, res) => {
            const cursor = ordersCollection.find({}).sort({ _id: -1 });
            const orders = await cursor.toArray();
            res.json(orders);
        });
        //Get Order by id
        app.get("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);

            res.json(order);
        });

        app.put("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment,
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //Add orders
        app.post("/orders", async (req, res) => {
            const data = req.body;
            const order = await ordersCollection.insertOne(data);
            res.json(order);
        });

        //Updata Order status
        app.put("/status/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const data = req.body;
            const updateDoc = {
                $set: {
                    status: data.status,
                },
            };
            console.log(data);
            const order = await ordersCollection.updateOne(query, updateDoc);
            res.json(order);
        });

        //Delete Order
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        });


    }
    finally {
    // await client.close();
}
}

run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("server start");
})


app.listen(port,()=>{
    console.log("Port listen 5000");
})
