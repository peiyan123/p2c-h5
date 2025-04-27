import React, { useEffect, useState } from 'react';
import { Ellipsis, Empty, NavBar, SpinLoading } from 'antd-mobile';
import { history } from 'umi';
import styles from './index.less';
import { getAutoMessageList } from '@/services/other';
import refuseIcon from '@/assets/images/other/op_new.png';
import { Wrapper } from '@/layout/wrapper';

interface ItemType {
  autoResPattern: string;
  smallImageUrl: string;
  message: string;
}

const AutoMessage: React.FC = () => {
  const [automessage, setAutoMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const back = () => {
    history.push('/other');
  };

  const getAuto = async () => {
    setLoading(true);
    let data = (await getAutoMessageList()) || [];
    setAutoMessage(data);
    setLoading(false);
  };

  useEffect(() => {
    getAuto();
  }, []);
  return (
    <Wrapper
      nav={
        <NavBar back="戻る" onBack={back}>
          自動応答一覧
        </NavBar>
      }
    >
      <div className={styles.message}>
        <div className={`${styles.content}`}>
          <span className={styles.title}>
            あらかじめ来訪者ごとに設定できる対応一覧です。
          </span>
          {loading ? (
            <SpinLoading color="primary" className={styles.loading} />
          ) : (
            <>
              <div className={styles.name}>
                <i className={styles.autoIcon} />
                <span>自動応答</span>
              </div>
              {automessage.length ? (
                <ul className={`${styles.autoAnswer}`}>
                  {automessage.map((item: ItemType) => {
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
            <span>着信拒否</span>
            {/* <div style={{ textAlign: 'left', marginTop: '8px' }}>
              <span>来訪者の呼出から30秒後に対応します。</span>
            </div> */}
          </div>
          <ul className={styles.autoAnswer}>
            <li className="flex">
              <div className={styles.picture}>
                <img src={refuseIcon} alt="icon" />
              </div>
              <Ellipsis
                direction="end"
                rows={3}
                content="お呼び出ししましたが、お出になりませんでした。"
              />
            </li>
          </ul>
          {/* <div className={ styles.name }>通話時　開錠ボタン</div>
          <ul className={ styles.autoAnswer}>
            <li className="flex border-radius">
              <img className={ styles.picture } src="" alt="" />
              <span>玄関までお越しいただきお呼び出しください。</span>
            </li>
          </ul> */}
        </div>
      </div>
    </Wrapper>
  );
};

export default AutoMessage;
