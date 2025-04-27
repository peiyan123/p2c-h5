import { Wrapper } from '@/layout/wrapper';
import React from 'react';
import { NavBar, PullToRefresh, SpinLoading } from 'antd-mobile';
import styles from './index.less';
import { EditSOutline } from 'antd-mobile-icons';
import { history } from 'umi';
import { Cell, Image, Loading } from 'react-vant';
import { useRequest } from '@@/plugin-request/request';
import { listFaces } from '@/services/face';
import { map } from 'lodash';
import {
  COMMON_CODE_MESSAGE,
  FACE_STATUS,
} from '@/pages/timeline/components/notification';
import { AVATAR_STATUS } from '@/pages/visitor/history/components/Desc';

export const HistoryList = () => {
  const { data, loading, refresh } = useRequest(listFaces);
  const toEdit = () => {
    history.push({
      pathname: '/visitor/history',
    });
  };

  return (
    <Wrapper
      className={styles.bottom0}
      nav={
        <NavBar
          back="キャンセル"
          onBack={() => {
            history.goBack();
          }}
          right={
            <>
              <span
                className={`color-primary pd-6 ${styles.headerTitle}`}
                onClick={toEdit}
              >
                录入
              </span>
              <EditSOutline />
            </>
          }
        />
      }
    >
      {loading ? (
        <SpinLoading
          color="primary"
          style={{
            margin: '30vh auto',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
        />
      ) : null}
      <PullToRefresh
        onRefresh={refresh}
        renderText={(status) => {
          return {
            pulling: '指を離して更新',
            canRelease: '指を離して更新',
            refreshing: '読み込み中',
            complete: '加载成功',
          }[status];
        }}
      >
        {map(data, (item, i) => (
          <Cell
            key={i}
            icon={
              <Image width={44} height={44} src={item.smallImageUrl} round />
            }
            title={`状态： ${FACE_STATUS[item.faceStatus]}`}
            label={`结果： ${COMMON_CODE_MESSAGE[item.errorCode] || '未知'}`}
            isLink
            onClick={() => {
              switch (item.faceStatus) {
                case 2:
                  history.push({
                    pathname: '/visitor/history',
                    query: {
                      code: String(AVATAR_STATUS.REJECTED),
                      origin: item.imageUrl,
                    },
                  });
                  break;
                case 1:
                  history.push({
                    pathname: '/visitor/history',
                    query: {
                      code: String(AVATAR_STATUS.RESOLVED),
                      origin: item.smallImageUrl,
                    },
                  });
                  break;
                case 0:
                  history.push({
                    pathname: '/visitor/history',
                    query: {
                      code: String(AVATAR_STATUS.PENDING),
                      origin: item.imageUrl,
                    },
                  });
                  break;
              }
            }}
          />
        ))}
      </PullToRefresh>
    </Wrapper>
  );
};

export default HistoryList;
