import express from 'express'
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv'
import userRouter from './routes/user.js'
import cors from 'cors'
dotenv.config();

const app = express();
const PORT = process.env.PORT

//db conection

const MONGO_URL=process.env.MONGO_URI
const  createConnection=async()=>{
    const client=new MongoClient(MONGO_URL);
    await client.connect();
    return client
 }
 export const client= await createConnection()

app.use(express.json())
app.use(cors());



app.get("/", function (request, response) {
    response.send("🙋‍♂️, 🌏 🎊✨🤩");
  });

  app.use("/user",userRouter)
app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
