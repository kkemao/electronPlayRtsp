
module.exports = function checkRouter(req, res) {
  // 端口分配 初始化播放参数 流程第一步
  const { rtsp, ratio } = req.query;
  if (!rtsp) {
    res.send({
      status: 400,
      data: null,
      msg: "缺少rtsp参数",
    });
    return;
  }
  
  const info = global.playObject[rtsp];
  if (info) {
    info.ratio = ratio;
    res.send({
      status: 200,
      data: { ...info, process: null },
      msg: "check success.",
    });
  } else {
    const usedPorts = Object.values(global.playObject)
      .map((item) => {
        return item && item.port;
      })
      .filter((item) => item !== null);
      console.log('zkf-used', usedPorts);
    let port = global.portList.filter((val) => !usedPorts.includes(val));
    if (port && port[0]) {
      port = port[0];
    } else {
      // 如果端口用光了，取playObject的第一个key 对应的port
      port = Object.values(global.playObject)[0].port
      console.log('zkf-else', port);

      // 并且找到第一个对应的信息做删除
      Object.values(global.playObject).map((item) => {
        if (item && item.port === port) {
          // 删除占用的资源
          const info = global.playObject[item.rtsp];
          info.process && info.process.kill();
          delete global.playObject[item.rtsp];
        }
      });
    }
    
    console.log('zkf-port', port, new Date());
    console.log('zkf-else-rtsp', global.playObject[rtsp], rtsp, port, ratio);
    global.playObject[rtsp] = {
      rtsp,
      port,
      ratio,
      status: false,
      loading: true,
      process: null,
      time: new Date().getTime()
    };

    res.send({
      status: 200,
      data: { ...global.playObject[rtsp] },
      msg: "check success.",
    });
  }
};
