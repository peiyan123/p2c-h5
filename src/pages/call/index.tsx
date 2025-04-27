import React, { useEffect, useRef, useState } from 'react';
import { Mask, SpinLoading } from 'antd-mobile';
import { PhoneFill } from 'antd-mobile-icons';
import { debounce } from 'lodash';
import { getMessageList } from '@/services/common';
import {
  connectWebViewJavascriptBridge,
  setupWebViewJavascriptBridge,
} from '@/utils/common';
import styles from './index.less';
import CountDown from '@/components/countdown';
import { isMobileOnly } from 'react-device-detect';
import { AutoResActionSheet, Reminder } from '@/pages/callSkyway/components';

const Call: React.FC = () => {
  const [autoList, setAutoList] = useState([]);
  const [callIng, setCallIng] = useState(false);
  const [hasLock, setHasLock] = useState('');
  const [temporaryVisitor, setTemporaryVisitor] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [lockStatus, setLockStatus] = useState(true);
  const [maskVisible, setMaskVisible] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const resRef = useRef<any>();

  const getAutoList = async () => {
    let data = (await getMessageList()) || [];
    setAutoList(data);
  };

  const start = () => {
    setMaskVisible(false);
    setShowTime(true);
  };

  const setSpeaker = debounce(() => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_setSpeaker' },
        function (response: any) {
          const res = JSON.parse(response);
          const { data } = res;
          setSpeakerOn(data.speakerOn);
        },
      );
    });
  }, 600);

  const forceOpenIfNeed = (isOpen: boolean) => {
    if (!isMobileOnly && !isOpen) {
      setSpeaker();
    }
  };

  useEffect(() => {
    getAutoList();
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.registerHandler(
        'native_call_js',
        function (data: any, responseCallback: any) {
          let req = JSON.parse(data);
          if (req.function_name === 'call_start') {
            start();
          }
          if (req.function_name === 'call_ready') {
            setMaskVisible(false);
          }
          if (req.function_name === 'call_setSpeaker') {
            forceOpenIfNeed(req.params.speakerOn);
            // set speaker
            setSpeakerOn(req.params.speakerOn);
          }
          var response = { code: 200 };
          responseCallback(response);
        },
      );
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_visitorInfo' },
        function (response: any) {
          let res = JSON.parse(response);
          console.log('native call_visitorInfo: ', res);
          const { supportUnlock, temporary_visitor_info, visitor_info } =
            res.data;
          setHasLock(supportUnlock);
          const visitorInfo = visitor_info ? JSON.parse(visitor_info) : {};
          setTemporaryVisitor(!!temporary_visitor_info);
          setVisitor(visitorInfo);
        },
      );
    });
    connectWebViewJavascriptBridge(function (bridge) {
      bridge.registerHandler('native_call_js', function (data: any) {
        const req = JSON.parse(data);
        if (req.function_name === 'call_start') {
          start();
        }
        if (req.function_name === 'call_ready') {
          setMaskVisible(false);
        }
        if (req.function_name === 'call_setSpeaker') {
          forceOpenIfNeed(req.params.speakerOn);
          // 设置speaker
          setSpeakerOn(req.params.speakerOn);
        }
        // var response = { code: 200 };
        // responseCallback(response);
      });
    });
    if (/Android|webOS|BlackBerry/i.test(navigator.userAgent)) {
      let timer: any;
      timer = setInterval(() => {
        setupWebViewJavascriptBridge(function (bridge: any) {
          bridge.callHandler(
            'js_call_native',
            { function_name: 'call_visitorInfo' },
            function (response: any) {
              let res = JSON.parse(response);
              console.log('native call_visitorInfo:', res);
              if (!res) {
                return;
              }
              clearInterval(timer);
              const { supportUnlock, temporary_visitor_info, visitor_info } =
                res.data;
              setHasLock(supportUnlock);
              const visitorInfo = visitor_info ? JSON.parse(visitor_info) : {};

              setTemporaryVisitor(!!temporary_visitor_info);

              setVisitor(visitorInfo);
            },
          );
        });
      }, 500);
    }
  }, []);

  const callAccept = () => {
    setMaskVisible(true);
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_accept' },
        function () {
          setCallIng(true);
        },
      );
    });
  };
  const callKill = () => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_kill' },
        function () {},
      );
    });
  };
  const unlock = () => {
    if (lockStatus) {
      setupWebViewJavascriptBridge(function (bridge: any) {
        bridge.callHandler(
          'js_call_native',
          { function_name: 'call_unlock' },
          function (response: any) {
            const res = JSON.parse(response);
            if (res.code == 200) {
              setLockStatus(false);
            }
          },
        );
      });
    }
  };
  const callReject = () => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_reject' },
        function () {},
      );
    });
  };

  const onSelect = (item, _, resolve, reject) => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        {
          function_name: 'call_autoAnswer',
          params: {
            autoResPattern: item.autoResPattern,
            message: item.message,
            largeImageUrl: item.largeImageUrl,
            unLockFlg: item.unLockFlg,
          },
        },
        function (response: any) {
          // resolve();
        },
      );
    });
  };

  return (
    <>
      <div className={styles.call}>
        <div className={styles.callContent}>
          <div className={styles.callTime}>
            {showTime ? (
              <CountDown hours={0} minutes={3} />
            ) : (
              <span>&nbsp;</span>
            )}
          </div>

          <div
            className={`${styles.box} flex align-items-center space-between`}
          >
            {callIng ? (
              <>
                <div onClick={() => callKill()}>
                  <section className={styles.refuse}>
                    <i className={styles.refusIcon}></i>
                  </section>
                  <div className={styles.direction}>終話</div>
                </div>
                {lockStatus ? (
                  <div onClick={() => unlock()}>
                    <section className={`${styles.unlock}`}>
                      <i className={styles.unlocKIcon}></i>
                    </section>
                    <div className={styles.direction}>
                      {hasLock == 'true' ? '解錠' : '玄関まで来てもらう'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <section className={`${styles.unlock} ${styles.disabled}`}>
                      <i className={styles.unlocKIcon}></i>
                    </section>
                    <div className={styles.direction}>
                      {hasLock == 'true' ? '解錠' : '玄関まで来てもらう'}
                    </div>
                  </div>
                )}
                {isMobileOnly ? (
                  speakerOn ? (
                    <div onClick={() => setSpeaker()}>
                      <section className={styles.answer}>
                        <i className={styles.callIngIcon}></i>
                      </section>
                      <div className={styles.direction}>スピーカーをオフ</div>
                    </div>
                  ) : (
                    <div onClick={() => setSpeaker()}>
                      <section
                        className={`${styles.answer} ${styles.disabled}`}
                      >
                        <i className={styles.callIngIcon}></i>
                      </section>
                      <div className={styles.direction}>スピーカーをオン</div>
                    </div>
                  )
                ) : null}
              </>
            ) : (
              <>
                <div onClick={() => callReject()}>
                  <section className={styles.refuse}>
                    <i className={styles.icon}></i>
                  </section>
                  拒否
                </div>
                {autoList.length ? (
                  <div
                    onClick={() => {
                      resRef.current?.open(autoList);
                    }}
                  >
                    <i className={styles.autoIcon}></i>
                    <section>メッセージ応答</section>
                  </div>
                ) : (
                  <div>&nbsp;</div>
                )}
                <div onClick={() => callAccept()}>
                  <section className={styles.answer}>
                    <PhoneFill fontSize={30} />
                  </section>
                  通話
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.mask}></div>
      </div>

      <Mask visible={maskVisible}>
        <SpinLoading
          color="primary"
          style={{ margin: '45vh auto', '--size': '50px' }}
        />
      </Mask>

      <AutoResActionSheet ref={resRef} list={autoList} onSelect={onSelect} />
      {visitor || temporaryVisitor ? (
        <Reminder visitor={visitor} temporary={temporaryVisitor} />
      ) : (
        ''
      )}
    </>
  );
};

export default Call;
