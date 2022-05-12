const WinReg = require('winreg');
const file = process.execPath;
// 设置开机启动
function enableAutoStart(callback) {
    let key = new WinReg({hive: WinReg.HKCU, key: RUN_LOCATION});
    key.set('EUC', WinReg.REG_SZ, file, (err)=> {
        console.log('设置自动启动'+err);
        callback(err);
    });
}
exports.module = {
    enableAutoStart
}