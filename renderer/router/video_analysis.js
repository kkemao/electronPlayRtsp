var axios = require('axios');

module.exports = async function videoAnalysis(req, res) {
  const { device_id } = req.query;
  console.log('zkf-query', req.query);
  if (!device_id) {
    res.send({
      status: 400,
      data: null,
      msg: "缺少device_id参数",
    });
    return;
  }
  const _res = await stopAnalysis(device_id);
  console.log('zkf-stop', _res);
  var data = JSON.stringify({
    "video_id": device_id,
    "duration": 180,
    "count_duration": 30
  });
  var config = {
    method: 'post',
    url: 'http://10.101.32.13:8089/video_analysis',
    headers: {
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
    res.send({
      status: 200,
      data: response.data,
      msg: "success.",
    });
  })
  .catch(function (error) {
    console.log(error);
    res.send({
      status: 500,
      data: error,
      msg: "error.",
    });
  });
  
};
module.exports = function stopAnalysis(device_id) {
  return new Promise((resolve, reject)=>{
    var data = JSON.stringify({
      "video_id": device_id,
    });
    var config = {
      method: 'post',
      url: 'http://10.101.32.13:8088/stop_analysis',
      headers: {
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      resolve(response.data);
    })
    .catch(function (error) {
      console.log(error);
      reject(error);
    });
  });
  
};
