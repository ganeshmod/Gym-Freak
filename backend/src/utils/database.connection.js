import mongoose from "mongoose"

export async function MongoDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        if (conn) {
            console.log("Database Connected Successfully", conn.connection.host)
        } else {
            console.log("Database Connection Failed")
        }
    } catch (err) {
        console.log("Database Connection Failed", err)
    }
}