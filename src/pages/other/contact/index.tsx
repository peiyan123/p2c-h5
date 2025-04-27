import React, { useState, useEffect } from 'react';
import {
  NavBar,
  TextArea,
  Input,
  Checkbox,
  Button,
  ImageUploader,
  Toast,
  Form,
  Divider,
  Badge,
} from 'antd-mobile';
import { history } from 'umi';
import styles from './index.less';
import { Harmony } from '@/services/other';
import { setupWebViewJavascriptBridge } from '@/utils/common';
import { Wrapper } from '@/layout/wrapper';
import primaryShareIcon from '@/assets/images/welcome/primary_share.png';

interface FormDataType {
  mansionName: string;
  roomCode: string;
  phoneNumber: string | number;
  osVersion: string;
  phoneVersion: string;
  phenomenon: string;
  happenDate: string;
  name: string;
  files: Array<any>;
  privacy: string;
}

interface UploadType {
  url: string;
  data: string | null;
}

const Contact: React.FC = () => {
  const [form] = Form.useForm();
  const maxCount = 10;
  const phoneNumber = localStorage.getItem('phone') || '';
  const roomCode = localStorage.getItem('roomCode') || '';
  const mansionName = localStorage.getItem('mansionName') || '';
  const [fileList, setFileList] = useState<UploadType[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [version, setVersion] = useState('');
  const [osInfo, setOsInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgList, setImgList] = useState<any[]>([]);
  const back = () => {
    history.push('/other');
  };
  useEffect(() => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'app_version' },
        function (response: any) {
          let res = JSON.parse(response);
          if (res) {
            setVersion(res.data.app_version);
          }
        },
      );
    });

    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'os_version' },
        function (response: any) {
          let res = JSON.parse(response);
          if (res) {
            let os_version = `${res.data.os_type} ${res.data.os_version}`;
            setOsInfo(os_version);
          }
        },
      );
    });
  }, []);

  const upload = async (file: File) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    let url = URL.createObjectURL(file);
    reader.onload = function () {
      let temp = [...imgList];
      temp.push({
        data: (reader?.result as string).replace(
          /^data:image\/\w+;base64,/,
          '',
        ),
        url: url,
      });
      setImgList(temp);
    };
    return {
      url: url,
      data: reader.result,
    };
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

  const sendEmail = (email: string) => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'send_email', params: { email } },
        function (response: any) {
          console.log('native send_email: ', response);
        },
      );
    });
  };

  const beforeUpload = (files: File[]) => {
    const types = ['image/png', 'image/jpeg', 'image/jpg'];
    return files.filter((file) => {
      if (!types.includes(file.type)) {
        Toast.show(
          'ファイル種別が不正です。PNG または JPEG または JPG 形式の画像を使用してください。',
        );
        return false;
      }
      return true;
    });
  };

  const deleteItem = (item: any) => {
    let data = imgList.filter((file: any) => {
      return file.url !== item.url;
    });
    setImgList(data);
  };

  const submit = async (form: FormDataType) => {
    setLoading(true);
    let imgFiles: any[] = [];
    imgList.map((item: any) => {
      imgFiles.push(item.data);
    });
    let data = await Harmony({
      ...form,
      files: imgFiles,
      mansionName,
      roomCode,
      phoneNumber,
      osVersion: osInfo,
      appVersion: version,
    });
    setLoading(false);
    if (data) {
      Toast.show({
        content: '送信が成功しました!',
      });
      setTimeout(() => {
        back();
      }, 500);
    }
  };

  const changeCheck = (val: boolean): void => {
    setDisabled(val);
  };
  return (
    <Wrapper
      nav={
        <NavBar back="戻る" onBack={back}>
          不具合報告
        </NavBar>
      }
    >
      <div className={styles.contactPage}>
        <div className={styles.contact}>
          <article>
            <section>
              ご利用中に発生しました不具合についてお客様からのご報告を受け付けております。
            </section>
            <section>
              ＊ご報告いただきました不具合については、個別返信は行っておりませんのでご了承ください。
            </section>
            <section>
              ※別途サポートが必要な状況の場合は、株式会社ファイバーゲートサポートアドレス（
              <span
                className="color-primary"
                onClick={() => sendEmail('sct@10fw.co.jp')}
              >
                sct@10fw.co.jp
              </span>
              ）宛にご連絡をお願いいたします。
            </section>
          </article>
          <Divider />
          {/* <section className={styles.PSArea}>
          <span className={styles.colorRed}>必須 </span>
          お手数をおかけしますが、起きている現象について可能な限りご記入をお願いします。
        </section> */}
          <section>
            <Badge content="必須" />
            お手数をおかけしますが、起きている現象について可能な限りご記入をお願いします。
          </section>
          <Form className={styles.form} onFinish={submit} form={form}>
            <Form.Item
              name="phenomenon"
              rules={[
                {
                  required: true,
                  message: '起きている現象についてご記入ください',
                },
              ]}
            >
              <TextArea
                className={`${styles.area}`}
                placeholder="起きている現象についてご記入ください"
                autoSize={{ minRows: 3, maxRows: 5 }}
                showCount
                maxLength={1600}
              />
            </Form.Item>
            <article>
              <section>
                {/* <span className="color-primary">任意 </span> */}
                <Badge color="#A4A7B3" content="任意" />
                現象を確認したおおよその日時がわかれば、ご記入をお願いします。
              </section>
              <section>
                <Form.Item name="happenDate">
                  <Input
                    className={styles.input}
                    type="text"
                    maxLength={50}
                    placeholder="YYYY / MM / DD"
                  />
                </Form.Item>
              </section>
            </article>
            <article>
              <section>
                {/* <span className="color-primary">任意 </span> */}
                <Badge color="#A4A7B3" content="任意" />
                お名前
              </section>
              <section>
                <Form.Item name="name">
                  <Input className={styles.input} type="text" maxLength={50} />
                </Form.Item>
              </section>
            </article>
            <article>
              <section>
                {/* <span className="color-primary">任意 </span> */}
                <Badge color="#A4A7B3" content="任意" />
                不具合が起きている状態のアプリ画面をスクリーンショットで撮影し添付お願いします。
              </section>
              <section>
                <Form.Item>
                  <ImageUploader
                    value={fileList}
                    onChange={setFileList}
                    accept="image/png,image/jpeg,image/jpg"
                    onDelete={(item: any) => deleteItem(item)}
                    upload={(file: File) => upload(file)}
                    multiple={false}
                    capture={false}
                    beforeUpload={beforeUpload}
                    maxCount={maxCount}
                    showUpload={fileList.length < maxCount}
                  />
                </Form.Item>
              </section>
            </article>
            <article>
              <section>
                {/* <span className={styles.colorRed}>必須 </span> */}
                <Badge content="必須" />
                個人情報の取り扱いのご確認
              </section>
              <section className={styles.privacyArea}>
                <Form.Item
                  name="privacy"
                  rules={[{ required: true, message: 'チェックしてください' }]}
                >
                  <Checkbox onChange={changeCheck}></Checkbox>
                </Form.Item>
                <span>
                  「
                  <span
                    onClick={() =>
                      openUrl('https://www.10fw.co.jp/privacy_01/')
                    }
                    className={styles.link}
                  >
                    プライバシーポリシー
                    <img src={primaryShareIcon} alt="" />
                  </span>
                  」に同意します
                </span>
              </section>
            </article>
            <Divider />
            <article className={styles.confirmInfo}>
              入力内容をご確認の上、よろしければ「送信する」ボタンを押してください。
            </article>
            <Button
              type="submit"
              shape="rounded"
              block
              color="primary"
              className="margin-auto width-7"
              disabled={!disabled}
              loading={loading}
            >
              送信する
            </Button>
          </Form>
        </div>
      </div>
    </Wrapper>
  );
};

export default Contact;
