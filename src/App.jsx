import { useRef, useEffect, useState } from "react";
import Peer from "peerjs";
import "./App.css";

function App() {
  const peerRef = useRef(null);
  const [myStream, setMyStream] = useState(null);
  const [peerID, setPeerID] = useState(null);
  const myVideoRef = useRef(null);
  const peerVideoRef = useRef(null);

  useEffect(() => {
    return () => {
      const startMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);
        myVideoRef.current.srcObject = stream; // Set the srcObject property directly
      };
      startMedia();
      const peer = new Peer();
      peerRef.current = peer;

      peer.on("open", (id) => {
        console.log("My peer ID is: " + id);
      });

      peer.on("connection", (conn) => {
        conn.on("data", (data) => {
          // Will print 'hi!'
          console.log(data);
        });

        conn.on("open", () => {
          conn.send("hello!");
        });
      });

      peer.on("call", (call) => {
        console.log("remote is calling");
        call.answer(myStream); // Answer the call with our stream
        call.on("stream", (remoteStream) => {
          console.log("remote is called stream", remoteStream);
          peerVideoRef.current.srcObject = remoteStream;
        });
      });
    };
  }, []);

  const handlePeerId = (e) => {
    setPeerID(e.target.value);
  };

  const handleCall = (e) => {
    var call = peerRef.current.call(peerID, myStream);
    call.on("stream", (remoteStream) => {
      console.log("inside remote streaming: ", peerVideoRef);
      peerVideoRef.current.srcObject = remoteStream;
    });
  };

  return (
    <>
      <div className="App">Video Calling</div>
      <video ref={myVideoRef} autoPlay playsInline />
      <br />
      <video ref={peerVideoRef} autoPlay playsInline />
      <br />
      <br />
      <input type="text" placeholder="Enter peer id" onChange={handlePeerId} />
      <button onClick={handleCall}>Call</button>
    </>
  );
}

export default App;
