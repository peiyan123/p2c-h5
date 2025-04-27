import React, { useEffect, useState } from 'react';
import { Ellipsis, Empty, NavBar, SpinLoading } from 'antd-mobile';
import { history } from 'umi';
import styles from './index.less';
import { getMessageList, roomInfo } from '@/services/other';
import refuseIcon from '@/assets/images/other/op_new.png';
import unlockIcon from '@/assets/images/other/out_new.png';
import { Wrapper } from '@/layout/wrapper';
import { useRequest } from '@@/plugin-request/request';
import { get } from 'lodash';

interface ItemType {
  autoResPattern: string;
  smallImageUrl: string;
  message: string;
}

const Message: React.FC = () => {
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lock, setLock] = useState(false);
  const back = () => {
    history.push('/other');
  };

  const getMessage = async () => {
    setLoading(true);
    let data = (await getMessageList()) || [];
    setMessage(data);
    setLoading(false);
  };

  useRequest(async () => {
    const data = await roomInfo();
    setLock(get(data, 'electronicLockFlag'));
  });

  useEffect(() => {
    getMessage();
  }, []);

  return (
    <Wrapper
      nav={
        <NavBar back="戻る" onBack={back}>
          メッセージ対応一覧
        </NavBar>
      }
    >
      <div className={styles.message}>
        <div className={`${styles.content}`}>
          <span className={styles.title}>着信時に選択できる対応一覧です。</span>
          {loading ? (
            <SpinLoading color="primary" className={styles.loading} />
          ) : (
            <>
              <div className={styles.name}>
                <i className={styles.messageIcon} />
                <span>メッセージ一覧</span>
              </div>
              {message.length ? (
                <ul className={`${styles.autoAnswer}`}>
                  {message.map((item: ItemType) => {
                    return (
                      <li className="flex" key={item.autoResPattern}>
                        <div className={styles.picture}>
                          <img src={item.smallImageUrl} alt="auto" />
                        </div>
                        <Ellipsis
                          direction="end"
                          rows={3}
                          content={item.message}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Empty description="データがありません" />
              )}
            </>
          )}
          <div className={styles.name}>
            <i className={styles.refuse} />
            <span>着信時 拒否ボタン</span>
          </div>
          <div style={{ marginTop: '.5rem' }}>
            拒否ボタンを押してもすぐに対応しません。
            <br />
            来訪者の呼出から30秒後に対応します。
          </div>

          <ul className={styles.autoAnswer}>
            <li className="flex">
              <div className={styles.picture}>
                <img src={refuseIcon} alt="icon" />
              </div>
              <span>お呼び出ししましたが、お出になりませんでした。</span>
            </li>
          </ul>
          <div className={styles.name}>
            <i className={styles.unlock} />
            <span>
              {lock ? '通話時 解錠ボタン' : '通話時 玄関まで来てもらうボタン'}
            </span>
          </div>
          <ul className={styles.autoAnswer}>
            <li className="flex">
              <div className={styles.picture}>
                <img src={unlockIcon} alt="icon" />
              </div>
              <span>玄関までお越しいただきお呼び出しください。</span>
            </li>
          </ul>
        </div>
      </div>
    </Wrapper>
  );
};

export default Message;
