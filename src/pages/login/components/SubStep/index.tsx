import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Form, Button, Toast } from 'antd-mobile';
import { Input as VInput } from 'react-vant';
import styles from '../../index.less';
import phoneBlue from '@/assets/images/login/phone_blue.png';
import checkValid from '@/assets/images/login/check_valid.png';
import { login } from '@/services/login';
import { ErrorShowType } from '@@/plugin-request/request';

type IProps = {
  phone: string;
  smsCode: string;
  onSuccess: (data: any) => void;
  onFailed: () => void;
};

const MAX_COUNT = 5;

const BORDER_COLOR = {
  DEFAULT: '1px solid #2f5597',
  ERROR: '1px solid #f7847b',
  SUCCESS: '1px solid #50d855',
};

const SubStep: React.FC<IProps> = (props) => {
  const { phone, onSuccess, smsCode, onFailed } = props;
  const [inputBorder, setInputBorder] = useState(BORDER_COLOR.DEFAULT);
  const [validate, setValidate] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | undefined | ReactNode>(undefined);
  const formRef = useRef<any>(null);

  const key = useMemo(() => 'sub_max_count_' + phone, [phone]);

  const [maxCount, setMaxCount] = useState<number>(() => {
    const last = localStorage.getItem(key);
    return Number(last) || MAX_COUNT;
  });

  const finish = async ({ code }: any) => {
    try {
      let data = await login(
        { phoneNumber: phone, code: smsCode + code },
        { showType: ErrorShowType.SILENT },
      );

      if (!data || data.showType === ErrorShowType.SILENT) {
        setMsg(
          `入力した番号が異なります。あと${
            maxCount - 1
          }回間違えるとロックします`,
        );
        setInputBorder(BORDER_COLOR.ERROR);
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
        setMsg(
          <p style={{ color: 'red', textAlign: 'center' }}>
            アカウントがロックしました。
            <br />
            再度ログインする場合は、招待者にお問い合わせください。
          </p>,
        );

        setMaxCount(0);
        setInputBorder(BORDER_COLOR.ERROR);
        throw new Error('locked');
      }

      return data;
    } catch (e) {
      console.log('login exception: ', e);
      throw e;
    }
  };

  const updateStorage = (count: number) => {
    localStorage.setItem(key, String(count));
  };

  const onSubmit = async (values: any) => {
    if (maxCount < 1) {
      localStorage.removeItem(key);
      onFailed();
      return;
    }

    setLoading(true);
    try {
      const res = await finish(values);
      onSuccess(res);

      setMaxCount(5);
      localStorage.removeItem(key);
    } catch (e) {
      setMaxCount((v) => {
        updateStorage(v - 1);
        return v - 1;
      });
    } finally {
      setLoading(false);
    }
  };

  const disabled = useMemo(() => maxCount < 1, [maxCount]);
  useEffect(() => {
    if (maxCount < 1) {
      setMsg(
        <p style={{ color: 'red', textAlign: 'center' }}>
          アカウントがロックしました。
          <br />
          再度ログインする場合は、招待者にお問い合わせください。
        </p>,
      );
      setValidate(true);
    }
  }, []);
  return (
    <>
      <div className={styles.codePage}>
        <p>親アカウント電話番号の</p>
        <p>最後の4桁を入力してください</p>
        {/*{maxCount < 5 && maxCount >= 1 && (
          <p style={{ color: 'red' }}>
            あと{maxCount}回間違えると、アカウントはロックします。
          </p>
        )}*/}
        {/*{maxCount < 1 && (
          <p style={{ color: 'red' }}>
            アカウントがロックしました。
            <br />
            再度ログインする場合は、招待者にお問い合わせください。
          </p>
        )}*/}
        <Form
          onFinish={onSubmit}
          ref={formRef}
          footer={
            <Button
              loading={loading}
              disabled={validate === undefined || !validate}
              shape="rounded"
              type="submit"
              block
              color="primary"
              className={`margin-auto width-7 ${styles.submitBtn}`}
            >
              {disabled ? 'ログインへ' : 'アカウント確認へ進む'}
            </Button>
          }
          onValuesChange={() => {
            setMsg(undefined);
            setTimeout(() => {
              if (formRef.current?.getFieldError('code').length > 0) {
                setInputBorder(BORDER_COLOR.ERROR);
                setValidate(false);
              } else {
                setInputBorder(BORDER_COLOR.SUCCESS);
                setValidate(true);
              }
            }, 0);
          }}
        >
          <Form.Item
            name="code"
            rules={
              disabled
                ? []
                : [
                    {
                      required: true,
                      message:
                        '招待者の電話番号の後ろ4桁を正しく入力してください',
                    },
                    {
                      pattern: new RegExp(/^\d{4}\b/),
                      message:
                        '招待者の電話番号の後ろ4桁を正しく入力してください',
                    },
                  ]
            }
            className={styles.codeErr}
          >
            <div className={styles.codeWrapper}>
              <img className={styles.phoneBlue} src={phoneBlue} alt="" />
              <span className={`color-primary ${styles.subLeft}`}>0x0</span>

              <span className={styles.splitLine}>-</span>
              <span className={`color-primary ${styles.subCenter}`}>xxxx</span>
              <span className={styles.splitLine}>-</span>

              <VInput
                type="tel"
                disabled={disabled}
                style={{
                  border: inputBorder,
                  opacity: loading ? '0.6' : '1',
                  background: '#fff',
                }}
                className={styles.subRight}
                suffix={
                  validate && !disabled ? (
                    <img
                      src={checkValid}
                      alt=""
                      className={styles.subInputSuffix}
                    />
                  ) : null
                }
                autoComplete="no"
              />
            </div>
          </Form.Item>
          {msg ? <div className={styles.err}>{msg}</div> : null}
        </Form>
      </div>
    </>
  );
};

export default SubStep;
