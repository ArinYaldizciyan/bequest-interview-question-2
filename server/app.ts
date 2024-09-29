import express from "express";
import cors from "cors";
import { KEYUTIL, KJUR } from "jsrsasign";

const PORT = 8080;
const app = express();

interface DataRecord {
  data: string;
  signature: string;
}

// Mocking Key Management Service. Stores private key and public key.
const keyPair = KEYUTIL.generateKeypair("RSA", 512);
const KMS_PRIVATE_KEY = KEYUTIL.getPEM(keyPair.prvKeyObj, "PKCS1PRV");
const PUBLIC_KEY = KEYUTIL.getPEM(keyPair.pubKeyObj);

// Mock database and WORM datastore
const database: DataRecord = { data: "", signature: "" };
const WORM_DATASTORE: Array<DataRecord> = [];

const generateSignature = (data: string) => {
  const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
  sig.init(KMS_PRIVATE_KEY);
  sig.updateString(data);
  return sig.sign();
};

const verifySignature = (data: string, signature: string) => {
  const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
  sig.init(PUBLIC_KEY);
  sig.updateString(data);
  return sig.verify(signature);
};

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  // Validate the current record
  const isValid = verifySignature(database.data, database.signature);

  // Automatically restore from WORM datastore if record is invalid
  if (!isValid && WORM_DATASTORE.length > 0) {
    console.log("Data tampered with. Restoring from WORM datastore...");
    const lastValidRecord = WORM_DATASTORE[WORM_DATASTORE.length - 1];
    database.data = lastValidRecord.data;
    database.signature = lastValidRecord.signature;
  }

  
  res.json({ data: database.data, signature: database.signature, publicKey: PUBLIC_KEY });
  console.log("Sent data to client.");
});


app.post("/", (req, res) => {
  const newData = req.body.data;

  if (!newData) {
    return res.status(400).json({ message: "No data passed." });
  }

  const newSignature = generateSignature(newData);

  // Append to WORM store before updating
  WORM_DATASTORE.push({ data: newData, signature: newSignature });

  // Update Record
  database.data = newData;
  database.signature = newSignature;
  console.log("Data Received");
  res.status(200).json({ message: "Data updated successfully" });
});

// DELETE Route mocks database attack
app.delete("/delete", (req, res) => {
  database.data = "";
  database.signature = "";
  res.json({ message: "Data deleted." });
});

// Start the server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
