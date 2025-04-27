import React, { useEffect, useRef, useState } from 'react';
import {
  connectWebViewJavascriptBridge,
  setupWebViewJavascriptBridge,
} from '@/utils/common';
import styles from '@/pages/call/index.less';
import CountDown from '@/components/countdown';
import { PhoneFill } from 'antd-mobile-icons';
import { Mask, SpinLoading } from 'antd-mobile';
import { debounce, forEach } from 'lodash';
import Peer, { DataConnection, MediaConnection } from 'skyway-js';
import { getMessageList } from '@/services/common';
import { isMobileOnly } from 'react-device-detect';
import { AutoResActionSheet, Reminder } from '@/pages/callSkyway/components';
import { gt } from '@/utils';

const CallSkyway: React.FC = () => {
  const [hasvisitorInfo, setHasVisitorInfo] = useState(false);
  const [autoList, setAutoList] = useState([]);
  const [callIng, setCallIng] = useState(false);
  const [hasLock, setHasLock] = useState('');
  const [temporaryVisitor, setTemporaryVisitor] = useState(false);
  const [visitor, setVisitor] = useState(null);
  const [lockStatus, setLockStatus] = useState(true);
  const [maskVisible, setMaskVisible] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [skywayPeerId, setSkywayPeerId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoVisible, setVideoVisible] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [peer, setPeer] = useState<Peer>();
  const [dataConnection, setDataConnection] = useState<DataConnection>();
  const [mediaConnection, setMediaConnection] = useState<MediaConnection>();
  const steamRef = useRef<MediaStream | void>();
  const resRef = useRef<any>();

  const peerConnect = (mypeer: Peer) => {
    let peerTimer: any;
    peerTimer = setInterval(() => {
      if (mypeer && mypeer.open) {
        clearInterval(peerTimer);
        setMaskVisible(false);
        setPeer(mypeer);
        console.log('peer success');
      }
    }, 1000);
  };
  const toastWarning = (message: string) => {
    console.error(message);
  };

  const getAutoList = async () => {
    let data = (await getMessageList()) || [];
    setAutoList(data);
  };
  const start = () => {
    setMaskVisible(false);
    setCallIng(true);
  };
  const handleEndTalk = (error = '') => {
    if (error != '') {
      toastWarning(error);
    } else {
      console.warn('close by native!');
    }
    closeStream();
    dataConnection?.close(true);
    mediaConnection?.close(true);
    peer?.destroy();
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_endTalk' },
        function () {},
      );
    });
  };

  const closeStream = () => {
    console.warn('=> close steam!');
    let tracks = steamRef.current?.getTracks();
    forEach(tracks, (track: any) => track.stop());
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

  const callAccept = async () => {
    if (peer && peer.open) {
      setMaskVisible(true);
      setCallIng(true);
      const remoteVideo = document.getElementById(
        'remoteVideo',
      ) as HTMLVideoElement;

      let localStream = (steamRef.current = await navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
        })
        .catch(console.error));
      // build mediaConnetion
      const mediaC = peer.call(skywayPeerId, localStream!, {
        videoReceiveEnabled: true,
      });
      setMediaConnection(mediaC);
      mediaC.on('error', (error) => {
        mediaC.close(true);
        dataConnection?.close(true);
        peer.destroy();
        handleEndTalk('mediaConnection error');
      });
      mediaC.on('stream', async (stream: any) => {
        // Render remote stream for caller
        remoteVideo.srcObject = stream;
        remoteVideo.playsInline = true;
        remoteVideo.setAttribute('display', 'block');
        await remoteVideo.play().catch(console.error);
        setTimeout(() => {
          setVideoVisible(true);
        }, 500);

        // build dataConnection
        const dataC = peer.connect(skywayPeerId);
        dataC.once('open', async () => {
          setDataConnection(dataC);
          dataC.send(
            JSON.stringify({
              command: 'talk_start_request',
              from: 'android js',
              user: localStorage.getItem('userId'),
              sessionId: sessionId,
            }),
          );
        });
        // 息屏关闭skyway
        setupWebViewJavascriptBridge(function (bridge) {
          bridge.registerHandler(
            'native_call_js',
            function (data: any, responseCallback: any) {
              let req = JSON.parse(data);
              if (req.function_name === 'call_setSpeaker') {
                forceOpenIfNeed(req.params.speakerOn);
                // set speaker
                setSpeakerOn(req.params.speakerOn);
              }
              if (req.function_name === 'call_endTalk_js') {
                dataC.close(true);
                mediaC.close(true);
                peer?.destroy();
                setupWebViewJavascriptBridge(function (bridge: any) {
                  bridge.callHandler(
                    'js_call_native',
                    { function_name: 'call_endTalk' },
                    function () {},
                  );
                });
                // native端关闭对话
                handleEndTalk();
              }
              let response = { code: 200 };
              responseCallback(response);
            },
          );
        });
        dataC.on('error', (error) => {
          dataC.close(true);
          peer?.destroy();
          handleEndTalk('dataConnection Error');
          console.log('dataC exception: ', error);
        });
        dataC.on('data', (data) => {
          let res = JSON.parse(data);
          if (res.command == 'talk_start_response') {
            setupWebViewJavascriptBridge(function (bridge: any) {
              bridge.callHandler(
                'js_call_native',
                { function_name: 'call_accept' },
                function () {
                  setShowTime(true);
                  setImageUrl('');
                  setMaskVisible(false);
                },
              );
            });
            const unLockElement = document.getElementById('handleUnlock');
            unLockElement!.onclick = () => {
              dataC.send(
                JSON.stringify({
                  command: 'unlock',
                  from: 'android js',
                  sessionId: sessionId,
                }),
              );
            };
            const callKillElement = document.getElementById('handleCallKill');
            callKillElement!.onclick = () => {
              dataC.send(
                JSON.stringify({
                  command: 'talk_end_request',
                  from: 'android js',
                  sessionId: sessionId,
                }),
              );
              setVideoVisible(false);
            };
          } else if (res.command == 'unlock_response') {
            setLockStatus(false);
            setTimeout(() => {
              dataC.send(
                JSON.stringify({
                  command: 'talk_end_request',
                  from: 'android js',
                  sessionId: sessionId,
                }),
              );
              setVideoVisible(false);
            }, 5000);
          } else if (res.command == 'talk_end_response') {
            dataC.close(true);
            mediaC.close(true);
            closeStream();
            peer.destroy();
            setupWebViewJavascriptBridge(function (bridge: any) {
              bridge.callHandler(
                'js_call_native',
                { function_name: 'call_endTalk' },
                function (response: any) {},
              );
            });
          }
        });
        dataC.once('close', () => {
          console.log('dataC closed!');
          mediaC?.close(true);
          closeStream();
          setupWebViewJavascriptBridge(function (bridge: any) {
            bridge.callHandler(
              'js_call_native',
              { function_name: 'call_endTalk' },
              function () {},
            );
          });
        });
      });

      mediaC.once('close', () => {
        // 这句报错 待调试
        // remoteVideo.srcObject.

        (remoteVideo.srcObject as any)
          ?.getTracks()
          .forEach((track: any) => track.stop());
        closeStream();
        remoteVideo.srcObject = null;
        setVideoVisible(false);
        setupWebViewJavascriptBridge(function (bridge: any) {
          bridge.callHandler(
            'js_call_native',
            { function_name: 'call_endTalk' },
            function () {},
          );
        });
      });
      peer.on('error', () => {
        handleEndTalk('init peer failed');
        dataConnection!.close(true);
        mediaC.close(true);
      });
    } else {
      handleEndTalk('failed to connect to skyway');
      dataConnection!.close(true);
      mediaConnection!.close(true);
    }
  };

  const callAutoAnswer = () => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_autoAnswer' },
        function () {},
      );
    });
  };

  const onSelect = (item, dataC, resolve, reject) => {
    let params = {
      command: 'auto_request',
      from: 'android js',
      autoResPattern: item.autoResPattern,
      unLockFlg: item.unLockFlg,
      sessionId: sessionId,
      user: localStorage.getItem('userId'),
    };

    // 大于 3.1.0 执行
    gt('3.1.0', true)
      .then(callAutoAnswer)
      .catch((e) => console.error(e));

    dataC.send(JSON.stringify(params));
    dataC.on('error', (error) => {
      dataC.close(true);
      peer?.destroy();
      handleEndTalk('dataConnection Error');
    });
    dataC.on('close', () => {
      setupWebViewJavascriptBridge(function (bridge: any) {
        bridge.callHandler(
          'js_call_native',
          { function_name: 'call_endTalk' },
          function () {},
        );
      });
    });
    dataC.on('data', (data) => {
      let res = JSON.parse(data);
      if (res.command == 'auto_play_completed') {
        // 小于等于 3.1.0 执行
        gt('3.1.0', true).catch(callAutoAnswer);
        dataC.close(true);
        peer?.destroy();
      }
    });
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
          if (req.function_name === 'call_endTalk_js') {
            dataConnection?.close(true);
            mediaConnection?.close(true);
            peer?.destroy();
            // native端关闭对话
            handleEndTalk();
          }
          let response = { code: 200 };
          responseCallback(response);
        },
      );
    });
    let timer: any;
    timer = setInterval(() => {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler(
          'js_call_native',
          { function_name: 'call_visitorInfo' },
          function (response: any) {
            let res = JSON.parse(response);
            if (res && res.data) {
              clearInterval(timer);
              const mypeer = new Peer({ key: res.data.skywayAPIkey, debug: 3 });
              setPeer(mypeer);
              setSkywayPeerId(res.data.skywayPeerId);
              const { supportUnlock, temporary_visitor_info, visitor_info } =
                res.data;
              setHasLock(supportUnlock);
              setSessionId(res.data.sessionId);
              const visitorInfo = visitor_info ? JSON.parse(visitor_info) : {};
              const { imageUrl } = visitorInfo;
              setTemporaryVisitor(!!temporary_visitor_info);
              setImageUrl(imageUrl);
              setVisitor(visitorInfo);
              peerConnect(mypeer);
            } else {
              console.log('res failed');
            }
          },
        );
      });
    }, 500);

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
        if (req.function_name === 'call_endTalk_js') {
          // native端关闭对话
          handleEndTalk();
        }
      });
    });
  }, []);

  return (
    <>
      <div className={styles.call}>
        {imageUrl != '' && (
          <img
            src={imageUrl}
            style={{ width: '100vw', height: '100vh', objectFit: 'cover' }}
          />
        )}
        {/*{videoVisible && (*/}
        <video
          id={'remoteVideo'}
          poster={''}
          style={{
            width: '100%',
            height: '100%',
            display: `${videoVisible ? 'block' : 'none'}`,
            objectFit: 'cover',
          }}
        ></video>
        {/*)}*/}
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
                <div id={'handleCallKill'}>
                  <section className={styles.refuse}>
                    <i className={styles.refusIcon}></i>
                  </section>
                  <div className={styles.direction}>終話</div>
                </div>
                {lockStatus ? (
                  <div id={'handleUnlock'}>
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
                      if (peer && peer.open) {
                        const dataC = peer.connect(skywayPeerId);
                        resRef.current?.open(autoList, dataC);
                      }
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
export default CallSkyway;
