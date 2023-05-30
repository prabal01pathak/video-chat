import io from "socket.io-client";
import Peer from "peerjs";

let myStream;

const startMedia = async () => {
  if (myStream) return;
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  setMyStream(stream);
  myVideoRef.current.srcObject = stream; // Set the srcObject property directly
};
export default ConnectWithSocketIOServer = () => {
  const eventId = "234";
  const employeeId = "f7a499ae4d55414392e148066639ddf9";
  const socket = io("https://security-mechanics-vmwe4oziqq-du.a.run.app", {
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
  const peer = new Peer("peer");
  console.log("peer: ", peer);
  peerRef.current = peer;
  peer.on("open", (id) => {
    console.log("my peer id is: ", id);
    socket.emit("new-call-id", {
      callId: id,
      eventId: "event123233",
      employeeId: "ced79033b90f4f0495d750ddf29c9cec",
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
      console.log("calling : ", call.peer);
      call.answer(myStream); // Answer the call with our stream
      console.log("my stream: ", myStream);
      call.on("stream", (remoteStream) => {
        console.log("remote is called stream", remoteStream);
        peerVideoRef.current.srcObject = remoteStream;
      });
      console.log("playing audio");
    });
  });
};
