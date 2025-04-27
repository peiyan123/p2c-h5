import { history } from 'umi';
import React, { useEffect, useMemo, useState } from 'react';
import { Divider, Empty, NavBar } from 'antd-mobile';
import moment from 'moment-timezone';
import { CallStatus } from '@/utils/common';
import styles from './index.less';
import unknown from '../../../../assets/images/types/typeundefined.png';
import { Wrapper } from '@/layout/wrapper';
moment.tz.setDefault('Asia/Tokyo');

interface Item {
  callTime: number;
  callStatus: string;
}

const TYPES = {
  '0': require('../../../../assets/images/types/type0.png'),
  '1': require('../../../../assets/images/types/type1.png'),
  '2': unknown,
  '3': require('../../../../assets/images/types/type3.png'),
  '4': unknown,
  '5': require('../../../../assets/images/types/type5.png'),
  '6': require('../../../../assets/images/types/type6.png'),
  '7': require('../../../../assets/images/types/type7.png'),
};

const Record: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const detailcallStatus = localStorage.getItem('detailcallStatus');

  const back = () => {
    history.goBack();
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('callStatusList')!);
    const temp: Item[] = [];
    data.map((item: Item) => {
      temp.push({
        callTime: moment(item.callTime).valueOf(),
        callStatus: item.callStatus,
      });
    });
    temp.sort((a: Item, b: Item) => b.callTime - a.callTime);
    setData(temp);
  }, []);

  const isVisit = useMemo(() => {
    return detailcallStatus !== '0';
  }, [detailcallStatus]);

  return (
    <Wrapper
      nav={
        <NavBar back="戻る" onBack={back}>
          {isVisit ? '来訪履歴' : '帰宅履歴'}
        </NavBar>
      }
    >
      <div className={styles.recordList}>
        {data.length ? (
          data.map((item: Item, index) => {
            return (
              <div className={styles.record} key={index}>
                {isVisit ? (
                  <img src={TYPES[item.callStatus] || unknown} />
                ) : (
                  <img
                    src={require('../../../../assets/images/visitor/im_human.png')}
                  />
                )}
                <div className={styles.wrapper}>
                  <div className={styles.visitItem}>
                    {isVisit ? (
                      <>
                        <div className={styles.callStatus}>
                          {CallStatus[item.callStatus]}
                        </div>
                        <div className={styles.cellDate}>
                          {moment(item.callTime).format('YYYY年MM月DD日 HH:mm')}
                        </div>
                      </>
                    ) : (
                      <div className={styles.callStatus}>
                        {moment(item.callTime).format('YYYY年MM月DD日 HH:mm')}
                      </div>
                    )}
                  </div>
                  {index + 1 < data.length ? (
                    <Divider style={{ margin: 0 }} />
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <Empty description="データがありません" />
        )}
      </div>
    </Wrapper>
  );
};

export default Record;
