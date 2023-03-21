export default (io) => {
  io.listen("websocket/test", async (payload) => {
    console.log("websocket/test");
  });
};
