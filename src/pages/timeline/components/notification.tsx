import styles from '@/pages/timeline/index.less';
import cs from './index.less';
import moment from 'moment-timezone';
import React, { useContext, useEffect, useState } from 'react';
import { handleTypeColor, setupWebViewJavascriptBridge } from '@/utils/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import {
  Dialog,
  Divider,
  Ellipsis,
  ImageViewer,
  Loading,
  SpinLoading,
  Toast,
} from 'antd-mobile';
import { BaseAvatar } from '@/components/avatar';
import { filter, first, has, map } from 'lodash';
import { history } from 'umi';
import { AVATAR_STATUS } from '@/pages/visitor/history/components/Desc';
import viewIcon from '../../../assets/images/view.png';
import ReactDOM from 'react-dom';
import closeIcon from '../../../assets/images/call/cross.png';
import downloadIcon from '../../../assets/images/download.png';
import { DeleteOutline } from 'antd-mobile-icons';
import { deleteVisitorPic, getExpirDay } from '@/services/timeline';
import { VersionControl } from '@/components/VersionControl';
import { WarnImg } from '@/components/imgview/img';
import { listFaces } from '@/services/face';
import { getVisitor } from '@/services/visitor';

export const TimeLineContext = React.createContext<{
  onRefresh?: (id: string) => void;
}>({});
const StatusIcon = {
  0: require('../../../assets/images/timeline/tl_ab_call_response.png'),
  1: require('../../../assets/images/timeline/tl_ab_message.png'),
  2: require('../../../assets/images/timeline/talk_off.png'),
  3: require('../../../assets/images/timeline/tl_ab_auto_response.png'),
  4: require('../../../assets/images/timeline/talk_off.png'),
  5: require('../../../assets/images/timeline/tl_ab_block.png'),
  6: require('../../../assets/images/timeline/tl_ab_no_response.png'),
  7: require('../../../assets/images/timeline/tl_ab_cancel.png'),
};

const getName = (name?: string) => {
  return name || '未登録者';
};

