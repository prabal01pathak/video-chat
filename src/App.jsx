import io from "socket.io-client";
import { useRef, useEffect, useState } from "react";
import Peer from "peerjs";
import "./App.css";

function App() {
  const peerRef = useRef(null);
  const [myStream, setMyStream] = useState(null);
  const [callIds, setCallIds] = useState({});
  const [peerID, setPeerID] = useState(null);
  const myVideoRef = useRef(null);
  const peerVideoRef = useRef(null);

  useEffect(() => {
    console.log("calling use effect");
    const startMedia = async () => {
      if (myStream) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setMyStream(stream);
      myVideoRef.current.srcObject = stream; // Set the srcObject property directly
    };
    const ConnectWithSocketIOServer = () => {
      const eventId = "234";
      const employeeId = "e82d655043d248f99e3488bee7fee10e";
      // const socket = io("http://localhost:8080", {
      const socket = io("http://localhost:8080", {
        path: "/socket/sockets",
        query: {
          eventId: eventId,
          employeeId: employeeId,
        },
      });
      console.log("socket: ", socket);
      socket.on("update-call-ids", (data) => {
        setCallIds(data);
        console.log("update-call-ids: ", data);
      });

      // socket.on("get-twilio-token", (data) => {
      // console.log("get-twilio-token: ", data);
      const peer = new Peer("e82d655043d248f99e3488bee7fee10e", {
        host: "signaling-be-ms-vmwe4oziqq-el.a.run.app",
        port: 443,
      });
      console.log("peer: ", peer);
      peerRef.current = peer;
      peer.on("open", (id) => {
        console.log("my peer id is: ", id);
        socket.emit("new-call-id", {
          callId: id,
          eventId: "event123233",
          employeeId: "e82d655043d248f99e3488bee7fee10e",
          clientId: "client_id",
        });
        // });

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
          // console.log("calling : ", call);
          console.log("calling : ", call.peer);
          // const answer = window.confirm("Answer the call?");
          // if (!answer) {
          //   return call.close();
          // }
          // console.log("myStream: ", myStream);
          // console.log("answer: ", answer);
          call.answer(myStream); // Answer the call with our stream
          console.log("my stream: ", myStream);
          call.on("stream", (remoteStream) => {
            console.log("remote is called stream", remoteStream);
            peerVideoRef.current.srcObject = remoteStream;
          });
          console.log("playing audio");
        });
        // WebRTCServices.configurePeer(data); // browser
      });
    };
    ConnectWithSocketIOServer();
    startMedia();
  }, []);

  const handlePeerId = (e) => {
    setPeerID(e.target.value);
  };

  const handleCall = () => {
    console.log("my stream for calling: ", myStream);
    var call = peerRef.current.call(peerID, myStream);
    console.log("call: ", call);
    call.on("stream", (remoteStream) => {
      console.log(
        "inside remote streaming ===========================: ",
        peerVideoRef
      );
      peerVideoRef.current.srcObject = remoteStream;
    });
  };

  const callRemote = (e) => {
    console.log(e.target.innerText);
    var call = peerRef.current.call(
      callIds[e.target.innerText]?.callId,
      myStream
    );
    call.on("stream", (remoteStream) => {
      console.log("inside remote streaming: ", peerVideoRef);
      peerVideoRef.current.srcObject = remoteStream;
    });
  };

  return (
    <>
      <div className="App">Video Calling</div>
      <video ref={myVideoRef} muted autoPlay playsInline />
      <br />
      <video ref={peerVideoRef} autoPlay playsInline />
      {Object.keys(callIds).map((callId) => {
        console.log("callId: ", callId);
        return (
          <>
            <button onClick={callRemote}>{callId}</button>
            <br />
          </>
        );
      })}
      <br />
      <input type="text" placeholder="Enter peer id" onChange={handlePeerId} />
      <button onClick={handleCall}>Call</button>
    </>
  );
}

export default App;
