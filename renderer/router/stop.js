
module.exports = function stopRouter(req, res) {
  const { rtsp } = req.query;
  if (!rtsp) {
    res.send({
      status: 400,
      data: null,
      msg: "缺少rtsp参数",
    });
    return;
  }
  if (global.playObject[rtsp]) {
    console.log('zkf-主动删除进程', global.playObject[rtsp].process);
    global.playObject[rtsp].process && global.playObject[rtsp].process.kill();
    delete global.playObject[rtsp];
  }
  res.send({
    status: 200,
    data: null,
    msg: "stop success.",
  });
};
