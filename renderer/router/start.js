const child_process = require("child_process");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");
const spawn = child_process.spawn;
let ffmpegPath = ffmpeg.path;
ffmpegPath = ffmpegPath.replace("app.asar", "app.asar.unpacked");

global.play = function (rtsp, port, ratio = "1920*1080") {
  let _ratioArr = ratio.split("*");
  if (
    _ratioArr.length &&
    _ratioArr.length === 2 &&
    !isNaN(parseInt(_ratioArr[0])) &&
    !isNaN(parseInt(_ratioArr[0]))
  ) {
  } else {
    ratio = "1920*1080";
  }
  console.log("zkf-play", rtsp, port, ratio);
  if (global.playObject[rtsp]) {
    global.playObject[rtsp].process && global.playObject[rtsp].process.kill();
    global.playObject[rtsp].process = null;
    global.playObject[rtsp].loading = true;
    // 官方建议带上bufsize 增加缓冲区
    const _ffmpeg = spawn(ffmpegPath, [
      `${rtsp.substr(0, 4) !== "rtsp" ? "" : "-rtsp_transport"}`,
      "tcp",
      "-i",
      rtsp,
      "-f",
      "mpegts",
      "-codec:v",
      "mpeg1video",
      "-s",
      ratio,
      // "-vf",
      // "drawgrid=width=100:height=100:thickness=2:color=black@0.9",
      "-b:v",
      "1500k",
      "-bf",
      "0",
      `http://127.0.0.1:${port}/intellifsupervideo`,
    ]);
    global.playObject[rtsp].process = _ffmpeg;
    _ffmpeg.on("exit", (exitCode) => {
      // 如果是意外退出，需要重新启动
      if (global.playObject[rtsp] && global.playObject[rtsp].error) {
        console.log(
          "zkf-意外退出，重启进程",exitCode,
          global.playObject[rtsp],
          global.playObject[rtsp].error
        );
        play(rtsp, port, ratio);
      } else {
        console.log("zkf-主动退出（客户端长期未请求或者通过调用停止接口）",exitCode);
      }
    });
    _ffmpeg.stdout.on("data", (data) => {
      // console.log("zkf-stdout", data.toString());
    });
    _ffmpeg.stderr.on("data", (data) => {
      // 记录最新的拉流信息
      global.playObject[rtsp].message = data && data.toString();
      // console.log(
      //   "zkf-bitrate=",
      //   global.playObject[rtsp].message.indexOf("bitrate=")
      // );
      // 监听拉流状态改变loading值
      global.playObject[rtsp].loading =
        global.playObject[rtsp].message.indexOf("bitrate=") === -1;
    });
    // _ffmpeg.on("disconnect", (res) => {
    //   console.log('zkf-disconnect', res);
    // });
    // _ffmpeg.on("error", (res) => {
    //   console.log('zkf-error', res);
    // });
    // _ffmpeg.on("close", (res) => {
    //   console.log('zkf-close', res, global.playObject[rtsp]);
    // });
    // _ffmpeg.on("message", (res) => {
    //   console.log('zkf-message', res);
    // });
    return _ffmpeg;
  }
  return null;
};

module.exports = function startRouter(req, res) {
  try {
    const { rtsp } = req.query;
    console.log("zkf-query", req.query);
    if (!rtsp) {
      res.send({
        status: 400,
        data: null,
        msg: "缺少rtsp参数",
      });
      return;
    }
    
    if (!global.playObject[rtsp]) {
      res.send({
        status: 400,
        data: null,
        msg: "未分配端口的rtsp",
      });
      return;
    }
    if (global.playObject[rtsp].status) {
      // 如果进程已经退出 对象仍然存在，属于异常情况，此时先拉起进程再说
      global.playObject[rtsp].process.kill();
      global.playObject[rtsp].loading = true;
      global.playObject[rtsp].message = "";
      global.play(
        rtsp,
        global.playObject[rtsp].port,
        global.playObject[rtsp].ratio
      );
      res.send({
        status: 200,
        data: null,
        msg: `start success`,
      });
      return;
    }

    global.playObject[rtsp].process && global.playObject[rtsp].process.kill();
    // './ffmpeg/bin/ffmpeg -rtsp_transport tcp -i rtsp://admin:ytlf1234@192.168.31.65 -f mpegts -codec:v mpeg1video -s 1920*1080 -b:v 1000k -bf 0 http://127.0.0.1:38081/intellifsupervideo';

    // 官方建议带上bufsize 增加缓冲区
    const _ffmpeg = play(
      rtsp,
      global.playObject[rtsp].port,
      global.playObject[rtsp].ratio
    );
    // setTimeout(function () {
    //   // 150秒后取流信息里没有bitrate，代表拉流失败，rtsp地址检查是否正确或者可被访问
    //   if (global.playObject[rtsp].message.indexOf("bitrate=") === -1) {
    //     global.playObject[rtsp].process &&
    //       global.playObject[rtsp].process.kill();
    //     global.playObject[rtsp].error = true;
    //     global.playObject[rtsp].loading = false;
    //   }
    // }, 150000);
    // 更新全局变量管理播放列表
    global.playObject[rtsp] = {
      ...global.playObject[rtsp],
      rtsp,
      status: true,
      time: new Date().getTime(),
      process: _ffmpeg,
    };

    // _ffmpeg.on("exit", (exitCode) => {
    // global.playObject[rtsp] && play(rtsp, global.playObject[rtsp].port);
    // if (global.playObject[rtsp]) {
    //   // 如果是意外退出，需要重新启动
    //   console.log("zkf-exit", exitCode, global.playObject[rtsp]);
    //   global.playObject[rtsp].process &&
    //     global.playObject[rtsp].process.kill();
    //   global.playObject[rtsp].process = null;
    //   setTimeout(function () {
    //     const _ffmpeg = play(rtsp, global.playObject[rtsp].port);
    //     global.playObject[rtsp].process = _ffmpeg;
    //   }, 1000);
    // }
    // });

    res.send({
      status: 200,
      data: null,
      msg: `start success`,
    });
  } catch (error) {
    res.send({
      status: 200,
      data: null,
      msg: error.message,
    });
  }
};

function destroyRtsp(rtsp) {
  if (global.playObject[rtsp]) {
    global.playObject[rtsp].process && global.playObject[rtsp].process.kill();
    delete global.playObject[rtsp];
  }
}