const BaseLayout: React.FC<any> = ({
  date,
  children,
  footer,
  info,
  onClick,
  isGary = false, //判断是否是灰色背景
}) => {
  return (
    <div className={`${styles.box} ${styles.notify}`}>
      <div className={`flex align-items-center ${styles.mb5}`}>
        <div className={`${info ? styles.iconDot : styles.icon}`} />
        <div className={styles.name}>{moment(date).format('HH:mm')}</div>
      </div>
      <div className={`flex ${styles['margin-left-5']} ${styles.rel}`}>
        <div className={styles.cylinder} />
        <div
          className={`${styles.box} ${isGary ? styles.gary : ''} flex`}
          onClick={onClick}
        >
          <div style={{ flex: 1, display: 'flex' }}>{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
};

const InfoLayout: React.FC<any> = ({ children, ...rest }) => {
  return (
    <BaseLayout {...rest} info>
      <div className={styles.infoIcon} />
      {children}
    </BaseLayout>
  );
};

export const BaseModeNotification: React.FC<any> = ({ item, isCurrent }) => {
  return (
    <InfoLayout isGary={item?.isExpire} date={item._sort_date}>
      <div className={styles.wordText}>
        {isCurrent ? '' : item.userNickName ? item.userNickName + 'さんが' : ''}
        {item.stayBhdMode
          ? 'サイレントモードに設定しました。'
          : 'サイレントモードを解除しました。'}
      </div>
    </InfoLayout>
  );
};
export const FilUpdateVisitorNotification: React.FC<any> = ({ item }) => {
  return (
    <InfoLayout isGary={item?.isExpire} date={item._sort_date}>
      <div className={styles.wordText}>
        {getName(item.newName)}
        さんのカテゴリ変更が失敗しました。しばらくたってからお試しください。
      </div>
    </InfoLayout>
  );
};
export const BaseNotification: React.FC<any> = ({ item, onClick }) => {
  return (
    <InfoLayout isGary={item?.isExpire} date={item._sort_date}>
      <div className={styles.wordText}>
        {item.urlLink ? (
          <span className={styles.link} onClick={onClick}>
            {item.message}
          </span>
        ) : (
          <span>{item.message}</span>
        )}
      </div>
    </InfoLayout>
  );
};

export const BaseWelcome: React.FC<any> = ({ item, isCurrent }) => {
  return (
    <InfoLayout isGary={item?.isExpire} date={item._sort_date}>
      <div className={styles.wordText}>
        {isCurrent ? (
          <>
            ようこそ、{getName(item.userNickName)}
            さん、サービス利用開始しました
          </>
        ) : (
          <>
            {getName(item.userNickName)}
            さんがサービスをご利用開始しました。
          </>
        )}
      </div>
    </InfoLayout>
  );
};

export const BaseSubAccountInvite: React.FC<any> = ({ item, onClick }) => {
  return (
    <InfoLayout isGary={item?.isExpire} date={item._sort_date}>
      <div className={styles.wordText}>
        ４人の方にアカウントを招待することができます。
        <br />
        <a onClick={onClick} className={styles.inviteLink}>
          今すぐに招待する
        </a>
        <br />
        あとで招待する場合は、設定画面→子アカウント管理ページから追加することができます。
      </div>
    </InfoLayout>
  );
};

export const BaseLocked: React.FC<any> = ({ item, onClick }) => {
  return (
    <InfoLayout isGary={item?.isExpire} date={item._sort_date}>
      <div className={styles.wordText} onClick={onClick}>
        {getName(item.userNickName)}
        さんが、あなたの携帯番号下4桁の入力を5回失敗したために、ロックされました。
        <a className={styles.inviteLink}>
          子アカウント管理から、ロック解除をしてください。
        </a>
      </div>
    </InfoLayout>
  );
};

export const FACE_REGISTER_RESULT = {
  BASE: [
    'BrainMonは顔の認識作業を終了しました。',
    'タップして結果を確認してください。',
  ],
  '-1': [
    'BrainMonは顔の認識作業を開始しました。',
    '結果がでましたらお知らせします。',
  ],
};

export const FACE_STATUS = {
  2: '登録がうまくいきませんでした。',
  1: '登録が完了しました。',
  0: '审核中',
};

export const COMMON_CODE_MESSAGE = {
  '-1': 'BrainMonは顔の判別をしています。しばらくおまちください。',
  0: '没有问题', // NO_ERROR
  1: '找到相同的人脸', // ERROR_FACE_SAME
  2: (
    <div>
      画像の取得に失敗しました。
      <br />
      しばらく経ってからもう一度お試し下さい。
      <br />
      （エラーコード:0102）
    </div>
  ), // '没有获取到图片(下载图片失败)', // ERROR_NO_IMAGE
  3: (
    <div>
      顔を検出できませんでした。
      <br />
      別の画像を使ってもう一度お試し下さい。
      <br />
      （エラーコード:0103）
    </div>
  ), // '图片里面没有人脸', // ERROR_NO_FACE
  4: (
    <div>
      顔が小さすぎます。
      <br />
      枠内いっぱいに収めてもう一度お試し下さい。
      <br />
      （エラーコード:0104）
    </div>
  ), // '图片里面人脸太小', // ERROR_FACE_TOO_SMALL
  5: (
    <div>
      顔が枠の中に入っておりません。
      <br />
      枠内に顔全体を収めてもう一度お試し下さい。
      <br />
      （エラーコード:0105）
    </div>
  ), // '图片里面人脸位置不规范', // ERROR_FACE_NOT_STANDARD
  6: (
    <div>
      被写体がぼやけているため認識できません。
      <br />
      別の画像を使ってもう一度お試し下さい。
      <br />
      （エラーコード:0106）
    </div>
  ), // '图片太模糊', // ERROR_FACE_BLUR
  7: (
    <div>
      顔が正面を向いていません。
      <br />
      正面を向いた写真を使ってもう一度お試し下さい。
      <br />
      （エラーコード:0107）
    </div>
  ), // '图片人脸角度不规矩，需要正脸', // ERROR_FACE_POSE
  8: (
    <div>
      写真が明るすぎるため、別の画像を使ってもう一度お試し下さい。
      <br />
      （エラーコード:0108）
    </div>
  ), // '图片太亮', // ERROR_FACE_HIGH_BRIGHTNESS
  9: (
    <div>
      写真が暗すぎるため、別の画像を使ってもう一度お試し下さい。
      <br />
      （エラーコード:0109）
    </div>
  ), // '图片太暗', // ERROR_FACE_LOW_BRIGHTNESS
  10: (
    <div>
      写真の解像度が低いため顔を認識できません。
      <br />
      別の画像を使ってもう一度お試し下さい。
      <br />
      （エラーコード:0110）
    </div>
  ), // '图片整体质量太差', // ERROR_FACE_NO_QUALITY
  11: (
    <div>
      処理がタイムアウトしました。
      <br />
      しばらく経ってからもう一度お試し下さい。
      <br />
      （エラーコード:0111）
    </div>
  ), // '处理超时', // ERROR_FACE_TIME_OUT
  12: (
    <div>
      この顔は登録できません。
      <br />
      別の画像でもう一度登録をお願いします。
      <br />
      （エラーコード:0112）
    </div>
  ), // '物件已有居住者或本人不允许录入人脸', // ERROR_FACE_NOT_ALLOWED
  13: (
    <div>
      顔を検出できませんでした。
      <br />
      別の画像でもう一度登録をお願いします。
      <br />
      （エラーコード:0113）
    </div>
  ), // 人脸审核中
};

export const FaceRegister: React.FC<any> = ({ item }) => {
  const viewRecord = () => {
    switch (String(item.commonCode)) {
      case '0':
      case '1':
        history.push({
          pathname: '/visitor/history',
          query: {
            type: String(AVATAR_STATUS.RESOLVED),
            origin: item.commonRemark,
          },
        });
        break;
      case '12':
        history.push({
          pathname: '/visitor/history',
          query: {
            type: String(AVATAR_STATUS.REJECTED),
            origin: item.commonRemark3,
            code: item.commonCode,
            expireDate: item.expireDate,
          },
        });
        break;
      case '-1':
        break;
      default:
        history.push({
          pathname: '/visitor/history',
          query: {
            type: String(AVATAR_STATUS.RETRY),
            origin: item.commonRemark3,
            code: item.commonCode,
            expireDate: item.expireDate,
          },
        });
        break;
    }
  };
  return (
    <InfoLayout
      isGary={item?.isExpire}
      date={item._sort_date}
      onClick={viewRecord}
    >
      <div className={styles.wordText}>
        {map(
          FACE_REGISTER_RESULT[item.commonCode] || FACE_REGISTER_RESULT.BASE,
          (text, index: number) => {
            return (
              <React.Fragment key={index}>
                {index === 0 ? (
                  text
                ) : (
                  <>
                    <br />
                    {text}
                  </>
                )}
              </React.Fragment>
            );
          },
        )}
      </div>
    </InfoLayout>
  );
};

export const BaseRegisterFace: React.FC<any> = ({
  item,
  electronicLockFlag,
}) => {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      const { data: records } = await listFaces();
      const visitors = await getVisitor();
      if (
        String(first(records as any[])?.faceStatus) === '0' ||
        filter(visitors, (item) => item.visitorType == 'あなた').length > 0
      ) {
        Toast.show({
          content:
            'すでにあなたの顔が登録されているか、顔の認識作業中のため登録することができません。',
          position: 'top',
        });
        return;
      }
      history.push('/visitor/history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InfoLayout isGary={item?.isExpire} date={item._sort_date}>
      <div className={styles.wordText}>
        あなたの顔をインターホンに覚えさせることで、
        {electronicLockFlag
          ? '電子錠・自動ドアを顔で解錠することができます。'
          : '招待したアカウントに対して帰宅したことを通知することができます。'}
        <br />
        <div style={{ marginTop: 20 }}>２つの覚えさせる方法</div>
        <div>
          1. アプリから登録
          <br />
          <a onClick={onClick} className={styles.inviteLink}>
            こちら
          </a>
          からあなたの顔をご登録お願いします。
          <div style={{ marginBottom: 20 }} />
          2. インターホンから登録
          <br />
          1)ご自分の部屋をインターホンから呼び出します。
          <br />
          2)タイムラインにあるご自分の顔をタップします。
          <br />
          3)カテゴリ設定を「あなた」に設定してください
        </div>
      </div>

      {loading ? (
        <div className={styles.mask}>
          <SpinLoading color="primary" className={styles.spin} />
        </div>
      ) : null}
    </InfoLayout>
  );
};

