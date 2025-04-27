import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import styles from './index.less';
import { Divider, Dialog, SpinLoading, Toast } from 'antd-mobile';
import { RightOutline, DeleteOutline } from 'antd-mobile-icons';
import { history } from 'umi';
import CustomPopup from '../../components/popup';
import { getAutores, Logout } from '@/services/other';
import {
  clearLocalStorage,
  setupWebViewJavascriptBridge,
} from '@/utils/common';
import { WarnImg } from '@/components/imgview/img';
import { Wrapper } from '@/layout/wrapper';
import { DisturbMode } from '@/layout';
import primaryShareIcon from '@/assets/images/welcome/primary_share.png';

const Other: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [urlVisible, setUrlVisible] = useState(false);
  // const [isIPhone, setIsIPhone] = useState(/IPhone/i.test(navigator.userAgent))
  const [showAutoRes, setShowAutoRes] = useState(false);

  const origin = window.location.origin;
  useEffect(() => {
    setLoading(true);
    getAutoresBoolean();
  }, []);
  const getAutoresBoolean = async () => {
    try {
      let data = await getAutores();
      setShowAutoRes(data?.showAutoResRejection);
    } finally {
      setLoading(false);
    }
  };
  const loginOutFinished = () => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'LoginOutFinished' },
        function (response: any) {
          console.log('native LoginOutFinished: ', response);
        },
      );
    });
  };

  const LoginOut = () => {
    const handler: ReturnType<typeof Dialog.show> = Dialog.show({
      header: (
        <div className="dialogHeaderWrapper">
          <WarnImg />
          <div className="close" onClick={() => handler.close()} />
        </div>
      ),
      title: (
        <h2 className={styles.dialogTitle}>このアカウントを削除しますか？</h2>
      ),
      content: (
        <div className={styles.dialogContent}>
          <p>賃貸借契約書の期間満了までは</p>
          <p>再度ログインすることが可能です。</p>
          <p>期間満了日にアカウント情報は削除されます。</p>
        </div>
      ),
      closeOnAction: true,
      actions: [
        [
          {
            key: 'cancel',
            text: 'いいえ',
            className: 'bg-gray',
            onClick: async () => {
              return;
            },
          },
          {
            key: 'sure',
            text: 'はい',
            className: 'bg-red',
            onClick: async () => {
              let data = await Logout();
              console.log('logout data: ', data);
              if (data) {
                loginOutFinished();
                Toast.show({
                  content: '正常に終了しました。',
                });
                clearLocalStorage();
                history.push('/welcome');
              }
            },
          },
        ],
      ],
    });
  };

  const statute = (url?: string) => {
    console.log('term url: ', url);
    url && setUrl(url);
    setUrlVisible(true);
  };

  const openUrl = (url: string) => {
    console.log('openUrl: ', url);
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

  return (
    <Wrapper
      nav={
        <div className="header">
          <div className={'pt5'}>その他</div>
          <DisturbMode />
        </div>
      }
    >
      {loading ? (
        <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
      ) : (
        <>
          <div className={styles.other}>
            <div className={`${styles.bgwhite}`}>
              <div
                className={`${styles.flexsb}`}
                onClick={() => history.push('/other/message')}
              >
                <span>メッセージ対応一覧</span>
                <RightOutline />
              </div>

              {showAutoRes && (
                <div onClick={() => history.push('/other/auto')}>
                  <Divider
                    style={{
                      margin: '0',
                    }}
                  />
                  <div className={`${styles.flexsb}`}>
                    <span>自動応答一覧</span>
                    <RightOutline />
                  </div>
                </div>
              )}
            </div>

            <div className={`${styles.bgwhite} mt-10`}>
              <div
                className={`${styles.flexsb} ${styles.link}`}
                onClick={() => {
                  openUrl('https://brainmon.sakura.ne.jp/10fw/');
                }}
              >
                <div className={styles.withIcon}>
                  よくあるご質問
                  <img src={primaryShareIcon} alt="" />
                </div>
              </div>

              <Divider
                style={{
                  margin: '0',
                }}
              />
              {/* 
                <div
                  className={`${styles.flexsb}`}
                  onClick={() => history.push('/other/contact')}
                >
                  <span>不具合報告</span>
                  <RightOutline />
                </div>
              
              <Divider
                style={{
                  margin: '0',
                }}
              />
              */}
              <div
                className={`${styles.flexsb} ${styles.link}`}
                onClick={() => {
                  openUrl(
                    localStorage.getItem('admin_appOperateManualUrl') || '',
                  );
                }}
              >
                <div className={styles.withIcon}>
                  アプリ操作説明書
                  <img src={primaryShareIcon} alt="" />
                </div>
              </div>

              <Divider
                style={{
                  margin: '0',
                }}
              />

              <div
                className={`${styles.flexsb} ${styles.link}`}
                onClick={() => {
                  openUrl(localStorage.getItem('contactUsUrl') || '');
                }}
              >
                <div className={styles.withIcon}>
                  {' '}
                  お問い合わせ <img src={primaryShareIcon} alt="" />
                </div>
              </div>

              <Divider
                style={{
                  margin: '0',
                }}
              />
              <Divider
                style={{
                  margin: '0',
                }}
              />
              <div
                className={`${styles.flexsb}`}
                onClick={() => history.push('/other/about')}
              >
                <span>このアプリについて</span>
                <RightOutline />
              </div>
            </div>

            {/* 株式会社テンフィートライト */}
            <div className={`${styles.bgwhite} mt-10`}>
              <div className={`${styles.termsCell}`}>
                <div className={styles.terms}>
                  <span>{localStorage.getItem('resllerName') || ''}</span>
                  <div>
                    <span
                      className={styles.link}
                      onClick={() => {
                        // openUrl(`${origin}/利用規約.pdf`);
                        openUrl(localStorage.getItem('utilizeClauseUrl') || '');
                      }}
                    >
                      利用規約
                      <img src={primaryShareIcon} alt="" />
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span
                      className={styles.link}
                      onClick={() =>
                        // openUrl('https://www.fibergate.co.jp/privacy/')
                        openUrl(localStorage.getItem('privacyPolicyUrl') || '')
                      }
                    >
                      プライバシーポリシー
                      <img src={primaryShareIcon} alt="" />
                    </span>
                  </div>
                </div>
              </div>
              <Divider
                style={{
                  margin: '0',
                }}
              />
              <div className={`${styles.termsCell}`}>
                <div className={styles.terms}>
                  <span>株式会社テンフィートライト</span>
                  <div>
                    <span
                      className={styles.link}
                      onClick={() => {
                        openUrl(
                          localStorage.getItem('admin_utilizeClauseUrl') || '',
                        );
                      }}
                    >
                      アプリ利用規約
                      <img src={primaryShareIcon} alt="" />
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span
                      className={styles.link}
                      onClick={() =>
                        openUrl(
                          localStorage.getItem('admin_privacyPolicyUrl') || '',
                        )
                      }
                    >
                      プライバシーポリシー
                      <img src={primaryShareIcon} alt="" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/*<div className={`${styles.bgwhite} mt-10`}>
              <div
                className={`${styles.flexsb}`}
                onClick={() => statute(`${origin}/terms-of-use.html`)}
              >
                <span>ご利用規約</span>
                <RightOutline/>
              </div>
            </div>*/}

            <Divider />

            <div className={`${styles.bgwhite} mt-10 color-red`}>
              <div className={`${styles.flexsb}`} onClick={() => LoginOut()}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <DeleteOutline />
                  <span style={{ marginLeft: '.75rem' }}>アカウントを削除</span>
                </div>
                <RightOutline />
              </div>
            </div>
          </div>

          <CustomPopup
            visible={urlVisible}
            setVisible={setUrlVisible}
            url={url}
          />
        </>
      )}
    </Wrapper>
  );
};

export default Other;
