import { Checkbox, Button, Divider } from 'antd-mobile';
import React, { useState } from 'react';
import { history } from 'umi';
import styles from './index.less';
import CustomPopup from '../../components/popup';
import { setupWebViewJavascriptBridge } from '@/utils/common';
import shareIcon from '@/assets/images/welcome/share.png';

const VERSION = 3;

const Welcome: React.FC = () => {
  // const [value, setValue] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleText, setVisibleText] = useState(false);
  const [url, setUrl] = useState('');
  const userId = localStorage.getItem('Authorization');
  const origin = window.location.origin;
  console.log('origin: ', origin);

  if (userId && !localStorage.getItem('current')) {
    history.push('/timeline');
    return null;
  } else if (!!localStorage.getItem('current')) {
    history.push('/login');
  }

  const statute = (url?: string) => {
    url && setUrl(url);
    setVisible(true);
  };
  const jumpLogin = () => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'app_version', params: {} },
        function (response: any) {
          console.log('native app_version: ', response);
          const ret = JSON.parse(response);
          const versionArr = ret.data.app_version.split('.');
          if (Number(versionArr[0]) < VERSION) {
            history.push('/login');
          } else {
            bridge.callHandler(
              'js_call_native',
              { function_name: 'authorize_status', params: {} },
              function (response: any) {
                console.log('native authorize_status: ', response);
                const res = JSON.parse(response);
                switch (res.data.status) {
                  case '0':
                    history.push('/microAuth');
                    break;
                  case '1':
                    history.push('/login');
                    break;
                  case '2':
                    history.push('/microAuth');
                    break;
                }
              },
            );
          }
        },
      );
    });
  };

  // const openUrl = (url: string) => {
  //   setupWebViewJavascriptBridge(function (bridge: any) {
  //     bridge.callHandler(
  //       'js_call_native',
  //       { function_name: 'open_url', params: { url } },
  //       function (response: any) {
  //         console.log('native open_url: ', response);
  //       },
  //     );
  //   });
  // };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.dooropen}></div>
        <div className={styles.popup}>
          <h1 className={styles.title}>ようこそ</h1>
          {/* <div>本アプリの利用規約と</div>
          <div className={styles.info}>
            プライパシーポリシーをご確認ください。
          </div> */}

          {/* <div className={styles.terms}>
            <span>株式会社ファイバーゲート</span>
            <div>
              <span
                className={styles.link}
                onClick={() => {
                  openUrl(`${origin}/利用規約.pdf`);
                }}
              >
                利用規約
                <img src={shareIcon} alt="" />
              </span>
              &nbsp;&nbsp;
              <span
                className={styles.link}
                onClick={() => openUrl('https://www.fibergate.co.jp/privacy/')}
              >
                プライバシーポリシー
                <img src={shareIcon} alt="" />
              </span>
            </div>
          </div>

          <div className={styles.terms}>
            <span>株式会社テンフィートライト</span>
            <div>
              <span
                className={styles.link}
                onClick={() => {
                  openUrl(`${origin}/アプリ利用規約.pdf`);
                }}
              >
                アプリ利用規約
                <img src={shareIcon} alt="" />
              </span>
              &nbsp;&nbsp;
              <span
                className={styles.link}
                onClick={() => openUrl('https://www.10fw.co.jp/privacy_01/')}
              >
                プライバシーポリシー
                <img src={shareIcon} alt="" />
              </span>
            </div>
          </div> */}
          <h2
            style={{
              color: 'white',
            }}
          >
            機種変更の場合
          </h2>
          <Divider
            style={{
              opacity: '0.5',
              borderWidth: '1px',
              margin: '0',
              borderColor: `var(--adm-color-primary)`,
            }}
          ></Divider>
          <p style={{ padding: '0 15px' }}>
            機種変更後のスマートフォンアプリをご利用いただく場合、以前認証時にご入力いただいた電話番号をアプリ起動後に表示される「ご利用携帯番号」に入力し、前回認証時と同じく認証を完了いただければ再度アプリをご利用いただけます。
          </p>
          <h2
            style={{
              color: 'white',
            }}
          >
            電話番号変更があった場合
          </h2>
          <Divider
            style={{
              opacity: '0.5',
              margin: '0',
              borderWidth: '1px',
              borderColor: `var(--adm-color-primary)`,
            }}
          ></Divider>
          <p style={{ padding: '0 15px' }}>
            賃貸管理会社に新しい電話番号をお知らせください。新しい電話番号が登録され次第、アプリを再度ご利用いただけます。
          </p>
          {/* <Checkbox
            className={styles.checkbox}
            onChange={(value: boolean) => {
              setValue(value);
            }}
          >
            利用規約とプライバシーポリシーに同意します
          </Checkbox> */}
          <Button
            className={styles.button}
            shape="rounded"
            block
            color="primary"
            size="large"
            onClick={() => jumpLogin()}
          >
            はじめる
          </Button>
          <br />
          {/*   <p
            className={styles['text-white']}
            style={{
              textAlign: 'center',
              textDecoration: 'underline',
            }}
            onClick={() => setVisibleText(true)}
          >
            機種変更された方はこちら
          </p> */}
        </div>
        <CustomPopup visible={visible} setVisible={setVisible} url={url} />

        <CustomPopup
          visible={visibleText}
          setVisible={setVisibleText}
          contentSlot={
            <>
              <h3 className="center color-primary">
                BrainMon対応物件にご入居の方
              </h3>
              <h2 className="font-wight-bold center color-primary">
                機種変更の場合
              </h2>
              <Divider
                style={{
                  opacity: '0.5',
                  borderWidth: '1px',
                  borderColor: `var(--adm-color-primary)`,
                }}
              ></Divider>
              <p>
                機種変更後のスマートフォンアプリをご利用いただく場合、以前認証時にご入力いただいた電話番号をアプリ起動後に表示される「ご利用携帯番号」に入力し、前回認証時と同じく認証を完了いただければ再度アプリをご利用いただけます。
              </p>
              <h2 className="color-primary">電話番号変更があった場合</h2>
              <p>
                賃貸管理会社に新しい電話番号をお知らせください。新しい電話番号が登録され次第、アプリを再度ご利用いただけます。
              </p>
            </>
          }
        />
      </div>
    </>
  );
};

export default Welcome;
