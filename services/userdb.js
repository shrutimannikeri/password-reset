import {client} from '../index.js'
import { ObjectId } from "mongodb";
export const createUser=async(data)=>{
    return await client.db("userDB")
    .collection("users")
    .insertOne(data)


}

export  async function getUserByEmail(email){
    return await client.db("userDB")
    .collection("users")
    .findOne({email: email})
}

export async function updateUserRandomstring(data){
    return await client.db("userDB")
    .collection("users")
    .updateOne({email: data.email},{$set:{random_string: data.random_string}})
}

export  async function getUserById(id){
    return await client.db("userDB")
    .collection("users")
    .findOne({_id: new ObjectId(id)})
}
export async function updateRandomstringById(data){
    return await client.db("userDB")
    .collection("users")
    .updateOne({ _id: new ObjectId(data.id) },
    { $set: { random_string: data.random_string } })
}
export async function updatePassword(data){
    return await client.db("userDB")
    .collection("users")
    .updateOne({ _id: new ObjectId(data.id) },
    { $set: { password: data.password } })
}