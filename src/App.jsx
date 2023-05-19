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
    return () => {
      const startMedia = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);
        myVideoRef.current.srcObject = stream; // Set the srcObject property directly
      };
      const ConnectWithSocketIOServer = () => {
        const eventId = "234";
        const employeeId = "0c7c6d9b78f5411291b4a8536e27d834";
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

        socket.on("get-twilio-token", (data) => {
          console.log("get-twilio-token: ", data);
          const peer = new Peer({ config: data });
          peerRef.current = peer;
          peer.on("open", (id) => {
            console.log("my peer id is: ", id);
            socket.emit("new-call-id", {
              callId: id,
              eventId: "event123233",
              employeeId: "0c7c6d9b78f5411291b4a8536e27d834",
              clientId: "client_id",
            });
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

          peer
            .on("call", (call) => {
              const audio = new Audio("./skype_call.mp3");
              audio.loop = true;
              // audio.play();
              const answer = window.confirm("Answer the call?");
              if (!answer) {
                return call.close();
              }
              call.answer(myStream); // Answer the call with our stream
              call.on("stream", (remoteStream) => {
                console.log("remote is called stream", remoteStream);
                peerVideoRef.current.srcObject = remoteStream;
              });
              console.log("playing audio");
            })
            .catch((error) => {});
          // WebRTCServices.configurePeer(data); // browser
        });
      };
      ConnectWithSocketIOServer();
      startMedia();
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
      <video ref={peerVideoRef} muted autoPlay playsInline />
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