export const Avatar: React.FC<any> = ({
  item,
  onPreview,
  temporary,
  disabled,
}) => {
  return (
    <div
      className={`${styles.headerIcon}`}
      onClick={async () => {
        // 如果是已经被删除的访客，不允许点击并弹窗
        if (item?.isExpire) {
          const days = await getExpirDay();
          Toast.show({
            content: `この来訪者は${days}日以上来訪がないため削除されました。`,
          });
          return;
        }
        if (onPreview) {
          onPreview();
          return;
        }

        if (!disabled)
          history.push(`/visitor/detail/${item.visitorId}?timeline=true`);
      }}
    >
      <BaseAvatar
        avatar={temporary ? null : item.smallImageUrl}
        color={handleTypeColor(
          temporary ? 'temporary' : item.visitorType,
          item.blackStatus || item.callStatus === '5',
        )}
        binded={item.bindAccount}
        autoRes={
          item.callStatus === '3' || (!has(item, 'callStatus') && item.autoRes)
        }
        block={item.blackStatus || item.callStatus === '5'}
        newer={item.newFlag}
        mode={item.stayBhdMode}
        className={styles.baseAvatar}
      />
    </div>
  );
};

export const CallUser: React.FC<{ show: boolean; name?: string }> = ({
  name,
  show,
}) => {
  return show ? <div className={styles.callUser}>{name || ' '}</div> : null;
};
export const Lock: React.FC<{ show: boolean; electronicLockFlag: boolean }> = ({
  show,
  electronicLockFlag,
}) => {
  if (!show) return null;
  return (
    <img
      src={
        electronicLockFlag
          ? require('../../../assets/images/timeline/tl_ab_unlock.png')
          : require('../../../assets/images/timeline/tl_ab_come.png')
      }
      className={cs.status}
      alt={''}
    />
  );
};

