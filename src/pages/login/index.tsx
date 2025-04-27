import React, { useRef, useState, useMemo } from 'react';
import { Button, Toast } from 'antd-mobile';
import FirstStep from './components/FirstStep/index';
import SubStep from './components/SubStep/index';
import SecondStep from './components/SecondStep/index';
import ThirdStep from './components/ThirdStep/index';
import { history } from 'umi';
import { getCode, getInfo } from '@/services/login';
import { pushToken } from '@/services/common';
import styles from './index.less';
import { setupWebViewJavascriptBridge } from '@/utils/common';
import Steps from '@/components/steps';
import backIcon from '../../assets/images/login/back.png';

const Login: React.FC = () => {
  const formRef = useRef<any>(null);
  const [phone, setPhone] = useState('');
  const [current, setCurrent] = useState(
    Number(localStorage.getItem('current')) || 0,
  );
  const [loading, setLoading] = useState(false);
  const [isSubAccount, setIsSubAccount] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  interface phoneType {
    phone: string;
  }

  const loginIn = async () => {
    localStorage.removeItem('current');
    history.push('/timeline');
  };

  const key = useMemo(() => 'sub_max_count_' + phone, [phone]);

  const handleBack = async () => {
    if (current === 0) {
      history.push('/welcome');
    } else {
      const last = localStorage.getItem(key);
      if (Number(last) < 1) {
        localStorage.removeItem(key);
        reload();
        return;
      }
      setCurrent(() => {
        switch (current) {
          case 1:
            return 0;
          case 2:
            return 1;
          default:
            return isSubAccount ? 2 : 1;
        }
      });
    }
  };
  const getUserInfo = async (userId: string) => {
    const res = await getInfo(userId);
    res.forEach((info: Record<string, any>) => {
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'resllerName',
        info.name,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'logo',
        info.logoUrl,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'contactUsUrl',
        info.contactUsUrl,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'utilizeClauseUrl',
        info.utilizeClauseUrl,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'privacyPolicyUrl',
        info.privacyPolicyUrl,
      );
    });
  };
  const loginFinished = (data: any) => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'LoginFinished', params: { ...data } },
        function (response: any) {
          console.log('LoginFinished:', response);
        },
      );
    });
  };

  const openUrl = (url: string) => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'open_url', params: { url } },
        function (response: any) {
          console.log('open_url:', response);
        },
      );
    });
  };

  const getToken = () => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'device_token' },
        async function (response: any) {
          let resDevice = JSON.parse(response);
          const { apnsToken, voipToken, gcmToken } = resDevice.data;
          console.log('device_token: ', resDevice.data);

          if (!gcmToken && !apnsToken) {
            Toast.show({
              content: '認証できませんでした,再度お試しください。',
              position: 'top',
            });
            localStorage.clear();
          } else {
            const pushDatas: any = { apnsToken, voipToken, gcmToken };
            if (resDevice) {
              bridge.callHandler(
                'js_call_native',
                { function_name: 'app_version' },
                function (response: any) {
                  let resApp = JSON.parse(response);
                  const { os_type: osType, app_version: appVersion } =
                    resApp.data;
                  console.log('app_version: ', resApp.data);
                  pushDatas.osType = osType;
                  pushDatas.appVersion = appVersion;

                  bridge.callHandler(
                    'js_call_native',
                    { function_name: 'os_version' },
                    async function (response: any) {
                      let resOs = JSON.parse(response);
                      const { os_version: osVersion } = resOs.data;
                      console.log('os_version: ', resOs.data);

                      let data;
                      try {
                        data = await pushToken({ ...pushDatas, osVersion });
                      } catch (error) {}
                      if (data) {
                        setCurrent(3);
                        localStorage.setItem('current', '3');
                      }
                    },
                  );
                },
              );
            }
          }
        },
      );
    });
  };

  const handleFirst = async (value: phoneType) => {
    const phoneNumber = value.phone.slice(1);
    setPhone(`+81${phoneNumber}`);
    setLoading(true);
    let data = await getCode({ phoneNumber: `+81${phoneNumber}` });
    setLoading(false);
    if (data?.locked) {
      Toast.show({
        content:
          'アカウントはロックされました。ロックを解除してからログインしてください。',
        position: 'top',
        duration: 3000,
      });
    } else if (data?.error == 'unregistered') {
      setCurrent(1);
    } else {
      if (JSON.stringify(data) != '{}') {
        setIsSubAccount(data?.isSubAccount);
        setCurrent(1);
      }
    }
  };

  const reload = () => {
    // window.location.reload();
    setIsSubAccount(false);
    setSmsCode('');
    setPhone('');
    setCurrent(0);
  };

  const onLoginSuccess = (data: any) => {
    const { apiKey, userId, checkinDate, isAutoResRejection } = data;
    loginFinished(data);
    getUserInfo(userId);
    localStorage.setItem('Authorization', apiKey);
    localStorage.setItem('userId', userId);
    localStorage.setItem('phone', phone);
    localStorage.setItem('checkinDate', checkinDate);
    localStorage.setItem('isSubAccount', isSubAccount.toString());
    localStorage.setItem('isAutoResRejection', isAutoResRejection);
    if (!localStorage.getItem('loginDate')) {
      localStorage.setItem('loginDate', new Date() + '');
    }
    getToken();
  };

  const StepEnd = () => {
    return (
      <>
        <div className={styles.codePage}>
          <div className={styles.success} />
        </div>
        <p className={styles.green}>完了</p>
        <p>アプリの設定が完了しました!</p>
        <div className={styles.endFooter}>
          <Button
            shape="rounded"
            color="primary"
            onClick={() => loginIn()}
            block
            className={`margin-auto width-7 ${styles.submitBtn}`}
          >
            アプリをはじめる
          </Button>
        </div>
      </>
    );
  };
  const goLastStep = () => {
    setCurrent(4);
    localStorage.setItem('current', '4');
  };
  const step = useMemo(() => {
    switch (current) {
      case 0:
        return 0;
      case 1:
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return 3;
    }
  }, [current]);
  return (
    <div className={styles.page}>
      <div className={`${styles['header-radius']} ${styles.isPad}`}>
        <div className={styles.stepsWrapper}>
          {current !== 4 && current !== 3 ? (
            <div className={styles.backIcon} onClick={() => handleBack()}>
              <img src={backIcon} alt="" />
            </div>
          ) : null}
          <div className="steps">
            <Steps current={step} />
          </div>
        </div>
        <h1 className={styles.entryTitle}>初期設定</h1>
      </div>
      <div style={{ padding: '1.25rem' }}>
        {current === 0 && (
          <FirstStep
            loading={loading}
            childRef={formRef}
            finish={handleFirst}
          />
        )}
        {current === 1 && (
          <SecondStep
            phone={phone}
            isSubAccount={isSubAccount}
            onSuccess={(res: any, sms: string) => {
              setSmsCode(sms);

              if (isSubAccount) {
                setCurrent(2);
              } else {
                onLoginSuccess(res);
              }
            }}
            onFailed={reload}
            openUrl={openUrl}
          />
        )}
        {current === 2 && (
          <SubStep
            phone={phone}
            smsCode={smsCode}
            onSuccess={onLoginSuccess}
            onFailed={reload}
          />
        )}
        {current === 3 && <ThirdStep goLastStep={goLastStep} />}
        {current === 4 && <StepEnd />}
      </div>
    </div>
  );
};
export default Login;
