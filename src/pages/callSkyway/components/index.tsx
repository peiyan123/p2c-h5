import actionStyles from '@/pages/visitor/detail/index.less';
import { map } from 'lodash';
import { Button, Ellipsis, Loading, Modal, Popup } from 'antd-mobile';
import React, { useImperativeHandle, useMemo, useState } from 'react';
import styles from './index.less';
import logoIcon from '../../../assets/images/logo.png';
import { Avatar } from '@/pages/timeline/components/notification';
import houseIcon from '../../../assets/images/timeline/ti_house.png';
import { gt } from '@/utils';
import { setupWebViewJavascriptBridge } from '@/utils/common';

export const AutoResActionSheet = React.forwardRef<any, any>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [dataC, setDataC] = useState<any[]>([]);
  const { onSelect } = props;
  const [current, setCurrent] = useState<any>(undefined);
  const [loading, setLoading] = useState<any>(false);

  useImperativeHandle(ref, () => ({
    open: (data: any[], c: any) => {
      setVisible(true);
      setList(data);
      setDataC(c);
    },
  }));

  const handleClick = async (item) => {
    setVisible(false);
    setCurrent(item);

    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        { function_name: 'app_version' },
        function (response: any) {
          let res = JSON.parse(response);
          if (res && res.data && res.data.app_version > '3.1.0') {
            setLoading(true);
          }

          new Promise((resolve, reject) => {
            onSelect(item, dataC, resolve, reject);

            // 超时主动结束
            setTimeout(() => {
              resolve('');
            }, 10000);
          }).finally(() => {
            setLoading(false);
            setTimeout(() => {
              setCurrent(undefined);
            }, 1000);
          });
        },
      );
    });
  };

  return (
    <>
      <Popup
        visible={visible}
        bodyStyle={{ height: '70vh' }}
        className={actionStyles.basePopup}
        onMaskClick={() => setVisible(false)}
      >
        <div className={actionStyles.baseBody}>
          <div className={`${styles.refuseContent}`}>
            {map(list, (item) => {
              return (
                <div
                  className={styles.resItem}
                  key={item.autoResPattern}
                  onClick={() => handleClick(item)}
                >
                  <div className={styles.picture}>
                    <img src={item.smallImageUrl} alt="auto" />
                  </div>
                  <Ellipsis direction="end" rows={3} content={item.message} />
                </div>
              );
            })}
          </div>
          <Button
            onClick={() => {
              setVisible(false);
            }}
            className={actionStyles.cancelButton}
            style={{ color: '#2f5597' }}
          >
            キャンセル
          </Button>
        </div>
      </Popup>
      <Modal
        visible={loading}
        closeOnAction
        onClose={() => {
          setLoading(undefined);
        }}
        bodyStyle={{ padding: 0 }}
        content={
          <>
            <div
              className={`${styles.resItem} ${styles.resItemBg}`}
              key={current?.autoResPattern}
            >
              <div className={styles.picture}>
                <img src={current?.smallImageUrl} alt="auto" />
              </div>
              <Ellipsis
                direction="end"
                rows={3}
                content={current?.message || ''}
              />
            </div>

            <div className={styles.loadingPart}>
              <img src={logoIcon} />
              <Loading />
              <img src={current?.smallImageUrl} />
            </div>

            <Ellipsis
              direction="end"
              rows={3}
              content={'選択したメッセージを来訪者に伝えています...'}
              style={{
                textAlign: 'center',
                padding: '0 15%',
                width: '100%',
                color: '#53595C',
              }}
            />
          </>
        }
      />
    </>
  );
});

export const Reminder = ({ visitor, temporary = false }) => {
  const item = useMemo(() => {
    return visitor
      ? {
          visitorType: visitor.type,
          count: visitor.inviteCountMine,
          nickName: visitor.nickName,
          smallImageUrl: visitor.avatar,
        }
      : {};
  }, [visitor]);

  return (
    <div className={styles.reminder}>
      {visitor && !temporary ? <Avatar item={item} disabled /> : null}
      <div className={styles.info}>
        {visitor ? (
          temporary ? (
            <div
              className={styles.nickName}
              style={{ textAlign: 'center', marginBottom: 0 }}
            >
              顔登録なしの来訪者です
            </div>
          ) : (
            <>
              <div className={styles.types}>{item.visitorType || 'その他'}</div>
              <div className={styles.nickName}>
                {visitor
                  ? temporary
                    ? '顔登録無し'
                    : item.nickName || '未登録者'
                  : null}
              </div>
              <div className={styles.desc}>
                <img src={houseIcon} className={styles.houseIcon} />
                <span>部屋への来訪回数：{item.count}回目</span>
              </div>
            </>
          )
        ) : null}
      </div>
    </div>
  );
};
