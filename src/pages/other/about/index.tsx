import React, { useEffect, useState } from 'react';
import { NavBar, Divider } from 'antd-mobile';
import { history } from 'umi';
import { setupWebViewJavascriptBridge } from '@/utils/common';
import CustomPopup from '@/components/popup';
import license from './license';
import brainmonVer from '@/assets/images/other/brainmon_ver.png';
import { Wrapper } from '@/layout/wrapper';
import styles from './index.less';

const About: React.FC = () => {
  const [version, setVersion] = useState('');
  const [visibleText, setVisibleText] = useState(false);
  const [licenseText, setLicenseText] = useState<JSX.Element>();
  const origin = window.location.origin;
  console.log('origin: ', origin);
  const back = () => {
    history.push('/other');
  };

  const openUrl = (url: string) => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'open_url', params: { url } },
        function (response: any) {
          console.log('native open_url: ', response);
        },
      );
    });
  };
  useEffect(() => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'app_version' },
        function (response: any) {
          console.log('native current_app_version: ', JSON.parse(response));
          let res = JSON.parse(response);
          if (res) {
            setVersion(res.data.app_version);
          }
        },
      );
    });
  }, []);

  return (
    <Wrapper
      nav={
        <NavBar back="戻る" onBack={back}>
          このアプリについて
        </NavBar>
      }
    >
      <div
        id="about"
        style={{
          WebkitOverflowScrolling: 'touch',
          overflow: 'auto',
          height: '100%',
        }}
      >
        <div className={styles.content}>
          {/* <p style={{ margin: 0, padding: 0, textAlign: 'center' }}>
            P2Cインターホン
          </p> */}
          <img src={brainmonVer} alt="" className={styles.logo} />
          <p className={styles.version}>バージョン: {version}</p>
          {/* <p style={{ margin: 0, padding: 0, textAlign: 'center' }}>Ver.{version}</p> */}
          {/* <p
            style={{
              margin: 0,
              padding: 0,
              textAlign: 'center',
              fontSize: '10px',
              color: '#53595C',
            }}
          >
            © TEN FEET WRIGHT INC.
          </p> */}
          <Divider />
          {/* <div style={{ paddingBottom: '30px' }}>
            本アプリには、テンフィートライト以外の第三者が権利を有している次のソフトウエアが含まれています。当該ソフトウエアについては、当該ソフトウアのライセンスが適用されます。ソフトウエアの著作権表示、免責事項または使用許諾条件などについては下記をご確認ください。なお、テンフィートライト以外の第三者による規定のため、一部原文（英文）で掲載しています。使用許諾条件に同意されない場合、本システムを使用することはできません。
          </div> */}
          <div className={styles.brief}>
            <p style={{ margin: 0, padding: 0 }}>
              本アプリには、テンフィートライト以外の第三者が権利を有している次のソフトウエアが含まれています。当該ソフトウエアについては、当該ソフトウエアのライセンスが適用されます。
            </p>
            <p style={{ margin: 0, padding: 0 }}>
              ソフトウエアの著作権表示、免責事項または使用許諾条件などについては下記をご確認ください。なお、テンフィートライト以外の第三者による規定のため、一部原文（英文）で掲載しています。
            </p>
            <p style={{ margin: 0, padding: 0 }}>
              使用許諾条件に同意されない場合、本システムを使用することはできません。
            </p>
          </div>
          <h2>WebVieW</h2>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/react.txt`);
              setVisibleText(true);
              setLicenseText(license.react);
            }}
          >
            React
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/umi.txt`);
              setVisibleText(true);
              setLicenseText(license.umi);
            }}
          >
            Umi
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/ant-design-mobile.txt`);
              setVisibleText(true);
              setLicenseText(license.antDesignMobile);
            }}
          >
            Ant Design Mobile
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/moment-timezone.txt`);
              setVisibleText(true);
              setLicenseText(license.momentTimeZone);
            }}
          >
            Moment TimeZone
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/moment-timezone.txt`);
              setVisibleText(true);
              setLicenseText(license.skywayjs);
            }}
          >
            {/* Skyway JS */}
            SkyWay JavaScript SDK
          </div>
          <h2 className={styles.pdt}>iOS 版</h2>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/skyway-ios-sdk.txt`);
              setVisibleText(true);
              setLicenseText(license.skywayIOSSDK);
            }}
          >
            SkyWay iOS SDK
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/skyway-ios-sdk2.txt`);
              setVisibleText(true);
              setLicenseText(license.skywaySDKIS);
            }}
          >
            SkyWay iOS SDK is built using open source software
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/AFNetworking.txt`);
              setVisibleText(true);
              setLicenseText(license.AFNetworking);
            }}
          >
            AFNetworking
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/fmdb.txt`);
              setVisibleText(true);
              setLicenseText(license.fmdb);
            }}
          >
            fmdb
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/lottie-ios.txt`);
              setVisibleText(true);
              setLicenseText(license.lottieIos);
            }}
          >
            lottie-ios
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/WebViewJavascriptBridge.txt`);
              setVisibleText(true);
              setLicenseText(license.WebViewJavascriptBridge);
            }}
          >
            WebViewJavascriptBridge
          </div>
          <h2 className={styles.pdt}>Android 版</h2>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/skyway-android-sdk.txt`);
              setVisibleText(true);
              setLicenseText(license.skywayAndroidSDK);
            }}
          >
            SkyWay Android SDK
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/skyway-android-sdk2.txt`);
              setVisibleText(true);
              setLicenseText(license.skywaySDKIS);
            }}
          >
            SkyWay Android SDK is built using open source software
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/JsBridge.txt`);
              setVisibleText(true);
              setLicenseText(license.jsbridge);
            }}
          >
            jsbridge
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/retrofit.txt`);
              setVisibleText(true);
              setLicenseText(license.retrofit);
            }}
          >
            retrofit
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/butterknife.txt`);
              setVisibleText(true);
              setLicenseText(license.butterknife);
            }}
          >
            butterknife
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/lottie.txt`);
              setVisibleText(true);
              setLicenseText(license.lottie);
            }}
          >
            lottie
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/glide.txt`);
              setVisibleText(true);
              setLicenseText(license.glide);
            }}
          >
            glide
          </div>
          <div
            className="color-primary lh-30"
            onClick={() => {
              // openUrl(`${origin}/file/firebase.txt`);
              setVisibleText(true);
              setLicenseText(license.firebase);
            }}
          >
            firebase
          </div>
        </div>
        <CustomPopup
          visible={visibleText}
          setVisible={setVisibleText}
          contentSlot={licenseText}
        />
      </div>
    </Wrapper>
  );
};

export default About;
