import { Button } from 'antd-mobile';
import React, { useEffect } from 'react';
import { history } from 'umi';
import styles from './index.less';
import {
  setupWebViewJavascriptBridge,
  connectWebViewJavascriptBridge,
} from '@/utils/common';
import backIcon from '../../assets/images/login/back.png';

const MicroAuth: React.FC = () => {
  useEffect(() => {
    connectWebViewJavascriptBridge(function (bridge) {
      bridge.registerHandler('native_call_js', function (data: any) {
        const res = JSON.parse(data);
        if (res.function_name === 'authorize_check_finished') {
          history.push('/login');
        }
      });
    });
  }, []);

  const authorizeMicro = () => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'authorize_request', params: {} },
        function (response: any) {
          console.log('native authorize_request: ', response);
        },
      );
    });
  };

  return (
    <>
      <div className={styles.page}>
        <div
          className={styles.backIcon}
          onClick={() => history.push('/welcome')}
        >
          <img src={backIcon} alt="" />
        </div>
        <div className={styles.textWrapper}>
          <h1>アプリに必要な権限を許可してください</h1>
          <p>
            インターフォンをご利用いただくためには、次の画面で表示される権限を必ず許可してください。
          </p>
        </div>
        <div className={styles.dooropen} />
        <div className={styles.popup}>
          <Button
            className={styles.button}
            shape="rounded"
            block
            color="primary"
            size="large"
            onClick={() => authorizeMicro()}
          >
            次の画面で許可する
          </Button>
        </div>
      </div>
    </>
  );
};

export default MicroAuth;