export const AutoRes: React.FC<any> = ({ autoList, item }) => {
  return (
    <div className={`${styles.autoAnswer}`}>
      {autoList.map((autoItem: any) => {
        if (autoItem.autoResPattern === item.autoResPattern) {
          return (
            <div key={autoItem.autoResPattern}>
              <div className={styles.picture} style={{ marginLeft: 0 }}>
                <img src={autoItem.smallImageUrl} alt="icon" />
              </div>
              <Ellipsis direction="end" rows={10} content={autoItem.message} />
            </div>
          );
        }
      })}
    </div>
  );
};

export const BaseVisitorLogEntity: React.FC<any> = ({
  item,
  hasSub,
  electronicLockFlag,
  autoList,
}) => {
  return (
    <BaseLayout
      date={item?._sort_date}
      isGary={item?.isExpire}
      footer={
        <>
          <ContentGrid item={item} />

          {item.callStatus === '1' && autoList.length && item.autoResPattern && (
            <>
              <Divider style={{ color: 'eff0f4' }} />
              <AutoRes item={item} autoList={autoList} />
            </>
          )}
        </>
      }
    >
      <Avatar item={item} />

      {/* content */}
      <div className={styles.info}>
        <div className={styles.types}>
          <div>{item.visitorType || 'その他'}</div>
          <div>
            <span className={cs.count}>{item.visitorRoomNumber || ''}</span>
            <FontAwesomeIcon icon={faHome} />
          </div>
        </div>

        <div className={styles.nickName}>{getName(item.nickName)}</div>

        <img src={StatusIcon[item.callStatus]} className={cs.status} alt={''} />

        {item.callStatus == '7' && (
          <>
            <div className={cs.second}>
              {Math.ceil(item.cancelTimeSecond / 1000)}秒
            </div>
            <div />
          </>
        )}

        <Lock
          show={item.callStatus == '0' && item.unLock}
          electronicLockFlag={electronicLockFlag}
        />

        {/* 显示 call user */}
        <CallUser show={hasSub} name={item.callUser || ' '} />
      </div>
    </BaseLayout>
  );
};

