import { MongoClient } from "mongodb";

const uri = "mongodb://srbhanarkar05_db_user:uwobWptXlT5J7hGH@ac-a3ujnlz-shard-00-00.kcvcaz1.mongodb.net:27017,ac-a3ujnlz-shard-00-01.kcvcaz1.mongodb.net:27017,ac-a3ujnlz-shard-00-02.kcvcaz1.mongodb.net:27017/?ssl=true&replicaSet=atlas-7ewsls-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log("Connecting to MongoDB...");
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("Connected successfully!");
    
    const db = client.db("kyc-demo");
    const collection = db.collection("users");
    
    const count = await collection.countDocuments();
    console.log(`Current document count in kyc-demo.users: ${count}`);
    
    await client.close();
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

run();
