import { NavBar, SpinLoading, Empty, Divider } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { RightOutline } from 'antd-mobile-icons';

const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');
import styles from './index.less';
import { getRejectionList } from '@/services/visitor';
import { Wrapper } from '@/layout/wrapper';

interface Item {
  visitorId: String;
  nickName: String;
  callTime: string;
}

const Reject: React.FC = () => {
  const [rejectList, setRejectList] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getReject();
  }, []);
  const back = () => {
    if (localStorage.getItem('rejectLoacaion') == 'setting') {
      history.push('/setting');
    } else {
      history.push('/visitor');
    }
  };
  const getReject = async () => {
    setLoading(true);
    let data = (await getRejectionList()) || [];
    setRejectList(data);
    setLoading(false);
  };

  return (
    <Wrapper
      nav={
        <NavBar back="戻る" onBack={back}>
          着信拒否一覧
        </NavBar>
      }
    >
      {loading ? (
        <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
      ) : rejectList.length ? (
        <div className={styles.recordList}>
          {rejectList.map((item: Item, index) => {
            return (
              <div
                className={styles.record}
                key={index}
                onClick={() =>
                  history.push(`/visitor/detail/${item.visitorId}?reject=true`)
                }
              >
                <img src={require('../../../assets/images/types/type5.png')} />
                <div className={styles.wrapper}>
                  <div className={styles.visitItem}>
                    <div className={styles.callStatus}>
                      {item.nickName || '未登録者'}:
                      {moment(item.callTime).format('YYYY年MM月DD日 HH:mm')}
                    </div>
                    <div className={styles.cellDate}>
                      <RightOutline />
                    </div>
                  </div>
                  {index + 1 < rejectList.length ? (
                    <Divider style={{ margin: 0 }} />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.blackContainer}>
          <Empty
            description="まだ着信拒否された人はいません"
            image={<div className={styles.emptyText}>データがありません</div>}
          />
        </div>
      )}
    </Wrapper>
  );
};

export default Reject;
