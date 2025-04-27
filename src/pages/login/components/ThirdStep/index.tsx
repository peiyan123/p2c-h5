import React, { useState, useMemo } from 'react';
import { setupWebViewJavascriptBridge } from '@/utils/common';
import styles from './index.less';
import shareIcon from '@/assets/images/welcome/share.png';
import { Checkbox, Button, Divider } from 'antd-mobile';

type IProps = {
  goLastStep: () => void;
};

const ThirdStep: React.FC<IProps> = (props) => {
  const { goLastStep } = props;
  const [value, setValue] = useState(false);
  const [name, setName] = useState(localStorage.getItem('resllerName') || '');
  const [urlConfig, setUrlConfig] = useState({
    privacyPolicyUrl: localStorage.getItem('privacyPolicyUrl') || '',
    utilizeClauseUrl: localStorage.getItem('utilizeClauseUrl') || '',
    adminPrivacyPolicyUrl: localStorage.getItem('admin_privacyPolicyUrl') || '',
    adminUtilizeClauseUrl: localStorage.getItem('admin_utilizeClauseUrl') || '',
  });

  const goNext = () => {
    //
  };

  // getUserInfo();
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
  return (
    <>
      <div className={styles.page}>
        <div className={styles.popup}>
          <div className={styles.info}>
            <div>本アプリの利用規約と</div>
            <div> プライパシーポリシーをご確認ください。</div>
          </div>
          <br />
          <div className={styles.terms}>
            {/* <span>株式会社ファイバーゲート</span> */}
            <span>{name}</span>
            <div>
              <div
                className={styles.link}
                onClick={() => {
                  openUrl(urlConfig.utilizeClauseUrl);
                }}
              >
                利用規約
                <img src={shareIcon} alt="" />
              </div>
              <div
                className={styles.link}
                onClick={() => openUrl(urlConfig.privacyPolicyUrl)}
              >
                プライバシーポリシー
                <img src={shareIcon} alt="" />
              </div>
            </div>
          </div>
          <div className={styles.terms}>
            <span>株式会社テンフィートライト</span>
            <div>
              <div
                className={styles.link}
                onClick={() => {
                  openUrl(urlConfig.adminUtilizeClauseUrl);
                }}
              >
                アプリ利用規約
                <img src={shareIcon} alt="" />
              </div>
              <div
                className={styles.link}
                onClick={() => openUrl(urlConfig.adminPrivacyPolicyUrl)}
              >
                プライバシーポリシー
                <img src={shareIcon} alt="" />
              </div>
            </div>
          </div>
          <Checkbox
            className={styles.checkbox}
            onChange={(value: boolean) => {
              setValue(value);
            }}
          >
            利用規約とプライバシーポリシーに同意します
          </Checkbox>
          <br /> <br />
          <Button
            className={`margin-auto width-7 ${styles.submitBtn}`}
            disabled={!value}
            shape="rounded"
            block
            color="primary"
            size="large"
            onClick={() => goLastStep()}
          >
            次へ
          </Button>
          <br /> <br /> <br />
        </div>
      </div>
    </>
  );
};

export default ThirdStep;
