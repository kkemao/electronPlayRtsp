# electronPlayRtsp
# WEB RTSP播放器

**支持rtsp协议，支持h264，h265编码，最多支持并发4路，自测800万像素的播放没有问题.**

下载安装包安装完成启动即可（安装过程有个开机自启功能，360提示时选择允许即可）。

下列三个接口，均为普通get请求， rtsp地址必须携带:

**业务快速集成** 根据自身业务接口获取到rtsp之后，通过iframe嵌套，赋值src即可
- `<iframe src="http://localhost:37654?rtsp=rtsp://admin:ytlf1234@192.168.31.65"></iframe>`

**播放停止控制**

- `localhost:37654/stop?rtsp=rtsp://admin:ytlf1234@192.168.31.65` - 停止播放.
- `localhost:37654/start?rtsp=rtsp://admin:ytlf1234@192.168.31.65` - 开始播放.
