import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/pages/visitor/history/index.less';
import { Button, ImageViewer, Loading } from 'antd-mobile';
import { useHistory } from 'react-router-dom';
import { history } from '@@/core/history';
import { Flex, ImagePreview } from 'react-vant';
import { COMMON_CODE_MESSAGE } from '@/pages/timeline/components/notification';
import defaultAvatar from '@/assets/images/visitor/avatar_default.png';
import hourglass from '@/assets/images/hourglass.png';
import { useRequest } from '@@/plugin-request/request';
import { roomInfo } from '@/services/other';
import { get } from 'lodash';
import moment from 'moment-timezone';

export enum AVATAR_STATUS {
  DEFAULT,
  PENDING,
  REJECTED,
  RESOLVED,
  RETRY,
  TIMEOUT,
}

const preview = (images: string[]) => {
  ImagePreview.open({
    images,
    closeable: true,
  });
};

export const DefaultDesc: React.FC<{ onClick?: () => void }> = ({
  onClick,
}) => {
  const [lock, setLock] = useState();

  useRequest(async () => {
    const data = await roomInfo();
    setLock(get(data, 'electronicLockFlag'));
  });

  return (
    <div className={styles.desc}>
      <div>あなたの顔をインターホンに覚えさせることで、</div>

      {lock === undefined ? null : lock ? (
        <div>電子錠・自動ドアを顔で解錠することができます。</div>
      ) : (
        <>
          <div>招待したアカウントに対して帰宅したことを</div>
          <div>通知することができます。</div>
        </>
      )}

      <div className={styles.placeholderAvatar} onClick={onClick}>
        <img src={defaultAvatar} />
      </div>
      <div className={styles.tipsTitle}>Tips!</div>
      <div style={{ textAlign: 'left' }}>
        <div>✓正面を向いた状態で枠内いっぱいに顔を収める</div>
        <div>✓マスクやサングラスは外す</div>
        <div>✓明るすぎたり、暗すぎる写真は使用しない</div>
      </div>
    </div>
  );
};

export const PendingDesc: React.FC<{
  onChange: (v: number) => void;
}> = ({ onChange }) => {
  useEffect(() => {
    setTimeout(() => {
      onChange(AVATAR_STATUS.TIMEOUT);
    }, 3000);
  }, []);

  return (
    <div className={styles.content}>
      <div className={styles.desc}>
        <div className={styles.stageTitle}>解析中です</div>
        <div className={styles.pendingImg}>
          <img src={hourglass} />
          <Loading color={'#2F5597'} />
        </div>
        <div>特徴点を抽出しています</div>
        <div>しばらくおまちください</div>
      </div>
    </div>
  );
};

export const ExpireDateTip: React.FC<{ date: string }> = ({ date }) => {
  if (+date) {
    const dateText = moment(+date).format('YYYY年MM月DD日');
    if (new Date().getTime() > +date)
      return <>{`（この画像は${dateText}に削除されました）`}</>;
    return <>{`（この画像は${dateText}に削除されます）`}</>;
  }
  return null;
};

export const RejectedDesc: React.FC<{
  onChange: (v: number) => void;
  enable?: boolean;
}> = ({ onChange, enable }) => {
  const { query } = history.location;
  const reason = useMemo(() => {
    return COMMON_CODE_MESSAGE[query?.code as string];
  }, [query]);

  const expire = useMemo(() => {
    if (query?.expireDate && +query.expireDate) {
      return new Date().getTime() > +query.expireDate;
    }

    return true;
  }, [query]);

  return (
    <div className={styles.content}>
      <div className={styles.rejectDesc}>
        <div className={styles.stageTitle}>登録できませんでした</div>

        {reason ? <div className={styles.reason}>{reason}</div> : null}

        <div
          className={styles.invalidInfo}
          onClick={() => preview([query?.origin as string])}
        >
          <div className={styles.circleAvatar}>
            <ViewableImage
              src={expire ? defaultAvatar : (query?.origin as string)}
            />
          </div>
        </div>

        <div className={styles.reason} style={{ marginBottom: '5rem' }}>
          {enable ? (
            <>
              もう一度登録しますか？
              <br />
            </>
          ) : null}
          <ExpireDateTip date={query?.expireDate as string} />
        </div>
      </div>

      {enable ? (
        <>
          <Button
            shape="rounded"
            color="primary"
            block
            className={`${styles.commonButton} ${styles.b}`}
            onClick={() => {
              onChange(AVATAR_STATUS.DEFAULT);
            }}
          >
            はい
          </Button>

          <Button
            shape="rounded"
            block
            className={styles.commonButton}
            onClick={() => {
              history.replace('/timeline');
            }}
          >
            いいえ
          </Button>
        </>
      ) : null}
    </div>
  );
};