export const BaseVisitorLogEntitySimple: React.FC<any> = ({ item }) => {
  return (
    <BaseLayout
      date={item?._sort_date}
      isGary={item?.isExpire}
      footer={<ContentGrid item={item} />}
    >
      <Avatar item={item} />

      <div className={styles.info}>
        <div />
        <div className={styles.nickName}>{getName(item.nickName)}</div>
        <div className={styles.goHome}>さんが帰宅しました。</div>
      </div>
    </BaseLayout>
  );
};

export const BaseTemporaryVisitorLogEntity: React.FC<any> = ({
  item,
  onPreview,
  electronicLockFlag,
  hasSub,
  autoList,
}) => {
  return (
    <BaseLayout
      isGary={item?.isExpire}
      date={item?._sort_date}
      footer={
        autoList.length && item.autoResPattern ? (
          <>
            <ContentGrid item={item} />
            <Divider style={{ color: 'eff0f4' }} />
            <AutoRes item={item} autoList={autoList} />
          </>
        ) : (
          <ContentGrid item={item} />
        )
      }
    >
      <Avatar item={item} onPreview={onPreview} temporary />

      <div className={styles.info}>
        <div>顔登録無し</div>
        <img src={StatusIcon[item.callStatus]} className={cs.status} alt={''} />

        {item.callStatus == '6' && <span />}

        {item.callStatus == '7' && (
          <>
            <div className={cs.second}>
              {Math.ceil(item.cancelTimeSecond / 1000)}秒
            </div>
            <div />
          </>
        )}

        <Lock
          show={item.callStatus == '0' && item.unLock}
          electronicLockFlag={electronicLockFlag}
        />

        <CallUser show={hasSub} name={item.callUser || ' '} />
      </div>
    </BaseLayout>
  );
};

export const BaseChangeAutoRes: React.FC<any> = ({ item, autoList }) => {
  return (
    <BaseLayout
      isGary={item?.isExpire}
      date={item?._sort_date}
      footer={
        autoList.length && item.autoResPattern ? (
          <>
            <ContentGrid item={item} />
            <Divider style={{ color: 'eff0f4' }} />
            <div className={styles.noteWord}>
              次回来訪時には、インターホンが自動で対応します
            </div>
            <AutoRes item={item} autoList={autoList} />
          </>
        ) : (
          <ContentGrid item={item} />
        )
      }
    >
      <Avatar item={item} />

      <div className={styles.info}>
        <div className={styles.types}>{item.visitorType || 'その他'}</div>
        <div className={styles.nickName}>{getName(item.newName)}</div>
        {item.isBlackPrompt && (
          <div className={cs.refuse}>
            <img src={require('../../../assets/images/setting/im_block.png')} />
            着信拒否から
          </div>
        )}
        <div
          className={`${styles.statusIcon} flex align-items-center color-green`}
        >
          <FontAwesomeIcon
            icon={faVolumeUp}
            className={styles['margin-right-10']}
          />
          自動応答が設定されました。
        </div>
      </div>
    </BaseLayout>
  );
};

export const BaseChangeAutoResNot: React.FC<any> = ({ item }) => {
  return (
    <BaseLayout
      isGary={item?.isExpire}
      date={item?._sort_date}
      footer={<ContentGrid item={item} />}
    >
      <Avatar item={item} />

      <div className={styles.info}>
        <div className={styles.types}>{item.visitorType || 'その他'}</div>
        <div className={styles.nickName}>{getName(item.newName)}</div>
        <div
          className={`${styles.statusIcon} flex align-items-center color-blue`}
        >
          <FontAwesomeIcon
            icon={faVolumeUp}
            className={styles['margin-right-5']}
          />
          自動応答が解除されました。
        </div>
      </div>
    </BaseLayout>
  );
};

