import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  NavBar,
  Popup,
  Dialog,
  SpinLoading,
  Toast,
} from 'antd-mobile';
import { history, useParams } from 'umi';
import styles from '../index.less';
import editStyles from './index.less';
import { WarnImg } from '@/components/imgview/img';
import {
  editVisitor,
  getVisitorDetail,
  getVisitorType,
  uploadAvatars,
} from '@/services/visitor';
import AvatarEditor from 'react-avatar-editor';
import { UserHeader } from '@/pages/visitor/detail/components/header';
import { find, get, map } from 'lodash';
import { handleTypeColor } from '@/utils/common';
import { Wrapper } from '@/layout/wrapper';
import defaultAvatar from '@/assets/images/visitor/avatar_default.png';
import { getExpirDay } from '@/services/timeline';

const Edit: React.FC = () => {
  const [form] = Form.useForm();
  const id = useParams<{ id?: string }>()?.id;
  const [detail, setDetail] = useState<any>({});
  const [type, setType] = useState('その他');
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(false);
  const [typeList, setTypeList] = useState<any>([]);
  const [cropShow, setCropShow] = useState(false);
  const maxSize = 5 * 1024 * 1024;
  const avatarInput: any = useRef();
  const detailDiv: any = useRef();
  const editor: any = useRef();
  const [preImg, setPreImg] = useState(defaultAvatar);
  const [uploadBigImg, setUploadBigImg] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarImg, setAvatarImage] = useState('');
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    getType();

    if (id) {
      setLoading(true);
      getVisitorDetail({ visitorId: id })
        .then((data) => {
          setDetail(data);
          setType(data.type);
          setName(data.nickName);
          setPreImg(data.smallImageUrl);
          form.setFieldsValue({
            nickName: data?.nickName,
            visitorType: data?.type,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const getType = async () => {
    let data = (await getVisitorType()) || [];
    setTypeList(
      map(data, (item) => ({
        text: item.type,
        key: item.id,
        onClick: () => {
          setType(item.type);
          form.setFieldsValue({
            visitorType: item.type,
            visitorTypeId: item.id,
          });
          setVisible(false);
        },
      })),
    );
  };

  const back = () => {
    history.goBack();
  };

  const submited = async (values: {
    nickName: string;
    visitorType: string;
  }) => {
    setLoading(true);
    try {
      let data = await editVisitor({
        vistorId: id,
        ...values,
        visitorTypeId: get(
          find(typeList, (item) => item.text === values.visitorType),
          'key',
        ),
      });

      try {
        console.log('submit, data: ', JSON.stringify(data));

        if (JSON.stringify(data) == '{}') {
          Toast.show({
            content: `変更を承りました。登録失敗時にはお知らせします。`,
          });
          setTimeout(function () {
            history.push(
              `/visitor/detail/${id}?timeline=${detail?.timeline}&reject=${detail?.reject}`,
            );
          }, 500);
        } else {
          Toast.show({
            content: get(data, 'errMsg', ''),
            position: 'top',
            duration: 4000,
          });
        }
      } catch (e) {
        console.error('JSON 解析错误', e);
      }
    } finally {
      setLoading(false);
    }
  };
  const submit = async (values: { nickName: string; visitorType: string }) => {
    //判断是否为过期来访者
    // 只有来访者/居住者变为其他类型才判断
    if (
      ['あなた', '居住者'].includes(detail?.type) &&
      ['家族友人', '配送・デリバリー業者', 'その他'].includes(
        values.visitorType,
      ) &&
      detail?.isExpire
    ) {
      const days = await getExpirDay();
      const dia = Dialog.show({
        header: (
          <div className="dialogHeaderWrapper">
            <WarnImg />
            <div className="close" onClick={() => dia.close()} />
          </div>
        ),
        title: (
          <div className={editStyles.dialogTitle}>
            <span>来訪者一覧から削除して</span>
            <span>よろしいですか？</span>
          </div>
        ),
        content: (
          <div className={editStyles.dialogContent}>
            <span>この来訪者は{days}日以上</span>
            <span>来訪がありません。</span>
            <span>カテゴリを変更すると</span>
            <span>来訪者一覧から削除されます。</span>
          </div>
        ),
        actions: [
          [
            {
              key: 'cancel',
              text: 'いいえ',
              className: 'bg-gray',
              onClick: () => {
                dia.close();
              },
            },
            {
              key: 'sure',
              text: 'はい',
              className: 'bg-red',
              danger: true,
              onClick: () => {
                submited(values);
                dia.close();
              },
            },
          ],
        ],
      });
    } else {
      submited(values);
    }
  };

  const right = (
    <Button
      fill="none"
      onClick={() => form?.submit()}
      style={{ color: '#1677ff' }}
    >
      完了
    </Button>
  );

  const fileToBase64 = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function (e) {
      const fileStr = (e.target?.result as string).replace(
        /^data:image\/\w+;base64,/,
        '',
      );
      setUploadBigImg(fileStr);
    };
  };

  const choseImg = async (file: any) => {
    try {
      const inputFile = file.target.files[0];
      console.log('file type: ', inputFile.type);
      const types = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!types.includes(inputFile.type)) {
        Toast.show(
          'ファイル種別が不正です。PNG または JPEG または JPG 形式の画像を使用してください。',
        );
      } else if (inputFile.size > maxSize) {
        Toast.show('5MB以下の画像を選んでください。');
      } else {
        setAvatarImage(inputFile);
        setCropShow(true);
        fileToBase64(inputFile);
      }
      avatarInput.current.value = null;
    } catch (e) {
      console.log('choose image exception: ', e);
    }
  };

  const confirmImage = () => {
    // const canvas = editor.current.getImage();
    const canvasScaled = editor.current.getImageScaledToCanvas(); // changeCanvasScaled
    const avatarSmall = canvasScaled.toDataURL();

    setPreImg(avatarSmall);
    uploadAvatar(avatarSmall);
    setCropShow(false);
  };

  const uploadAvatar = async (smallBase64: string) => {
    const avatars = {
      picLargeResource: uploadBigImg,
      picSmallResource: smallBase64.replace(/^data:image\/\w+;base64,/, ''),
    };
    setLoading(true);
    let data = await uploadAvatars(avatars).catch((err) => {
      console.log('update user exception: ', err);
      setPreImg(detail.smallImageUrl || defaultAvatar);
    });
    console.log('update res: ', data, Boolean(data), typeof data);
    if (data == '') {
      Toast.show({
        content: `編集画像が成功しました!`,
      });
      setLoading(false);
    } else {
      setPreImg(detail.smallImageUrl || defaultAvatar);
      setLoading(false);
    }
  };

  return (
    <Wrapper
      nav={
        avatarVisible || visible || cropShow ? null : (
          <NavBar back="キャンセル" onBack={back} right={right} />
        )
      }
    >
      {loading ? (
        <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
      ) : null}

      <>
        <div
          className={styles.detail}
          ref={detailDiv}
          style={{ display: loading ? 'none' : undefined }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e: any) => choseImg(e)}
            ref={avatarInput}
            style={{ display: 'none' }}
            multiple={false}
            capture={false}
          />
          {cropShow && (
            <div className={styles.pic}>
              <AvatarEditor
                ref={editor}
                image={avatarImg}
                border={[
                  0,
                  (detailDiv.current.offsetHeight -
                    detailDiv.current.offsetWidth -
                    120) /
                    2,
                ]}
                position={position}
                color={[107, 107, 107, 0.4]} // RGBA
                scale={1} // 图像比例
                rotate={0}
                onPositionChange={(e) => {
                  setPosition(e);
                }}
                style={{ height: '90%', width: '100%', flex: 1 }}
              />
              <div className={styles.buttonBox}>
                <Button onClick={() => setCropShow(false)}>キャンセル</Button>
                <Button onClick={() => confirmImage()}>OK</Button>
              </div>
            </div>
          )}
          <Form onFinish={submit} form={form}>
            <Form.Item name={'visitorType'} hidden>
              <Input />
            </Form.Item>
            <Form.Item name={'visitorTypeId'} hidden>
              <Input />
            </Form.Item>
            <Form.Item name={'nickName'}>
              <UserHeader
                isEdit
                editable={detail?.type === 'あなた'}
                user={{
                  ...detail,
                  nickName: name || detail?.nickName,
                  smallImageUrl: preImg || detail?.smallImageUrl,
                  largeImageUrl: detail?.largeImageUrl || detail?.smallImageUrl,
                }}
                color={handleTypeColor(get(detail, 'type', '') as string)}
                chooseImg={() => {
                  setAvatarVisible(true);
                }}
                bindAccount={detail?.bindAccount}
              />
            </Form.Item>
            <div className={styles.content}>
              <div className={styles.cell}>
                <div className={styles.cellTitle}>カテゴリ</div>
                <div className={styles.information}>
                  <div
                    className="flex space-between align-items-center"
                    onClick={() => {
                      setVisible(true);
                    }}
                  >
                    <img
                      src={require('../../../../assets/images/visitor/tags-solid.png')}
                      className={styles.cellIcon}
                      alt={''}
                    />
                    <ul>
                      <li>{type || 'その他'}</li>
                    </ul>
                    <div className={styles.menuImg}>
                      <img
                        src={require('../../../../assets/images/visitor/list-ul-solid.png')}
                        alt={''}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </div>

        <Popup
          visible={avatarVisible}
          bodyStyle={{ height: '70vh' }}
          className={styles.basePopup}
          onMaskClick={() => setAvatarVisible(false)}
        >
          <div className={styles.baseBody}>
            <div className={`${styles.refusContent}`}>
              <h2
                onClick={() => {
                  if (!cropShow && detail?.type == 'あなた') {
                    avatarInput.current.click();
                    setAvatarVisible(false);
                  }
                }}
              >
                画像変更
              </h2>
            </div>
            <Button
              onClick={() => {
                setAvatarVisible(false);
              }}
              className={styles.cancelButton}
            >
              キャンセル
            </Button>
          </div>
        </Popup>

        <Popup
          visible={visible}
          bodyStyle={{ height: '70vh' }}
          className={styles.basePopup}
          onMaskClick={() => setVisible(false)}
        >
          <div className={styles.baseBody}>
            <div className={`${styles.refusContent}`}>
              {map(typeList, (item) => {
                return (
                  <h2 key={item.key} onClick={item.onClick}>
                    {item.text}
                  </h2>
                );
              })}
            </div>
            <Button
              onClick={() => {
                setVisible(false);
              }}
              className={styles.cancelButton}
            >
              キャンセル
            </Button>
          </div>
        </Popup>

        {/*<ActionSheet*/}
        {/*  visible={visible}*/}
        {/*  actions={typeList}*/}
        {/*  onClose={() => setVisible(false)}*/}
        {/*  cancelText={'キャンセル'}*/}
        {/*/>*/}
      </>
    </Wrapper>
  );
};

export default Edit;
