import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  Divider,
  Ellipsis,
  Empty,
  NavBar,
  Popup,
  Radio,
  Space,
  SpinLoading,
  TextArea,
  Toast,
} from 'antd-mobile';
import { history, useParams } from 'umi';
import { length, substring } from 'stringz';
import { EditSOutline, LeftOutline, RightOutline } from 'antd-mobile-icons';
import { getAutoMessageList } from '@/services/common';
import styles from './index.less';
import {
  editVisitor,
  getVisitorDetail,
  rejectSetting,
} from '@/services/visitor';
import { CallStatus, handleTypeColor } from '@/utils/common';
import { UserHeader } from '@/pages/visitor/detail/components/header';
import { WarnImg } from '@/components/imgview/img';
import { find, omitBy, toPairs } from 'lodash';
import { BaseActionSheet } from '@/components/actionSheet';
import { Wrapper } from '@/layout/wrapper';

const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');

const VisitorDetail: React.FC = () => {
  const id = useParams<{ id?: string }>()?.id;
  const [loading, setLoading] = useState(false);
  const [autoList, setAutoList] = useState([]);
  const [detail, setDetail] = useState<any>({});
  const [maxTime, setmaxTime] = useState(0);
  const [colorFlag, setColorFlag] = useState('primary');
  const { query } = history.location;
  const emoji_exp =
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;

  const estring = (str: string) => {
    const ms = [...str.matchAll(emoji_exp)];
    if (!ms || !ms.length) return str.length;

    let emojiSize = 0;
    for (const m of ms) emojiSize += m.length - 1;
    return str.length - emojiSize;
  };

  const back = () => {
    if (query?.timeline === 'true') {
      history.push('/timeline');
    } else if (query?.reject === 'true') {
      history.push('/visitor/reject');
    } else if (query?.setting === 'true') {
      history.push('/setting');
    } else {
      history.push('/visitor');
    }
  };
  useEffect(() => {
    initData();
  }, []);

  const initData = () => {
    getAutoList();
    getDetail();
  };

  const getDetail = async () => {
    setLoading(true);
    let data = (await getVisitorDetail({ visitorId: id })) || {};
    const temp: any[] = [];
    setColorFlag(handleTypeColor(data.type));
    let owner = data.type == 'あなた' || data.type == '居住者' ? '0' : '1';
    localStorage.setItem('detailcallStatus', owner);
    if (data.callStatusList && data.callStatusList.length) {
      localStorage.setItem(
        'callStatusList',
        JSON.stringify(data.callStatusList),
      );
      data.callStatusList.forEach((item: any, index: number) => {
        temp.push(moment(item.callTime).valueOf());
      });
    } else {
      localStorage.setItem('callStatusList', '[]');
    }
    temp.length && setmaxTime(Math.max(...temp));
    setDetail(data);
    setLoading(false);
  };
  const getAutoList = async () => {
    let data = (await getAutoMessageList()) || [];
    setAutoList(data);
  };

  const canEdit = useMemo(() => {
    return (
      detail.type !== '居住者' ||
      (detail.type === '居住者' && detail?.bindAccount !== true)
    );
  }, [detail, query]);

  const toEdit = () => {
    if (!canEdit) return;

    const search = toPairs(
      omitBy(
        {
          nickName: detail.nickName,
          visitorType: detail.type,
          avatar: detail.smallImageUrl,
          largeImageUrl: detail.largeImageUrl,
          timeline: detail.timeline,
          reject: detail.reject,
          bindAccount: detail.bindAccount,
          setting: query?.setting,
        },
        (item) => item === undefined || item === null,
      ),
    )
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    history.push(`/visitor/edit/${id}?${search}`);
  };

  const right = !loading ? (
    canEdit ? (
      <>
        <span
          className={`color-primary pd-6 ${styles.headerTitle}`}
          onClick={toEdit}
        >
          編集
        </span>
        <EditSOutline />
      </>
    ) : null
  ) : null;

  const left = (
    <>
      <Space style={{ fontSize: 20, margin: 'auto 0' }}>
        <LeftOutline />
      </Space>
    </>
  );

  const setAuto = (item: any): void => {
    let handler: ReturnType<typeof Dialog.show>;

    let message: Record<string, ReactNode> = detail.blackStatus
      ? {
          header: (
            <div className={`${styles.autoResHeader} ${styles.f15}`}>
              <div className={`dialogHeaderWrapper ${styles.autoResWarn}`}>
                <WarnImg />
                <div className="close" onClick={() => handler?.close()} />
              </div>
              <span>この来訪者の</span>
              <span style={{ color: '#E56757' }}>着信拒否を解除し</span>
              <span>、以下の自動応答を設定しますか</span>
              <Divider className={styles.divider} />
            </div>
          ),
          content: (
            <div className="flex align-items-center">
              <div className={styles.blackContentImg}>
                <img src={item.smallImageUrl} alt="" />
              </div>
              <Ellipsis
                direction="end"
                rows={3}
                content={item.message}
                className={styles.autoResHeader}
              />
            </div>
          ),
        }
      : {
          header: (
            <div className="dialogHeaderWrapper">
              <div className="close" onClick={() => handler?.close()} />
            </div>
          ),
          content: (
            <div className={styles.autoResContent}>
              <div className={styles.imgWrapper}>
                <img src={item.smallImageUrl} alt={''} />
              </div>
              <div className={styles.dynamicContent}>{item.message}</div>
              <div className={styles.confirmContent}>
                自動応答を設定しますか？
              </div>
            </div>
          ),
        };

    handler = Dialog.show({
      ...message,
      closeOnAction: true,
      className: styles.dialog,
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
            className: detail.blackStatus ? 'bg-red' : 'bg-primary',
            onClick: async () => {
              let data = await editVisitor({
                vistorId: id,
                autoAnswer: true,
                autoResPattern: item.autoResPattern,
              });
              if (data) {
                Toast.show({
                  content: `設定を変更しました!`,
                });
              }
              initData();
            },
          },
        ],
      ],
    });
  };

  const removeAuto = (): void => {
    const handler = Dialog.show({
      header: (
        <div className={`dialogHeaderWrapper ${styles.autoResWarn}`}>
          <div className="close" onClick={() => handler?.close()} />
        </div>
      ),
      content: '自動応答を解除しますか？',
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
              let data = await editVisitor({ vistorId: id, autoAnswer: false });
              if (data) {
                Toast.show({
                  content: `設定を変更しました!`,
                });
              }
              initData();
            },
          },
        ],
      ],
    });
  };

  const reject = async (status: boolean) => {
    let data = await rejectSetting({ visitorId: id, blackStatus: status });
    getDetail();
    if (data) {
      Toast.show({
        content: `設定を変更しました!`,
      });
    }
  };

  const setMemo = async (e: any) => {
    let memo = e.target.value;
    let memoLen = length(memo);
    if (memoLen > 50) {
      let data = await editVisitor({
        vistorId: id,
        remark: substring(memo, 0, 50),
      });
      if (data) {
        Toast.show({
          content: `編集が成功しました!`,
        });
        initData();
      }
    } else {
      let data = await editVisitor({
        vistorId: id,
        remark: memo,
      });
      if (data) {
        Toast.show({
          content: `編集が成功しました!`,
        });
        initData();
      }
    }
  };

  const refuse = async (status: boolean) => {
    reject(status);
    initData();
  };

  return (
    <Wrapper nav={<NavBar back="戻る" onBack={back} right={right} />}>
      {loading ? (
        <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
      ) : (
        <div className={styles.detail}>
          <UserHeader
            color={colorFlag}
            user={{ ...(detail || {}), maxTime }}
            value={detail.nickName || '未登録者'}
            bindAccount={detail.bindAccount}
          />

          <div className={styles.content}>
            <div className={styles.cell}>
              <div className={styles.cellTitle}>カテゴリ</div>
              <div className={styles.information}>
                <div
                  className="flex space-between align-items-center"
                  onClick={toEdit}
                >
                  <img
                    src={require('../../../assets/images/visitor/tags-solid.png')}
                    className={styles.cellIcon}
                  />
                  <ul>
                    <li>{detail?.type || 'その他'}</li>
                  </ul>
                  {canEdit ? (
                    <div className={styles.rightOutLine}>
                      <RightOutline fontSize={16} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {detail.type == 'あなた' || detail.type == '居住者' ? (
              <div className={styles.cell}>
                <div className={styles.cellTitle}>帰宅履歴</div>
                <div className={styles.information}>
                  <div
                    className="flex space-between align-items-center"
                    onClick={() => history.push('/visitor/record')}
                  >
                    <img
                      src={require('../../../assets/images/visitor/im_human.png')}
                      className={styles.cellIcon}
                    />
                    <ul>
                      {detail?.callStatusList && (
                        <li>
                          {maxTime
                            ? moment(detail?.callStatusList[0].callTime).format(
                                'YYYY年MM月DD日 HH:mm',
                              )
                            : ''}
                        </li>
                      )}
                    </ul>
                    <div className={styles.rightOutLine}>
                      <RightOutline fontSize={16} />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.cell}>
                  <div className={styles.cellTitle}>来訪履歴</div>
                  <div className={styles.information}>
                    <div
                      className="flex space-between align-items-center"
                      onClick={() => history.push('/visitor/record')}
                    >
                      <img
                        src={require('../../../assets/images/visitor/im_human.png')}
                        className={styles.cellIcon}
                      />
                      <ul>
                        {detail?.callStatusList && (
                          <li>
                            {maxTime
                              ? moment(maxTime).format('YYYY年MM月DD日')
                              : ''}
                          </li>
                        )}
                        {maxTime
                          ? detail?.callStatusList &&
                            detail?.callStatusList.map((item: any) => {
                              if (moment(item.callTime).valueOf() == maxTime) {
                                return (
                                  <li
                                    key={item.callTime}
                                    className={styles.f10}
                                  >
                                    {moment(item.callTime).format('HH:mm')}
                                    &nbsp;&nbsp;
                                    {CallStatus[item.callStatus]}
                                  </li>
                                );
                              }
                            })
                          : null}
                      </ul>
                      <div className={styles.rightOutLine}>
                        <RightOutline fontSize={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.cell}>
                  <div className={styles.cellTitle}>来訪回数</div>
                  <div className={styles.information}>
                    入居者様の部屋への来訪回数：{detail?.callRoomNumber}回
                  </div>
                </div>

                {detail.showAutoResRejection && (
                  <>
                    <div className={styles.cell}>
                      <div className={styles.cellTitle}>
                        <div className={styles.antoIcon} />
                        自動応答設定
                      </div>

                      <div className={styles.autoAnswer}>
                        <ul>
                          {autoList.length ? (
                            autoList.map((item: any, index) => {
                              const active =
                                detail?.autoAnswer &&
                                item.autoResPattern === detail.autoResPattern;

                              return (
                                <Radio
                                  checked={active}
                                  key={item.autoResPattern}
                                  className={styles.radioWidth}
                                  onChange={() => {
                                    setAuto(item);
                                  }}
                                >
                                  <li
                                    key={item.autoResPattern}
                                    className={`${styles.autoRes}`}
                                  >
                                    <div className={styles.autoResPicture}>
                                      <img src={item.smallImageUrl} alt="" />
                                    </div>
                                    <Ellipsis
                                      direction="end"
                                      rows={3}
                                      content={item.message}
                                    />
                                  </li>
                                  {index + 1 < autoList.length ? (
                                    <Divider style={{ margin: 0 }} />
                                  ) : null}
                                </Radio>
                              );
                            })
                          ) : (
                            <li>
                              <Empty description="データがありません" />
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <Divider />

                    {autoList.length &&
                    detail?.autoAnswer &&
                    find(
                      autoList,
                      (i: any) => i.autoResPattern === detail.autoResPattern,
                    ) ? (
                      <>
                        <div className={styles.cell}>
                          <div
                            className={styles.information}
                            onClick={() => removeAuto()}
                          >
                            <ul>
                              <li className={styles.unbind}>
                                自動応答解除する
                              </li>
                            </ul>
                          </div>
                        </div>
                        <Divider />
                      </>
                    ) : null}
                  </>
                )}

                <div className={styles.cell}>
                  <div className={styles.cellTitle}>メモ</div>
                  <div className={styles.note}>
                    <TextArea
                      onBlur={(e) => setMemo(e)}
                      autoSize={{ minRows: 3, maxRows: 5 }}
                      // maxLength={50}
                      defaultValue={detail?.remark || ''}
                      maxLength={100}
                      placeholder={'内容を50文字以下で入力してください。'}
                    />
                  </div>
                </div>

                {detail?.showAutoResRejection && (
                  <div>
                    {detail?.blackStatus ? (
                      <BaseActionSheet
                        content={
                          <div className={`${styles.refusContent}`}>
                            <h2 className="border-bottom">
                              この来訪者の着信拒否は解除され、呼び出しは着信します。
                            </h2>
                            <div
                              className={styles.refusHandle}
                              onClick={() => reject(false)}
                            >
                              この来訪者の着信拒否設定を解除
                            </div>
                          </div>
                        }
                      >
                        <div className={`${styles.bottom} flex`}>
                          <i className={styles.rejectIcon} />
                          <div className={styles.reject}>
                            この来訪者の着信拒否設定を解除
                          </div>
                        </div>
                      </BaseActionSheet>
                    ) : (
                      <BaseActionSheet
                        content={
                          <div className={`${styles.refusContent}`}>
                            <h2>
                              着信拒否リストに登録した来訪者の呼出は着信しません。
                            </h2>
                            <div
                              className={styles.refusHandle}
                              onClick={() => refuse(true)}
                            >
                              この来訪者を着信拒否
                            </div>
                          </div>
                        }
                      >
                        <div className={`${styles.bottom} flex`}>
                          <i className={styles.rejectIcon} />
                          <div className={styles.reject}>
                            この来訪者を着信拒否
                          </div>
                        </div>
                      </BaseActionSheet>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default VisitorDetail;
