const startStream = require("./websocket-relay.js");
const express = require("express");
const path = require("path");
const createError = require("http-errors");
const checkRouter = require("./router/check");
const startRouter = require("./router/start");
const stopRouter = require("./router/stop");
const videoAnalysis = require("./router/video_analysis");

const app = express();
const server = app.listen(37654, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log("app listening at http://%s:%s", host, port);
});

global.portList = [38081, 38083, 38085, 38087];
global.playObject = {};

global.portList.map(port => {
  startStream("intellifsupervideo", port, port + 1, false);
})

setInterval(function () {
  Object.values(playObject).map((item) => {
    const currentTime = new Date().getTime();
    if (item && currentTime - item.time > 15 * 1000) {
      item.process && item.process.kill();
      console.log('zkf', currentTime, item.time);
      delete playObject[item.rtsp];
      return null;
    }else if(!item.process.killed && item.process.exitCode){
      console.log('zkf-前端持续请求，但进程被终止了');
      global.play(item.rtsp, item.port);
    }
    return item;
  });
}, 5000);

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.get("/localstream/video_analysis", videoAnalysis);
app.get("/localstream/check", checkRouter);
app.get("/localstream/start", startRouter);
app.get("/localstream/stop", stopRouter);
app.get("/localstream/status", (req, res) => {
  const { rtsp } = req.query;
  if (!rtsp) {
    res.send({
      status: 400,
      data: null,
      msg: "缺少rtsp参数",
    });
  } else {
    // 更新时间 代表客户端仍然在播放
    if (global.playObject[rtsp]) {
      global.playObject[rtsp] = {
        ...global.playObject[rtsp],
        time: new Date().getTime(),
      };
    }
    res.send({
      status: 200,
      data: global.playObject[rtsp]
        ? { ...global.playObject[rtsp], process: null }
        : null,
      msg: "success.",
    });
  }
});

app.use(express.static(path.join(__dirname, ".")));

app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(path.join(__dirname, ""));
});

//传入请求HttpRequest
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  );
}
