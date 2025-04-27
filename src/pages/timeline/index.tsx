import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Divider,
  Empty,
  InfiniteScroll,
  PullToRefresh,
  SpinLoading,
} from 'antd-mobile';
import { history } from 'umi';
import { PullStatus } from 'antd-mobile/es/components/pull-to-refresh';
import { setupWebViewJavascriptBridge, utc2jstFormat } from '@/utils/common';
import { getClickTime, timeLine } from '@/services/timeline';
import { getAutoMessageList } from '@/services/common';
import styles from './index.less';
import ImgView from '@/components/imgview';
import { getSubList } from '@/services/subAccount';
import {
  concat,
  filter,
  findIndex,
  first,
  get,
  keys,
  last,
  map,
  slice,
} from 'lodash';
import { Loading } from 'react-vant';
import {
  BaseChangeAutoRes,
  BaseChangeAutoResNot,
  BaseLocked,
  BaseModeNotification,
  BaseNotification,
  FilUpdateVisitorNotification,
  BaseRegisterFace,
  BaseSubAccountInvite,
  BaseTemporaryVisitorLogEntity,
  BaseVisitorLogEntity,
  BaseVisitorLogEntitySimple,
  BaseWelcome,
  FaceRegister,
  TimeLineContext,
} from '@/pages/timeline/components/notification';
import { Wrapper } from '@/layout/wrapper';
import { Logo } from '@/layout';

const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');
moment.suppressDeprecationWarnings = true;

const SIZE = 20;
const LIMIT = 4;

