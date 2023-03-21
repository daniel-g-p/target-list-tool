let socketInstance;

const websocket = () => {
  if (!socketInstance) {
    socketInstance = io();
  }
  return socketInstance;
};

const listInput = document.querySelector("#list");

listInput.addEventListener("change", (event) => {
  if (event.target.value) {
    const file = event.target.files[0];
    const socket = websocket();
    socket.emit("scan-websites/upload", file);

    console.log("Event sent");

    socket.on("scan-websites/ok/accepted", (payload) => {
      console.log("Scanning " + payload + " websites...");
    });

    socket.on("scan-websites/ok/progress", (payload) => {
      console.log(payload + " websites scanned...");
    });

    socket.on("scan-websites/ok/result", (payload) => {
      console.log(payload);
    });
  }
});