export const ContentGrid: React.FC<any> = ({ children, item = {} }) => {
  const [visible, setVisible] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { onRefresh } = useContext(TimeLineContext);

  const handleDownload = () => {
    setLoading(true);
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.callHandler(
        'js_call_native',
        {
          function_name: 'download_image',
          params: { image_url: item.portraitImageUrl },
        },
        function (response: any) {},
      );
    });
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteVisitorPic(item._id);
      Toast.show({
        content: '来訪者画像を削除しました',
        position: 'top',
      });
      setVisible(false);
      onRefresh(item._id);
    } catch (e) {
      Toast.show({
        content: '削除処理に失敗しました',
        position: 'top',
      });
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <>
      {loading ? <Loading /> : null}
      <>
        {children}
        {item.portraitImageUrl && item.callStatus != '99' ? (
          <div className={styles.rightColumn} onClick={() => setVisible(true)}>
            <div className={styles.portrait}>
              <img
                className={styles.thumbnail}
                src={item.portraitImageUrl}
                onError={() => setErr(true)}
              />
            </div>
            <div className={styles.viewIcon}>
              <img src={viewIcon} />
            </div>
          </div>
        ) : null}
      </>
      {visible ? (
        <PreviewPortal
          item={item}
          setVisible={setVisible}
          deleteLoading={deleteLoading}
          loading={loading}
          setLoading={setLoading}
          handleDelete={handleDelete}
          handleDownload={handleDownload}
          err={err}
        />
      ) : null}
    </>
  );
};

const PreviewPortal: React.FC<any> = ({
  setVisible,
  item,
  deleteLoading,
  handleDelete,
  handleDownload,
  loading,
  setLoading,
  err,
}) => {
  useEffect(() => {
    setupWebViewJavascriptBridge(function (bridge: any) {
      bridge.registerHandler('native_call_js', function (data: any) {
        setLoading(false);
        const req = JSON.parse(data);

        console.log('req: ', req);
        if (req.function_name == 'report_download_status') {
          if (String(req.params?.download_status) === '0') {
            Toast.show({
              content: '画像を保存しました',
            });
            // setTimeout(() => {
            //   setVisible(false);
            // });
          } else {
            Toast.show({
              content:
                '画像のダウンロードに失敗しました。しばらく経ってからもう一度お試し下さい。',
              position: 'top',
            });
          }
        }
      });
    });
  }, [setVisible]);

  const onDelete = () => {
    const handler = Dialog.show({
      header: (
        <div className="dialogHeaderWrapper">
          <WarnImg />
          <div className="close" onClick={() => handler?.close()} />
        </div>
      ),
      content: (
        <div className={styles.tipContent}>
          <div>
            この来訪者の<span>来訪時の写真</span>を<br />
            <span>削除</span>しますか？
          </div>
          <div>一度削除した写真は元に戻せません。</div>
        </div>
      ),
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
            className: 'bg-primary',
            onClick: async () => {
              await handleDelete();
            },
          },
        ],
      ],
    });
  };

  return ReactDOM.createPortal(
    <div className={styles.previewWrapper}>
      <div
        className={styles.TR}
        onClick={() => {
          setVisible(false);
        }}
      >
        閉じる
        <img src={closeIcon} />
      </div>
      <div className={styles.expireDate}>
        <span>
          この画像は
          {moment(item.portraitExpireDate).format('YYYY年MM月DD日')}
          に削除されます
        </span>
      </div>
      <ImageViewer
        image={item.portraitImageUrl}
        visible={true}
        onClose={() => {
          setTimeout(() => {
            setVisible(false);
          }, 200);
        }}
      />

      {deleteLoading ? (
        <div className={styles.BL}>
          <Loading />
        </div>
      ) : (
        <div className={styles.BL} onClick={onDelete}>
          <DeleteOutline />
          削除
        </div>
      )}
      {!err ? (
        loading ? (
          <VersionControl className={styles.BR}>
            <Loading />
          </VersionControl>
        ) : (
          <VersionControl className={styles.BR} onClick={handleDownload}>
            ダウンロード
            <img src={downloadIcon} />
          </VersionControl>
        )
      ) : null}
    </div>,
    document.getElementById('root')!,
  );
};
