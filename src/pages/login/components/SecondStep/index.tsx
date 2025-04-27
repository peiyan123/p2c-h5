import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Form,
  PasscodeInput,
  NumberKeyboard,
  Dialog,
  Toast,
  Divider,
} from 'antd-mobile';
import styles from '../../index.less';
import infoGray from '@/assets/images/login/info_gray.png';
import infoBlue from '@/assets/images/login/info_blue.png';
import refreshGray from '@/assets/images/login/refresh_gray.png';
import spinner from '@/assets/images/login/spinner.png';
import checkSuccess from '@/assets/images/login/check-success.png';
import comment from '@/assets/images/login/comment-dots-solid.png';
import { checkCode, getCode, login } from '@/services/login';
import { useRequest } from '@@/plugin-request/request';
import CustomPopup from '@/components/popup';
import { replace } from 'lodash';

type IProps = {
  phone: string;
  isSubAccount: boolean;
  onSuccess: (res: any, sms: string) => void;
  onFailed: () => void;
  openUrl: (url: string) => void;
};

const SOFT_BANK = `SoftBank`;
const DOCOMO = `docomo`;
const au = `au`;
const Lt = `楽天モバイル`;

const SecondStep: React.FC<IProps> = (props) => {
  const { phone, isSubAccount, onSuccess, onFailed, openUrl } = props;
  const formRef = useRef<any>(null);
  const [maxCount, setMaxCount] = useState<number>(5);
  const [telVisible, setTelVisible] = useState(false);
  const [smVisible, setSmVisible] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [success, setSuccess] = useState(false);

  const canResend = useMemo(() => {
    return countdown === 60 || countdown === 0;
  }, [countdown]);

  const setTimer = () => {
    if (!canResend) return;

    setCountdown(59);
    const newIntervalId = setInterval(() => {
      setCountdown((pre) => {
        if (pre > 0) {
          return pre - 1;
        } else {
          clearInterval(newIntervalId);
          return 0;
        }
      });
    }, 1000);
  };

  useEffect(() => {
    setTimer();
  }, []);

  const { run } = useRequest(
    async () => {
      try {
        let data = await getCode({ phoneNumber: phone });
        setTimer();
        if (data) {
          formRef.current?.resetFields();
          Dialog.show({
            content: '認証コードを再送信しました',
            closeOnAction: true,
            actions: [
              {
                key: 'sure',
                text: '閉じる',
                className: 'bg-primary',
              },
            ],
          });
        }
      } catch (e) {
        console.error('get sms code exception: ', e);
      }
    },
    { manual: true },
  );

  const handleSend = () => {
    if (!canResend) return;

    const handler: ReturnType<typeof Dialog.show> = Dialog.show({
      header: (
        <div className="dialogHeaderWrapper">
          <img src={comment} className={styles.commentImg} alt={''} />
          <div className="close" onClick={() => handler.close()} />
        </div>
      ),
      content: '認証コードを再送信しますか？',
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
            onClick: run,
          },
        ],
      ],
    });
  };

  const handleLogin = async (phone: string, code: string) => {
    try {
      let data = await login({ phoneNumber: phone, code: code });

      if (!data) {
        throw new Error('failed');
      }

      if (data.error == 'unregistered') {
        Toast.show({
          content:
            '携帯番号と認証コードの認証ができませんでした。携帯番号および認証コードをご確認ください。',
          position: 'top',
          afterClose: onFailed,
        });

        throw new Error('unregistered');
      } else if (data?.locked) {
        throw new Error('locked');
      }

      return data;
    } catch (e) {
      console.log('login exception: ', e);
      throw e;
    }
  };

  const { run: checkHandler, loading: checkLoading } = useRequest(
    async (values: any) => {
      let data = await checkCode({ phoneNumber: phone, code: values.code });
      if (data?.success == 'true') {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(undefined, values.code);
        }, 100);
      } else {
        if (data?.success == 'false') {
          Toast.show({
            content:
              '入力した認証コードが異なります。認証コードを再度入力してください。',
            position: 'top',
          });
        } else if (data?.success == 'overdue') {
          Toast.show({
            content: '認証コードの有効期限が切れました。',
            position: 'top',
          });
        }

        if (maxCount < 1) {
          onFailed();
        } else {
          formRef.current?.resetFields();
        }
      }
    },
    { manual: true },
  );

  const { run: loginHandler, loading: loginLoading } = useRequest(
    async (values: any) => {
      try {
        const res = await handleLogin(phone, values.code);
        setSuccess(true);
        setTimeout(() => {
          onSuccess(res, values.code);
        }, 100);
        setMaxCount(5);
      } catch (e) {
        if (maxCount < 1) {
          onFailed();
        } else {
          formRef.current?.resetFields();
        }
      }
    },
    { manual: true },
  );

  const handleSubmit = async (values: any) => {
    setMaxCount((v) => v - 1);
    if (isSubAccount) {
      await checkHandler(values);
    } else {
      await loginHandler(values);
    }
  };

  const loading = useMemo(() => {
    return loginLoading || checkLoading;
  }, [loginLoading, checkLoading]);

  const kebabPhone = useMemo(() => {
    const temp = replace(phone, '+81', '0');
    const part1 = temp.substring(0, 3);
    const part2 = temp.substring(3, 7);
    const part3 = temp.substring(7);
    return [part1, part2, part3].join('-');
  }, [phone]);

  return (
    <div className={styles.codePage}>
      <p className={styles.f13}>認証コードを {kebabPhone} に送信しました</p>
      <p className={styles.f13}>受信した最新の認証コードを入力してください。</p>
      <Form
        onFinish={handleSubmit}
        ref={formRef}
        footer={
          <div className={styles.passcodeWidth}>
            <div className={styles.flexsb}>
              {success ? (
                <div
                  className={styles.loginSuccess}
                  onClick={() => setSmVisible(true)}
                >
                  <img className={styles.checked} src={checkSuccess} alt="" />
                  認証できました
                </div>
              ) : loading ? (
                <div
                  className={styles.confirm}
                  onClick={() => setSmVisible(true)}
                >
                  <img className={styles.spinner} src={spinner} alt="" />
                  確認中
                </div>
              ) : (
                <div
                  className={styles.confirm}
                  onClick={() => setSmVisible(true)}
                >
                  <img className={styles.loginIcon} src={infoGray} alt="" />
                  {loading ? '確認中' : ''}
                  SMS受信設定を確認
                </div>
              )}
              <div
                className={`${styles.primary} ${styles.f12} ${
                  canResend ? '' : styles.gray
                }`}
                onClick={handleSend}
              >
                <img className={styles.loginIcon} src={refreshGray} alt="" />
                SMSを再送信{countdown > 0 ? `(${countdown})` : ''}
              </div>
            </div>
            <div className={styles.link} onClick={() => setTelVisible(true)}>
              <img className={styles.loginIcon} src={infoBlue} alt="" />
              電話番号も正しくSMS契約にも問題がない場合
            </div>
          </div>
        }
      >
        <Form.Item
          name="code"
          rules={[
            { required: true, message: '認証コードを入力してください' },
            {
              required: false,
              pattern: new RegExp(/^\d{6}\b/),
              message: '正しく入力してください',
            },
          ]}
        >
          <PasscodeInput
            seperated
            plain
            length={6}
            keyboard={<NumberKeyboard />}
            className={styles.passcode}
            onChange={() => formRef.current?.submit()}
          />
        </Form.Item>
      </Form>

      <CustomPopup
        visible={telVisible}
        setVisible={setTelVisible}
        contentSlot={
          <>
            <h2 className="center color-primary">
              電話番号も正しくSMS契約にも 問題がない場合
            </h2>
            <Divider
              style={{
                opacity: '0.5',
                borderWidth: '1px',
                borderColor: `var(--adm-color-primary)`,
              }}
            />
            <p className="pb-10">
              賃貸管理会社に、ご登録いただいた携帯電話番号に誤りがないか、お問い合わせください。
            </p>
          </>
        }
      />

      <CustomPopup
        visible={smVisible}
        setVisible={setSmVisible}
        contentSlot={
          <>
            <h2 className="center color-primary">SMS受信設定を確認する</h2>
            <Divider
              style={{
                opacity: '0.5',
                borderWidth: '1px',
                borderColor: `var(--adm-color-primary)`,
              }}
            />
            <p>
              SMSは海外の番号から送信されます。フィルターの設定にはご注意ください。
            </p>
            <p>
              キャリア毎のSMSの受信設定については、ご契約キャリアまでお問い合わせください。
            </p>
            <h3 className="color-primary">{SOFT_BANK}</h3>
            <ul className="link_list">
              <li
                onClick={() =>
                  openUrl('https://www.softbank.jp/support/faq/view/12342')
                }
              >
                ［iPhone］SMSの受信ができません。対処方法を教えてください。
              </li>
              <li
                onClick={() =>
                  openUrl('https://www.softbank.jp/support/faq/view/25934')
                }
              >
                ［スマートフォン］SMSが送信できません。対処方法を教えてください。
              </li>
            </ul>
            <h3 className="color-primary">{DOCOMO}</h3>
            <ul className="link_list">
              <li
                onClick={() =>
                  openUrl(
                    'https://faq.front.smt.docomo.ne.jp/detail?keyword=%E3%82%B7%E3%83%A7%E3%83%BC%E3%83%88%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%EF%BC%88SMS%EF%BC%89&page=2&faqId=4453',
                  )
                }
              >
                ショートメッセージサービス(SMS)が送信/受信できないのは、どうしてですか？
              </li>
            </ul>
            <h3 className="color-primary">{au}</h3>
            <ul className="link_list">
              <li
                onClick={() =>
                  openUrl(
                    'https://www.au.com/trouble-check/smt/mail/detail2.html',
                  )
                }
              >
                SMS (Cメール) の送受信ができない（スマートフォン・タブレット）
              </li>
            </ul>
            <h3 className="color-primary">{Lt}</h3>
            <ul className="link_list">
              <li
                onClick={() =>
                  openUrl(
                    'https://network.mobile.rakuten.co.jp/faq/detail/00001366/',
                  )
                }
              >
                通話はできるのにSMS送信ができない場合どうしたらいいですか
              </li>
              <li
                onClick={() =>
                  openUrl(
                    'https://network.mobile.rakuten.co.jp/faq/detail/00001362/',
                  )
                }
              >
                各種サービスの利用開始に伴うSMS認証コードが届きません
              </li>
            </ul>
          </>
        }
      />
    </div>
  );
};

export default SecondStep;
