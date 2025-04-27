import {
  Button,
  Dialog,
  Divider,
  Ellipsis,
  NavBar,
  SpinLoading,
  Toast,
} from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import styles from './index.less';
import {
  addSubAccount,
  changeStatusSub,
  deleteSub,
  getSubList,
  unlockSubAccount,
} from '@/services/subAccount';
import Item from 'antd-mobile/es/components/dropdown/item';
import { Switch } from 'react-vant';
import { WarnImg } from '@/components/imgview/img';
import { Wrapper } from '@/layout/wrapper';

const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');

interface Item {
  id: string;
  isAutoResRejection: boolean;
  lock: boolean;
  nickName: string;
  phoneNumber: string;
  status: number;
}
const SubAccount: React.FC = () => {
  const [subList, setSubList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    getReject();
  }, []);
  const back = () => {
    if (localStorage.getItem('rejectLoacaion') == 'setting') {
      history.push('/setting');
    } else if (localStorage.getItem('rejectLoacaion') == 'timeline') {
      history.push('/timeline');
    } else {
      history.push('/setting');
    }
  };
  const handleUnlock = async (id: string) => {
    setLoading(true);
    let res = await unlockSubAccount(id);
    getReject();
  };
  const handleDelete = (id: string): void => {
    const handler = Dialog.show({
      header: (
        <div className="dialogHeaderWrapper">
          <WarnImg />
          <div className="close" onClick={() => handler?.close()} />
        </div>
      ),
      content: (
        <div className={styles.tipContent}>
          <div>このアカウントを削除して</div>
          <div>よろしいですか?</div>
        </div>
      ),
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
            className: 'bg-red',
            onClick: async () => {
              setLoading(true);
              let res = await deleteSub(id);
              if (res) {
                Toast.show({
                  content: `アカウントを削除しました。`,
                });
              }
              await getReject();
            },
          },
        ],
      ],
    });
  };

  const getReject = async () => {
    let data = (await getSubList()) || [];
    // set
    for (let i = data.length; i < 4; i++) {
      let newSub = { nickName: '', phoneNumber: '', id: 'new' + i };
      data.push(newSub);
    }
    setSubList(data);
    setLoading(false);
  };

  const changeInput = (index: number, e: any, key: string) => {
    setSubList(() => {
      subList[index][key] = e.target.value;
      return [...subList];
    });
  };

  const handleApply = async (index: number) => {
    setLoading(true);
    const numberRule = new RegExp(/^(0)?\-?0[789](?:\d{9})$/);
    if (subList[index].nickName == '') {
      Toast.show({
        content: `ニックネームを入力してください!`,
      });
      setLoading(false);
    } else if (!numberRule.test(subList[index].phoneNumber)) {
      Toast.show({
        content: `正しい電話番号を入力してください`,
      });
      setLoading(false);
    } else {
      let params = {
        nickName: subList[index].nickName,
        phoneNumber: addPrefix(subList[index].phoneNumber),
      };
      let res = await addSubAccount(params);
      if (res) {
        Toast.show({
          content: `招待メールを送信しました。`,
        });
      }
      await getReject();
    }
  };
  const addPrefix = (phoneNumber: string) => {
    if (phoneNumber.charAt(0) == '0') {
      return `+81${phoneNumber.slice(1)}`;
    } else {
      return phoneNumber;
    }
  };
  return (
    <Wrapper nav={<NavBar back="戻る" onBack={back} />}>
      <div className={styles.refuse}>
        <h2 className="title">室内端末アカウント管理</h2>
        <div className={styles.desc}>
          管理手顺
          <div className={styles.description}>
            <div>・ SMSが受信可能な、スマートフォンであること。</div>
            <div>・ 親アカウントの携帯電話番号下4桁を知っていること。</div>
            <div>&nbsp;&nbsp;（ログインする際に必要になります。）</div>
          </div>
        </div>

        <div className="subAccountList">
          {loading ? (
            <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
          ) : (
            <>
              {subList.map((item: Item, index: number) => {
                return (
                  <div
                    key={item.id}
                    className={styles.subAccountBox}
                    data-id={item.id}
                  >
                    <div className={styles.subAccountInfo}>
                      <div className={styles.subInputBox}>
                        <input
                          type="text"
                          placeholder={'ニックネーム'}
                          onChange={(e: any) =>
                            changeInput(index, e, 'nickName')
                          }
                          value={item.nickName}
                          readOnly={item.id.indexOf('new') == -1}
                          maxLength={30}
                        />
                      </div>
                      {item.id.indexOf('new') == -1 ? (
                        <div className={styles.rightBox}>
                          <div
                            className={styles.status}
                            style={{
                              color: item.lock ? 'red' : 'black',
                              fontWeight: 'bolder',
                            }}
                          >
                            {item.lock ? (
                              <span className={styles.red}>ロック状態</span>
                            ) : item.status == 0 ? (
                              <span className={styles.gray}>未ログイン</span>
                            ) : (
                              <span className={styles.green}>ログイン済</span>
                            )}
                          </div>
                          <div className={styles.buttonBox}>
                            <Button
                              className={`${styles.subButton} bg-red`}
                              onClick={(e: any) => handleDelete(item.id)}
                            >
                              削除
                            </Button>
                            {item.lock && (
                              <Button
                                className={`${styles.subButton} bg-primary`}
                                style={{ width: 'auto' }}
                                onClick={(e: any) => handleUnlock(item.id)}
                              >
                                ロック解除
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.rightBox}>
                          <div className={styles.status}></div>
                          <div className={styles.buttonBox}>
                            <Button
                              className={`${styles.subButton} ${styles.opacityZero}`}
                            >
                              削除
                            </Button>
                            <Button
                              className={`${styles.subButton} bg-primary`}
                              onClick={(e: any) => handleApply(index)}
                            >
                              招待
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default SubAccount;
