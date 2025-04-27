import { setupWebViewJavascriptBridge } from '@/utils/common';
import { Toast } from 'antd-mobile';

export const gt = (lowestVersion: string = '3.1.0', skip?: boolean) => {
  return new Promise<string>((resolve, reject) => {
    // resolve('3.2.0');
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'app_version' },
        function (response: any) {
          let res = JSON.parse(response);
          if (res && res.data) {
            resolve(res.data.app_version);
            return;
          }
          reject('');
        },
      );
    });
  }).then((v) => {
    console.log(`current version: ${v}, lowest version: ${lowestVersion}.`);
    if (v > lowestVersion) {
      return;
    } else {
      if (!skip)
        Toast.show({
          content:
            '現在のAPPバージョンはこの機能をサポートしていません。APPをアップデートしてください。',
          position: 'top',
        });
      throw new Error(`app version lower then ${lowestVersion}`);
    }
  });
};
