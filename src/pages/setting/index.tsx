import React, { useEffect, useState } from 'react';
import { Divider, Dialog, SpinLoading, Toast } from 'antd-mobile';
import {
  getTimeLineRejectionSetting,
  getVisitorDetail,
  timeLineRejectionSetting,
} from '@/services/setting';

import { history, useParams } from 'umi';
import styles from './index.less';
import { setupWebViewJavascriptBridge } from '@/utils/common';
import icEditUser from '../../assets/images/setting/ic_edit_user.png';
import imBlock from '../../assets/images/setting/im_block.png';
import imHide from '../../assets/images/setting/im_hide.png';
import { Cell, Switch as VSwitch } from 'react-vant';
import { Arrow } from '@react-vant/icons';
import { Wrapper } from '@/layout/wrapper';
import { replace } from 'lodash';
import { DisturbMode } from '@/layout';
import { BaseAvatar } from '@/components/avatar';

const Setting = () => {
  const id = useParams<{ id?: string }>()?.id;
  const phoneNumber = localStorage.getItem('phone') || '';
  const [detail, setDetail] = useState<any>({});
  const [checked, setChecked] = useState(false);
  const [nativeChecked, setNativeChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const isSubAccount = localStorage.getItem('isSubAccount');
  const ua = navigator.userAgent.toLowerCase();
  const isIos = ua.indexOf('iphone') != -1 || ua.indexOf('ipad') != -1;
  const setRejection = async (checked: boolean) => {
    let data = await timeLineRejectionSetting(checked + '');
    setLoading(false);
    if (data) {
      setChecked(checked);
    }
  };
  const changeRejection = async (checked: boolean) => {
    setLoading(true);
    if (checked) {
      Dialog.show({
        content: '着信拒否の来訪者をタイムラインに表示させますか？',
        closeOnAction: true,
        actions: [
          [
            {
              key: 'cancel',
              text: 'いいえ',
              className: 'bg-gray',
              onClick: async () => {
                setLoading(false);
                return;
              },
            },
            {
              key: 'sure',
              text: 'はい',
              className: 'bg-primary',
              onClick: async () => {
                setRejection(checked);
                return;
              },
            },
          ],
        ],
      });
    } else {
      setRejection(checked);
    }
  };

  const getNative = () => {
    // setNativeChecked(true)
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'call_mode' },
        function (response: any) {
          let res = JSON.parse(response);
          setNativeChecked(res.data.call_mode == 1);
        },
      );
    });
  };
  const nativeAskAgain = (value: boolean) => {
    const handler = Dialog.show({
      content: '通話モード変更のため、アプリを再起動します。',
      closeOnAction: true,
      actions: [
        [
          {
            key: 'cancel',
            text: 'いいえ',
            className: 'bg-gray',
            onClick: async () => {},
          },
          {
            key: 'sure',
            text: 'はい',
            className: 'bg-primary',
            onClick: async () => {
              changeNative(value);
            },
          },
        ],
      ],
    });
  };
  const changeNative = (value: boolean) => {
    setupWebViewJavascriptBridge(function (bridge) {
      bridge.callHandler(
        'js_call_native',
        {
          function_name: 'call_setCallMode',
          params: { call_mode: value ? 1 : 0 },
        },
        function (response: any) {
          let res = JSON.parse(response);
          if (res.code == 200) {
            setNativeChecked(value);
          } else {
            Toast.show({
              content: '通話モードの切替が失敗しました。再度お試しください。',
              position: 'top',
            });
            setNativeChecked(!value);
          }
        },
      );
    });
  };

  const jump = () => {
    localStorage.setItem('rejectLoacaion', 'setting');
    history.push('/visitor/reject');
  };

  const jumpSecondaryAccount = () => {
    localStorage.setItem('rejectLoacaion', 'setting');
    history.push('/subAccount');
  };
  const jumpIndoorTerminal = () => {
    localStorage.setItem('rejectLoacaion', 'indoorTerminal');
    history.push('/indoorTerminal');
  };
  const jumpDetail = async () => {
    localStorage.setItem('rejectLoacaion', 'setting');
    let res = await getVisitorDetail();
    if (JSON.stringify(res) == '{}') {
      const handler = Dialog.show({
        title: <div className={styles.tipHeader}>マイページのご利用方法</div>,
        header: (
          <div className="dialogHeaderWrapper">
            <div className="close" onClick={() => handler?.close()} />
          </div>
        ),
        content: (
          <div className={styles.tipContent}>
            <div>来訪者詳細ページから、あなたをカテゴリ</div>
            <div>「あなた」を設定してください。</div>
            <div>来訪者一覧に移動しますか？</div>
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
                // setLoading(false);
                return;
              },
            },
            {
              key: 'sure',
              text: 'はい',
              className: 'bg-primary',
              onClick: async () => {
                history.push('/visitor');
                return;
              },
            },
          ],
        ],
      });
    } else {
      history.push(`/visitor/detail/${res.visitorId}?setting=true`);
    }
  };

  const getStatus = async () => {
    setPageLoading(true);
    try {
      let data = await getTimeLineRejectionSetting();
      setChecked(!!data);
      getNative();
    } finally {
      setPageLoading(false);
    }
  };
  const getDetail = async () => {
    let data = (await getVisitorDetail({ visitorId: id })) || {};
    setDetail(data);
  };

  useEffect(() => {
    getStatus();
    getDetail();
  }, []);

  return (
    <Wrapper
      nav={
        <div className="header">
          <div className={'pt5'}>設定</div>
          <DisturbMode />
        </div>
      }
    >
      <div className={styles.setting}>
        <ul>
          {pageLoading ? (
            <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
          ) : (
            <>
              <li>
                <Cell.Group card>
                  <Cell
                    title={<div>{replace(phoneNumber, /\+81/, '0')}</div>}
                    label={'あなた-マイページ'}
                    icon={
                      <div
                        style={{
                          width: '3.125rem',
                          height: '3.125rem',
                          position: 'relative',
                        }}
                      >
                        <BaseAvatar
                          avatar={detail?.smallImageUrl}
                          color={'orange'}
                          home={<div className={`${styles.homeIcon}`} />}
                        />
                      </div>
                    }
                    onClick={jumpDetail}
                  >
                    <div className={styles.arrow}>
                      <Arrow style={{ width: '1rem', height: '1.5rem' }} />
                    </div>
                  </Cell>
                </Cell.Group>
                {isSubAccount == 'false' && (
                  <>
                    <Cell.Group card title={' '}>
                      <Cell
                        title={<div>子アカウント管理</div>}
                        icon={<img src={icEditUser} />}
                        isLink
                        onClick={jumpSecondaryAccount}
                      />
                    </Cell.Group>
                    <div className={styles.desc}>
                      {/* <div>あなたは親アカウントです。</div> */}
                      <div>子アカウントを４つまで招待することができます。</div>
                    </div>

                    <Divider
                      style={{
                        margin: '0 1.25rem',
                      }}
                    />
                  </>
                )}
                {isSubAccount == 'false' && (
                  <>
                    <Cell.Group card title={' '}>
                      <Cell
                        title={<div>室内端末アカウント管理</div>}
                        icon={<img src={icEditUser} />}
                        isLink
                        onClick={jumpIndoorTerminal}
                      />
                    </Cell.Group>
                    <div className={styles.desc}>
                      {/* <div>あなたは親アカウントです。</div> */}
                      <div>室内端末アカウントを3つまで設定することができます。</div>
                    </div>

                    <Divider
                      style={{
                        margin: '0 1.25rem',
                      }}
                    />
                  </>
                )}
                <Cell.Group title="着信拒否" card>
                  <Cell
                    title={<div style={{ color: '#F55C4F' }}>着信拒否一覧</div>}
                    icon={
                      <div>
                        <img src={imBlock} className={styles.refusePhone} />
                      </div>
                    }
                    isLink
                    onClick={jump}
                  />
                  <Cell
                    title={
                      <div style={{ wordBreak: 'keep-all' }}>
                        タイムラインに表示する
                      </div>
                    }
                    icon={
                      <div>
                        <img src={imHide} className={styles.refusePhone} />
                      </div>
                    }
                  >
                    <div className={styles.switchWrapper}>
                      <VSwitch
                        size={'24px'}
                        checked={checked}
                        onChange={(checked) => {
                          changeRejection(checked);
                        }}
                      />
                    </div>
                  </Cell>
                </Cell.Group>
                {!isIos && (
                  <Cell.Group title="通話設定" card>
                    <Cell
                      title="通話モード"
                      label={
                        nativeChecked ? 'コミュニケーションモード' : '通常'
                      }
                      icon={
                        <div>
                          <img
                            className={styles.phone}
                            src={require('../../assets/images/setting/phone-solid.png')}
                          />
                        </div>
                      }
                    >
                      <div className={styles.switchWrapper}>
                        <VSwitch
                          size={'24px'}
                          checked={nativeChecked}
                          onChange={(checked) => {
                            nativeAskAgain(checked);
                          }}
                        />
                      </div>
                    </Cell>
                  </Cell.Group>
                )}
              </li>
            </>
          )}
        </ul>
      </div>
    </Wrapper>
  );
};

export default Setting;
