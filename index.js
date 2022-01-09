const express = require('express');
const cors = require('cors');





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

async function run() {
    try {
        await client.connect();
        const database = client.db("ping-bd");
        const applicationCourseCollection = database.collection('application-course');




        //Course Api
        app.get('/course', async(req, res)=>{
            res.send('');
        })


        //Application-Course

        app.post('/application',async (req, res)=>{
            const body = req.body;
            console.log(body);
            body.date = new Date();
            const result = await applicationCourseCollection.insertOne(body);
            res.json(result);
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
