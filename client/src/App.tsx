import React, { useEffect, useState } from "react";
import { KJUR, KEYUTIL } from "jsrsasign";

const API_URL = "http://localhost:8080";

interface FetchDataObject {
  data: string;
  signature: string;
  publicKey: string;
}

const App = () => {
  const [data, setData] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");
  const [signature, setSignature] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  // Fetch data from the server
  const getData = async () => {
    const response = await fetch(API_URL);
    const body: FetchDataObject = await response.json();
    setData(body.data);
    setSignature(body.signature);
    setPublicKey(body.publicKey);

    console.log("Updating signature", body);
  };

  // Update data on the server
  const updateData = async () => {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    await getData();
  };


  const verifyData = () => {
    try {
      const sig = new KJUR.crypto.Signature({ alg: "SHA256withRSA" });
      sig.init(publicKey);
      sig.updateString(data);

      //Verify signature
      const isValid = sig.verify(signature);

      if (isValid) {
        alert("Data is validated and has not been tampered with.");
      } else {
        alert("Data is invalid or has been tampered with.");
      }
    } catch (error) {
      console.error(error);
      alert("Cryptographic verification failed. Please check the public key and signature.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
      </div>
    </div>
  );
};

export default App;