export const ResolvedStep = () => {
  const { query } = history.location;

  return (
    <div className={styles.desc}>
      <div className={styles.successTitle}>登録が完了しました</div>
      <div className={styles.mt25}>
        BrainMonのある快適な生活をお楽しみください
      </div>

      <Flex direction={'row'} justify={'center'}>
        <div className={styles.circleAvatar}>
          <ViewableImage src={query?.origin as string} />
        </div>
      </Flex>
      <Button
        shape="rounded"
        color="primary"
        block
        className={`${styles.okButton}`}
        onClick={() => {
          history.replace('/visitor');
        }}
      >
        OK
      </Button>
    </div>
  );
};

export const RetryStep: React.FC<{
  onChange: (v: number) => void;
  enable?: boolean;
}> = ({ onChange, enable = false }) => {
  const { query } = history.location;
  const reason = useMemo(() => {
    return COMMON_CODE_MESSAGE[query?.code as string];
  }, [query]);

  const expire = useMemo(() => {
    if (query?.expireDate && +query.expireDate) {
      return new Date().getTime() > +query.expireDate;
    }

    return true;
  }, [query]);

  return (
    <div className={styles.content}>
      <div className={styles.desc}>
        <div className={styles.stageTitle}>登録できませんでした</div>

        {reason ? (
          <div className={styles.reason} style={{ marginBottom: '0.5rem' }}>
            {reason}
          </div>
        ) : null}

        <div className={styles.invalidInfo}>
          <div className={styles.circleAvatar}>
            <ViewableImage
              src={expire ? defaultAvatar : (query?.origin as string)}
            />
          </div>
        </div>

        <div className={styles.reason} style={{ marginBottom: '5rem' }}>
          {enable ? (
            <>
              {' '}
              もう一度登録しますか？
              <br />
            </>
          ) : null}
          <ExpireDateTip date={query?.expireDate as string} />
        </div>
      </div>

      {enable ? (
        <>
          <Button
            shape="rounded"
            color="primary"
            block
            className={`${styles.commonButton} ${styles.b}`}
            onClick={() => {
              onChange(AVATAR_STATUS.DEFAULT);
            }}
          >
            はい
          </Button>
          <Button
            shape="rounded"
            block
            className={styles.commonButton}
            onClick={() => {
              history.replace('/timeline');
            }}
          >
            いいえ
          </Button>
        </>
      ) : null}
    </div>
  );
};

export const TimeoutStep = () => {
  const history = useHistory();
  return (
    <div className={styles.content}>
      <div className={styles.desc}>
        <div className={styles.stageTitle}>結果をお待ちください</div>

        <div className={styles.mt25}>BrainMonが顔の判別をしています</div>
        <div className={styles.mt16}> 処理が完了したら</div>
        <div> タイムラインでお知らせいたします</div>
      </div>
      <Button
        shape="rounded"
        color="primary"
        block
        className={`${styles.commonButton} ${styles.mb50}`}
        onClick={() => {
          history.replace('/timeline');
        }}
      >
        OK
      </Button>
    </div>
  );
};

export const ViewableImage: React.FC<{ src: string }> = ({ src }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.viewable}>
      <img
        src={src}
        alt={''}
        onClick={() => {
          setVisible(true);
        }}
      />
      <ImageViewer
        image={src}
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};
