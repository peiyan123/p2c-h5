import React, { FC, useEffect, useRef } from 'react';
import Footer from './footer';
import styles from './index.less';
import { useDispatch, useSelector } from 'umi';
import { GlobalState, RootState } from '@/models/typings';
import { Dialog, Loading } from 'antd-mobile';
import { getInfo } from '@/services/login';
import { updateMode } from '@/services/common';

interface IBasicLayout {
  [key: string]: any;
}

const BasicLayout: FC<IBasicLayout> = (props) => {
  const {
    children,
    location: { pathname = '/' },
    route: { routes },
  } = props;

  const getUserInfo = async () => {
    const res = await getInfo(localStorage.getItem('userId') || '');
    res?.forEach((info: Record<string, any>) => {
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'resllerName',
        info.name,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'logo',
        info.logoUrl,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'contactUsUrl',
        info.contactUsUrl,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'utilizeClauseUrl',
        info.utilizeClauseUrl,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'appOperateManualUrl',
        info.appOperateManualUrl,
      );
      localStorage.setItem(
        `${info.type === 'admin' ? 'admin_' : ''}` + 'privacyPolicyUrl',
        info.privacyPolicyUrl,
      );
    });
  };
  useEffect(() => {
    if (!!localStorage.getItem('userId')) {
      getUserInfo();
    }
  }, []);
  return (
    <div className={styles.app}>
      <article className={`${styles.appHeader} border-bottom`} />
      {children}
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
};

export default BasicLayout;

export const DisturbMode: React.FC<{ refresh?: () => void }> = ({
  refresh,
}) => {
  const ref = useRef(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({
      type: 'global/init',
    });
  }, []);
  const { mode, loading } = useSelector<RootState, GlobalState>((state) => {
    return {
      ...state.global,
      loading: state.loading?.global,
    };
  });

  const changeMode = () => {
    dispatch({
      type: 'global/toggle',
    });

    const handler = Dialog.show({
      title: <div className={styles.tipHeader}>サイレントモード設定</div>,
      header: (
        <div className="dialogHeaderWrapper">
          <div className="close" onClick={() => handler?.close()} />
        </div>
      ),
      content: (
        <div className={styles.tipContent}>
          {!mode
            ? 'サイレントモードに設定しますか？'
            : 'サイレントモードを解除しますか？'}
        </div>
      ),
      closeOnAction: true,
      onClose: () => {
        if (ref.current) {
          ref.current = false;
        } else {
          dispatch({
            type: 'global/toggle',
          });
        }
      },
      actions: [
        [
          {
            key: 'cancel',
            text: 'いいえ',
            className: 'bg-gray',
          },
          {
            key: 'sure',
            text: 'はい',
            className: 'bg-primary',
            onClick: async () => {
              ref.current = true;
              await updateMode(!mode);
              dispatch({
                type: 'global/init',
              });
              refresh?.();
              return;
            },
          },
        ],
      ],
    });
  };

  return (
    <div className={styles.status} onClick={changeMode}>
      {loading ? (
        <Loading />
      ) : (
        <img
          src={
            !mode
              ? require('../assets/images/header/normal.png')
              : require('../assets/images/header/abnormal.png')
          }
          alt={''}
        />
      )}
    </div>
  );
};

export const Logo: React.FC<any> = ({ refresh }) => {
  return (
    <div className={`${styles.appHeader}`}>
      <img
        src={localStorage.getItem('logo') || ''}
        className={styles.headericon}
        alt=""
      />
      <DisturbMode refresh={refresh} />
    </div>
  );
};
