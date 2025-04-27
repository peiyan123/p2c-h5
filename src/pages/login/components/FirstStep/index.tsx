import React, { useState, useMemo } from 'react';
import { Button, Form } from 'antd-mobile';
import { Input as VInput } from 'react-vant';
import type { InputProps } from 'react-vant';
import styles from '../../index.less';
import mobileNormal from '@/assets/images/login/mobile_normal.png';
import mobileValidate from '@/assets/images/login/mobile_validate.png';
import checkValid from '@/assets/images/login/check_valid.png';

type IProps = {
  loading: boolean;
  childRef: any;
  finish: (value: { phone: string }) => Promise<void>;
};

const TelInput: React.FC<InputProps> = (props) => {
  const phone = useMemo(() => {
    const first = (props.value as string)?.substring(0, 3);
    const second = (props.value as string)?.substring(3, 7);
    const third = (props.value as string)?.substring(7);
    return [first, second, third]
      .filter((item) => item && item !== '')
      .join(' ');
  }, [props.value]);

  return (
    <VInput
      {...props}
      value={phone}
      onChange={(v) => {
        console.info(v);
        props.onChange?.(v.replace(/\s/g, ''));
      }}
    />
  );
};

const FirstStep: React.FC<IProps> = (props) => {
  const [btnDisabled, setBtnDisabled] = useState(true);
  const [inputBorder, setInputBorder] = useState('1px solid #2f5597');
  const [validate, setValidate] = useState(false);

  return (
    <>
      <div className={styles.info}>
        あなたの「携帯電話番号」をご入力してください。
      </div>
      <Form
        onFinish={props.finish}
        ref={props.childRef}
        footer={
          <Button
            disabled={btnDisabled}
            loading={props.loading}
            shape="rounded"
            type="submit"
            block
            color="primary"
            className={`margin-auto width-7 ${styles.submitBtn}`}
          >
            認証コードを送信
          </Button>
        }
        onValuesChange={(changedValues) => {
          setBtnDisabled(
            !/^(81)?\-?0[789](?:\d{9})$/.test(changedValues.phone),
          );
          setTimeout(() => {
            if (props.childRef?.current?.getFieldError('phone').length > 0) {
              setInputBorder('1px solid #f7847b');
              setValidate(false);
            } else {
              setInputBorder('1px solid #50d855');
              setValidate(true);
            }
          }, 0);
        }}
      >
        <Form.Item
          name="phone"
          rules={[
            {
              required: true,
              pattern: new RegExp(/^(81)?\-?0[789](?:\d{9})$/),
              message: '電話番号を正しく入力してください',
            },
          ]}
        >
          <TelInput
            type="tel"
            name={'phone'}
            prefix={
              <img
                src={!validate ? mobileNormal : mobileValidate}
                alt=""
                className={styles.firstPhonePrefix}
              />
            }
            suffix={
              validate ? (
                <img
                  src={checkValid}
                  alt=""
                  className={styles.firstPhoneSuffix}
                />
              ) : null
            }
            maxLength={13}
            disabled={props.loading}
            placeholder="ハイフンなし数字のみ"
            className={styles.firstPhone}
            style={{
              border: inputBorder,
              opacity: props.loading ? '0.6' : '1',
              background: '#fff',
            }}
          />
        </Form.Item>
      </Form>
    </>
  );
};

export default FirstStep;