const Timeline: React.FC = () => {
  const [showInfinite, setShowInfinite] = useState(false);
  const [visible, setVisible] = useState(false);
  const [largeImg, setLargeImg] = useState('');
  const [time, setTime] = useState('');
  const refDom = useRef<any>(null);
  const [listData, setListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoList, setAutoList] = useState([]);
  const [autoIdList, setAutoIdList] = useState<any[]>([]);
  const [electronicLockFlag, setElectronicLockFlag] = useState(false);
  const [subNum, setSubNum] = useState(0);
  const userId = localStorage.getItem('userId');
  const isSubAccount = localStorage.getItem('isSubAccount');
  const [roomInfo, setRoom] = useState<any>({});

  const pageRef = useRef<{
    prev: string;
    next: string;
    list: any[];
    map: Record<string, boolean>;
  }>({
    prev: moment(new Date()).subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
    next: moment(new Date()).subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss'),
    list: [],
    map: {},
  });

  useEffect(() => {
    getSubList()
      .then((res) => {
        setSubNum(res?.length);
      })
      .catch();
  }, []);

  let bangs = getComputedStyle(document.documentElement).getPropertyValue(
    '--sat',
  );
  let bangsHeight = bangs ? Number(bangs.split('px')[0]) : 0;

  const checkinDate = localStorage.getItem('checkinDate')
    ? moment(
        Math.min(
          Number(localStorage.getItem('checkinDate')),
          moment(new Date()).subtract(1, 'month').valueOf(),
        ),
      ).format('YYYY-MM-DD HH:mm:ss')
    : null;
  useEffect(() => {
    getAutoList();
    getTimeLine(false).finally(() => {
      setShowInfinite(true);
    });
  }, []);

  const getAutoList = async () => {
    let data = (await getAutoMessageList()) || [];
    console.log('autolist: ', data);
    let temp: any[] = [];
    data.map((item: { autoResPattern: string }) => {
      temp.push(item.autoResPattern);
    });
    setAutoIdList(temp);
    setAutoList(data);
  };

  const showTemp = (item: { largeImageUrl: string; _sort_date: string }) => {
    setVisible(true);
    setLargeImg(item.largeImageUrl);
    setTime(item._sort_date);
  };

  const jumpSubAccount = () => {
    localStorage.setItem('rejectLoacaion', 'timeline');
    history.push('/subAccount');
  };

  const statusRecord: Record<PullStatus, string | ReactNode> = {
    pulling: '指を離して更新',
    canRelease: '指を離して更新',
    refreshing: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Loading className={styles.refreshing} />
        読み込み中
      </div>
    ),
    complete: '',
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

  const clickTime = async (eventId: string) => {
    await getClickTime({ eventId });
  };

  const scrollToBottom = () => {
    if (refDom.current) {
      setTimeout(() => {
        refDom.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 0);
    }
  };

  const getItems = (isDown: boolean) => {
    const current = pageRef.current;

    if (listData.length === 0)
      return slice(current.list, Math.max(current.list.length - SIZE, 0));

    if (isDown) {
      const index = getFirstIndex();
      console.log('first index:', index);
      return slice(current.list, Math.max(0, index - SIZE), index);
    } else {
      const index = getLastIndex();
      console.log('last index:', index);
      return slice(
        current.list,
        index + 1,
        Math.min(current.list.length, index + SIZE + 1),
      );
    }
  };

  const deduplication = (
    map: Record<string, boolean>,
    data: Record<string, any>,
  ) => {
    let roomInfo = undefined;
    const remain = filter(data, (item) => {
      if (item.type === 'roomInfo') {
        roomInfo = item;
        return false;
      }

      if (!map[item._id]) {
        map[item._id] = true;
        return true;
      }
      return false;
    });

    return { remain, roomInfo };
  };

  const updateRoom = (item: any) => {
    setRoom(item);

    setElectronicLockFlag(item.electronicLockFlag);
    localStorage.setItem('electronicLockFlag', item.electronicLockFlag);
    if (!localStorage.getItem('mansionName')) {
      localStorage.setItem('mansionName', item.mansionName);
      localStorage.setItem('roomCode', item.roomCode);
    }
  };

  const getFirstIndex = () => {
    return findIndex(
      pageRef.current.list,
      (item) => item._id === get(first(listData), '_id'),
    );
  };

  const getLastIndex = () => {
    return findIndex(
      pageRef.current.list,
      (item) => item._id === get(last(listData), '_id'),
    );
  };

  const requestLoop = async (isDown: boolean, limit: number = 0) => {
    const current = pageRef.current;

    if (listData.length === 0 && current.list.length >= SIZE) return;

    if (isDown) {
      const index = getFirstIndex();
      console.log('first index:', index);

      // 前面有超过 $SIZE 个
      if (index > -1 && getFirstIndex() > SIZE - 1) {
        return;
      }
    } else {
      const index = getLastIndex();
      console.log('last index:', index);

      // 后面有超过 $SIZE 个
      if (index > -1 && current.list.length - index > SIZE) {
        return;
      }
    }

    const now = moment();

    const time = isDown
      ? {
          from: moment(pageRef.current.prev)
            .subtract(Math.pow(2, limit), 'month')
            .format('YYYY-MM-DD HH:mm:ss'),
          to: pageRef.current.prev,
        }
      : {
          from: moment(pageRef.current.next).format('YYYY-MM-DD HH:mm:ss'),
          to: moment(now).add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        };

    const data = (await timeLine({ from: time.from, to: time.to })) || [];
    const { remain, roomInfo } = deduplication(current.map, data);
    updateRoom(roomInfo);

    if (isDown) {
      pageRef.current = {
        ...pageRef.current,
        prev: time.from,
        list: concat(remain, get(pageRef.current, 'list', [])),
      };

      if (limit < LIMIT) {
        await requestLoop(isDown, ++limit);
      }
    } else {
      pageRef.current = {
        ...pageRef.current,
        next: now.format('YYYY-MM-DD HH:mm:ss'),
        list: concat(get(pageRef.current, 'list', []), remain),
      };

      // if (limit < LIMIT) {
      //   await requestLoop(isDown, ++limit);
      // }
    }

    console.log(
      'ref list length:',
      pageRef.current.list.length,
      'ref map key length:',
      keys(pageRef.current.map).length,
    );
  };

  const cacheRecord = async (isDown: boolean) => {
    await requestLoop(isDown);

    return getItems(isDown);
  };

  const getTimeLine = async (isDown: boolean, bottom = true) => {
    setLoading(true);
    try {
      let data = await cacheRecord(isDown);
      console.log('append data length:', data.length);
      if (isDown) {
        setListData([...data, ...listData]);
      } else {
        setListData([...listData, ...data]);
      }

      if (data.length && bottom) {
        scrollToBottom();
      }
    } finally {
      await new Promise((r) => {
        setTimeout(() => {
          setLoading(false);
          r('');
        }, 300);

        if (!isDown) {
          setupWebViewJavascriptBridge(function (bridge: any) {
            bridge.callHandler(
              'js_call_native',
              { function_name: 'clear_notification' },
              function (response: any) {},
            );
          });
        }
      });
    }
  };

  const loadMore = async () => {
    await getTimeLine(false);
    scrollToBottom();
  };

  const ctx = useMemo(() => {
    return {
      onRefresh: (id: string) => {
        setListData((v) => {
          return map(v, (item) => {
            if (item._id == id)
              return {
                ...item,
                portraitImageUrl: null,
              };
            return item;
          });
        });
      },
    };
  }, []);

  return (
    <Wrapper nav={<Logo refresh={loadMore} />}>
      {loading ? (
        <div className={styles.mask}>
          <SpinLoading color="primary" className={styles.spin} />
        </div>
      ) : null}
      <div className={styles.timePage}>
        <PullToRefresh
          renderText={(status) => {
            return (
              <div className={styles.loadStatus}>{statusRecord[status]}</div>
            );
          }}
          onRefresh={() => getTimeLine(true, false)}
        >
          <div
            className={styles.content}
            style={{
              // minHeight: document.body.clientHeight - 150 + 'px',
              minHeight: bangsHeight
                ? document.body.clientHeight - 130 - bangsHeight + 'px'
                : document.body.clientHeight - 150 + 'px',
            }}
            ref={refDom}
          >
            {roomInfo && (
              <div key={roomInfo.roomCode} className={styles.room}>
                <Divider style={{ margin: 0 }} />
                <div className={styles.note}>
                  {roomInfo.mansionName} {roomInfo.roomCode}
                </div>
                <Divider style={{ marginTop: 0 }} />
              </div>
            )}

            <TimeLineContext.Provider value={ctx}>
              {listData.length > 1 ? (
                listData.map((item: any, index: number) => {
                  return (
                    <div key={item._id}>
                      {listData[index - 1] &&
                      moment(item._sort_date).isSame(
                        moment(listData[index - 1]['_sort_date']),
                        'day',
                      ) ? null : item._sort_date ? (
                        <div className={styles.date}>
                          {moment(item._sort_date).format('MM-DD') ===
                          moment().format('MM-DD') ? (
                            <div className={styles.today}>今日</div>
                          ) : null}
                          {utc2jstFormat(item._sort_date)}
                        </div>
                      ) : null}

                      {item.type === 'failUpdateVisitorType' && (
                        <FilUpdateVisitorNotification item={item} />
                      )}
                      {item.type === 'notification' && (
                        <BaseNotification
                          item={item}
                          onClick={() => {
                            clickTime(item.eventId);
                            openUrl(`${item.urlLink}`);
                          }}
                        />
                      )}

                      {item.type === 'welcome' && (
                        <BaseWelcome
                          isCurrent={item.userId == userId}
                          item={item}
                        />
                      )}

                      {item.type === 'stayBhdMode' && (
                        <BaseModeNotification
                          isCurrent={item.userId == userId}
                          item={item}
                        />
                      )}

                      {item.type === 'subAccountInvite' && (
                        <BaseSubAccountInvite
                          item={item}
                          onClick={jumpSubAccount}
                        />
                      )}

                      {item.type === 'locked' && (
                        <BaseLocked item={item} onClick={jumpSubAccount} />
                      )}

                      {item.type === 'registerFaceByApp' && (
                        <FaceRegister item={item} />
                      )}

                      {item.type === 'registerFace' && (
                        <BaseRegisterFace
                          item={item}
                          electronicLockFlag={electronicLockFlag}
                        />
                      )}

                      {item.type === 'visitorLogEntity' &&
                        item.callStatus != 99 && (
                          <BaseVisitorLogEntity
                            item={item}
                            hasSub={
                              (item.callStatus == '0' || '1') &&
                              !(isSubAccount == 'false' && subNum == 0)
                            }
                            electronicLockFlag={electronicLockFlag}
                            autoList={autoList}
                          />
                        )}

                      {/* 99: 人脸自动解锁 */}
                      {item.type === 'visitorLogEntity' &&
                        item.callStatus == 99 && (
                          <BaseVisitorLogEntitySimple item={item} />
                        )}

                      {item.type === 'temporaryVisitorLogEntity' && (
                        <BaseTemporaryVisitorLogEntity
                          item={item}
                          onPreview={() => showTemp(item)}
                          electronicLockFlag={electronicLockFlag}
                          hasSub={
                            (item.callStatus == '0' || '1') &&
                            !(isSubAccount == 'false' && subNum == 0)
                          }
                          autoList={autoList}
                        />
                      )}

                      {item.type === 'changeAutoRes' &&
                        (item.autoRes ? (
                          <BaseChangeAutoRes item={item} autoList={autoList} />
                        ) : (
                          <BaseChangeAutoResNot item={item} />
                        ))}
                    </div>
                  );
                })
              ) : (
                <Empty
                  description="データがありません"
                  style={{ paddingTop: '20vh' }}
                />
              )}
            </TimeLineContext.Provider>
          </div>
        </PullToRefresh>
        {showInfinite ? (
          <InfiniteScroll threshold={-30} loadMore={loadMore} hasMore={true}>
            <span>読み込み中...</span>
          </InfiniteScroll>
        ) : null}
        <ImgView
          visible={visible}
          setVisible={setVisible}
          imgUrl={largeImg}
          time={time}
          nickName={'顔登録無し'}
        />
      </div>
    </Wrapper>
  );
};

export default Timeline;
