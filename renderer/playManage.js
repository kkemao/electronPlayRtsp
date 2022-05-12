module.exports = {
    update: (rtsp) => {
        global.playList.findIndex(item => {
            return item.rtsp === rtsp
        })
      },
}