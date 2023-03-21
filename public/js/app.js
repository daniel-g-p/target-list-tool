let socketInstance;

const websocket = () => {
  if (!socketInstance) {
    socketInstance = io();
  }
  return socketInstance;
};

const modal = document.querySelector("#modal");
const modalText = modal.querySelector("p");
const listInput = document.querySelector("#list");

listInput.addEventListener("change", (event) => {
  if (event.target.value) {
    const file = event.target.files[0];
    const socket = websocket();
    socket.emit("upload-list", file);

    let n = 0;

    socket.on("list-accepted", (payload) => {
      n = payload;
      modal.classList.add("is-active");
      modalText.innerText = "0/" + n + " websites scanned...";
    });

    socket.on("update-progress", (payload) => {
      modalText.innerText = payload + "/" + n + " websites scanned...";
    });

    socket.on("result-ready", (payload) => {
      const downloadButton = document.createElement("a");
      downloadButton.setAttribute("href", "/output/" + payload);
      downloadButton.click();
      modal.classList.remove("is-active");
      modalText.innerText = "";
      socket.removeAllListeners();
    });
  }
});
