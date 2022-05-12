function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const params = query.split("&");
  for (let i = 0; i < params.length; i++) {
    const pair = params[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

window.videoport = null;
window.rtspUrl = null;
window.ratio = null;
window.scriptTime = null;
window.intervalTime = 3000;
window.execTime = 10000;
window.streamMsg = '';
window.streamMsgCount = 0;
window.device_id = null;

window.addEventListener("DOMContentLoaded", () => {
  const preStatus = document.getElementById("pre-status");
  const loadStatus = document.getElementsByClassName("start-loading")[0];

  window.buttonClick = function (type) {
    const rtsp = document.getElementById("inputValue").value;
    if (rtsp) {
      window.location.href = `${window.location.origin}?rtsp=${rtsp}`;
    }
  };

  window.rtspUrl = getQueryVariable("rtsp");
  window.ratio = getQueryVariable("ratio");
  window.device_id = getQueryVariable("device_id");
  console.log('zkf-device_id', device_id);
  function getRtsp() {
    if (!device_id) {
      return;
    }
    loadStatus.classList.add("block");
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (this.responseText) {
          const { data } = JSON.parse(this.responseText);
          console.log('zkf-data', data);
          if (data) {
            const output_url = data.output_url;
            getCheck(output_url)
          } else {
            destroyVideo();
          }
        }
      }
    });

    xhr.open(
      "GET",
      `http://${
        window.location.hostname || "localhost"
      }:37654/localstream/video_analysis?device_id=${device_id}`
    );
    xhr.send();
  }
  function getCheck(rtsp) {
    window.rtspUrl = rtsp || getQueryVariable("rtsp");
    if (!rtspUrl) {
      return;
    }
    if (rtspUrl.substr(0, 4) !== "rtsp") {
      alert("仅支持rtsp协议的视频流");
      return;
    }
    loadStatus.classList.add("block");
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (this.responseText) {
          const { data } = JSON.parse(this.responseText);
          videoport = data.port;
          if (data) {
            playControl("start", rtspUrl);
          } else {
            destroyVideo();
          }
        }
      }
    });

    xhr.open(
      "GET",
      `http://${
        window.location.hostname || "localhost"
      }:37654/localstream/check?rtsp=${rtspUrl}&ratio=${ratio}`
    );

    xhr.send();
  }

  function playControl(type, _rtsp) {
    const rtsp = _rtsp;
    if (!rtsp && type === "start") {
      alert("请输入正确的rtsp地址");
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        if (type === "start") {
          render();
        }
      }
    });

    xhr.open(
      "GET",
      `http://${
        window.location.hostname || "localhost"
      }:37654/localstream/${type}?rtsp=${rtsp}`
    );
    xhr.send();
  }

  function getStatus() {
    if (rtspUrl) {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          // 如果上次执行时间大于5s则认为是待机后恢复请求，此时服务端可能已经注销拉流进程，需要刷新页面激活
          if(window.scriptTime && new Date().getTime() - window.scriptTime > execTime){
            window.location.reload();
          }
          // 成功时记录执行时间
          window.scriptTime = new Date().getTime();
          if (this.responseText) {
            const { data } = JSON.parse(this.responseText);
            if (!data) {
              destroyVideo();
              return;
            }
            
            if(data.message && data.message == window.streamMsg){
              window.streamMsgCount+=1;
            }else{
              window.streamMsgCount = 0;
            }
            if(window.streamMsgCount > 5){
              window.location.reload();
            }
            if (data.status && !data.error) {
              preStatus.classList.remove("block");
              loadStatus.classList.remove("block");
            } else if (data.error) {
              destroyVideo("取流异常，请重试。");
              console.log(this.responseText, new Date());
            }
          } else {
            destroyVideo();
          }
        }
      });

      xhr.open(
        "GET",
        `http://${
          window.location.hostname || "localhost"
        }:37654/localstream/status?rtsp=${rtspUrl}`
      );

      xhr.send();
    }
    setTimeout(getStatus, intervalTime);
  }

  function render() {
    if (!window.rtspUrl) {
      return;
    }
    preStatus.classList.remove("block");
    // var canvas = document.getElementById("video-canvas");
    // if (!canvas) {
    console.log("zkf-render");
    canvas = document.createElement("canvas");
    canvas.setAttribute("id", "video-canvas");
    const first = document.body.firstChild; //得到页面的第一个元素
    document.body.insertBefore(canvas, first);
    // }
    var url = `ws://${window.location.hostname || "localhost"}:${
      videoport + 1
    }/`;
    window.jsplayer = new JSMpeg.Player(url, {
      canvas: canvas,
      preserveDrawingBuffer: true,
    });
  }

  function destroyVideo(msg) {
    if (!window.jsplayer) return;
    window.jsplayer && window.jsplayer.destroy();
    window.jsplayer = null;
    rtspUrl = null;
    preStatus.classList.add("block");
    loadStatus.classList.remove("block");
    document.getElementsByClassName("start-title")[0].innerHTML =
      msg || "未推流，请调用start接口启动";
  }

  if(device_id){
    getRtsp()
  }else{
    getCheck();
  }
  getStatus();
});
