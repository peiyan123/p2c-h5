import React, { CSSProperties, useEffect, useState } from 'react';
import { Divider, SpinLoading } from 'antd-mobile';
import { history } from 'umi';
import styles from './index.less';
import defaultIcon from '../../assets/images/visitor/avatar_default.png';
import orangeIcon from '../../assets/images/visitor/avatar_orange_default.png';
import addIcon from '../../assets/images/visitor/badge_add.png';
import orangeAddIcon from '../../assets/images/visitor/badge_orange_add.png';
import { getVisitor } from '@/services/visitor';
import { handleTypeColor } from '@/utils/common';
import { Wrapper } from '@/layout/wrapper';
import { DisturbMode } from '@/layout';
import { BaseAvatar } from '@/components/avatar';
import { Cell } from 'react-vant';
import icBlock from '@/assets/images/visitor/ic_block.png';
import { useRequest } from '@@/plugin-request/request';
import { listFaces } from '@/services/face';
import { first } from 'lodash';
import { Arrow } from '@react-vant/icons';

interface ItemType {
  newFlag: boolean;
  visitorId: string | number;
  smallImageUrl: string;
  autoRes: boolean;
  visitorType: string;
  visiteNumber: number;
  nickName: string;
  colorFlag: string;
  stayBhdMode: boolean;
  bindAccount: boolean;
}

const BG_ICON = {
  gray: defaultIcon,
  orange: orangeIcon,
};

const ADD_ICON = {
  gray: addIcon,
  orange: orangeAddIcon,
};

const DefaultItem: React.FC<{
  color: string;
  onClick?: () => void;
  show?: boolean;
  style?: CSSProperties;
}> = ({ color = 'gray', onClick, show = false, style }) => {
  const handleClick = () => {
    if (!show) return;
    onClick?.();
  };
  return (
    <div className={`${styles.item}`} onClick={handleClick} style={style}>
      <img
        className={`${styles.icon} bd-${color}`}
        src={BG_ICON[color]}
        alt=""
      />
      {show ? (
        <img src={ADD_ICON[color]} className={styles.add} alt="" />
      ) : null}
    </div>
  );
};

const Visitor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [delivery, setDelivery] = useState<any[]>([]);
  const [family, setFamily] = useState<any[]>([]);
  const [other, setOther] = useState<any[]>([]);
  const [resident, setResident] = useState<any[]>([]);
  const [myself, setMyself] = useState<any[]>([]);

  const { data } = useRequest<{ data: any[] }>(listFaces);

  useEffect(() => {
    visitor();
  }, []);

  const visitor = async () => {
    setLoading(true);
    try {
      let data = (await getVisitor()) || [];
      const residentArr: any[] = [];
      const deliveryArr: any[] = [];
      const familyArr: any[] = [];
      const otherArr: any[] = [];
      const myselfArr: any[] = [];
      data.map((item: ItemType) => {
        switch (item.visitorType) {
          case 'あなた':
            myselfArr.push(item);
            break;
          case '居住者':
            residentArr.push(item);
            break;
          case 'その他':
            otherArr.push(item);
            break;
          case '配送・デリバリー業者':
            deliveryArr.push(item);
            break;
          case '家族友人':
            familyArr.push(item);
            break;
          default:
            otherArr.push(item);
            break;
        }
      });
      setMyself(myselfArr);
      setDelivery(deliveryArr);
      setFamily(familyArr);
      setOther(otherArr);
      setResident(residentArr);
    } finally {
      setLoading(false);
    }
  };

  const Item = (props: ItemType) => {
    const {
      newFlag,
      visitorId,
      smallImageUrl,
      autoRes,
      nickName,
      colorFlag,
      visitorType,
      stayBhdMode,
      bindAccount,

      blackStatus,
    } = props;

    return (
      <div
        className={styles.item}
        onClick={() => history.push(`/visitor/detail/${visitorId}`)}
      >
        <BaseAvatar
          avatar={smallImageUrl}
          color={colorFlag}
          binded={bindAccount}
          autoRes={autoRes && visitorType !== 'あなた'}
          block={blackStatus}
          newer={newFlag}
          mode={stayBhdMode}
        />
      </div>
    );
  };

  const jump = () => {
    localStorage.setItem('rejectLoacaion', 'visitor');
    history.push('/visitor/reject');
  };

  const toVisitorRecord = () => {
    history.push('/visitor/history');
  };

  return (
    <Wrapper
      nav={
        <div className="header">
          <div className={'pt5'}>来訪者一覧</div>
          <DisturbMode refresh={visitor} />
        </div>
      }
    >
      <div className={`${styles.visitor}`}>
        {loading ? (
          <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
        ) : (
          <>
            <div className={`${styles.list}`}>
              <div className={styles.type}>
                あなた{' '}
                {JSON.parse(localStorage.getItem('electronicLockFlag')!) && (
                  <span className={styles.tip}>
                    顔認証によりエントランスが解錠されます
                  </span>
                )}
              </div>
              <div
                className={`${styles.box} flex`}
                style={myself.length > 0 ? {} : { background: '#fff' }}
              >
                {myself.length ? (
                  myself.map((item: any) => {
                    return (
                      <Item
                        {...item}
                        key={item.visitorId}
                        colorFlag={handleTypeColor('あなた')}
                      />
                    );
                  })
                ) : (
                  <>
                    <DefaultItem
                      onClick={toVisitorRecord}
                      show={String(first(data)?.faceStatus) !== '0'}
                      color={handleTypeColor('あなた')}
                      style={{ marginBottom: 0 }}
                    />
                    {String(first(data)?.faceStatus) !== '0' ? (
                      <div
                        className={styles.extraGuide}
                        onClick={toVisitorRecord}
                      >
                        <div>あなたの顔を登録します</div>
                        <Arrow style={{ width: '1rem', height: '1.5rem' }} />
                      </div>
                    ) : (
                      <div className={styles.extraDesc}>
                        <div>あなたの顔を登録中です</div>
                        <div>しばらくお待ちください</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <Divider className={styles.divider} />
            <div className={`${styles.list}`}>
              <div className={styles.type}>
                居住者{' '}
                {JSON.parse(localStorage.getItem('electronicLockFlag')!) && (
                  <span className={styles.tip}>
                    顔認証によりエントランスが解錠されます
                  </span>
                )}
              </div>
              <div className={`${styles.box} flex`}>
                {resident.length ? (
                  resident.map((item: any) => {
                    return (
                      <Item
                        {...item}
                        key={item.visitorId}
                        colorFlag={handleTypeColor('居住者')}
                      />
                    );
                  })
                ) : (
                  <DefaultItem />
                )}
              </div>
            </div>
            <Divider className={styles.divider} />
            <div className={`${styles.list}`}>
              <div className={styles.type}>配送・デリバリー業者</div>
              <div className={`${styles.box} flex`}>
                {delivery.length ? (
                  delivery.map((item: any) => {
                    return (
                      <Item
                        {...item}
                        key={item.visitorId}
                        colorFlag={handleTypeColor('配送・デリバリー業者')}
                      />
                    );
                  })
                ) : (
                  <DefaultItem />
                )}
              </div>
            </div>
            <Divider className={styles.divider} />
            <div className={`${styles.list}`}>
              <div className={styles.type}>家族·友人</div>
              <div className={`${styles.box} flex`}>
                {family.length ? (
                  family.map((item: any) => {
                    return (
                      <Item
                        {...item}
                        key={item.visitorId}
                        colorFlag={handleTypeColor('家族友人')}
                      />
                    );
                  })
                ) : (
                  <DefaultItem />
                )}
                {/* <div className={ `${styles.item} ${styles.tag} `}>
              <img className={ `${styles.icon} border-primary` } src="" alt="" />
            </div>
            <div className={ `${styles.item} ${styles.tag} `}>
              <img className={ `${styles.icon} border-primary` } src="" alt="" />
            </div>
            <div className={ `${styles.item} `}>
              <img className={ `${styles.icon} border-primary` } src="" alt="" />
            </div> */}
              </div>
            </div>
            <Divider className={styles.divider} />
            <div className={`${styles.list}`}>
              <div className={styles.type}>その他</div>
              <div className={`${styles.box} flex`}>
                {other.length ? (
                  other.map((item: ItemType) => {
                    return (
                      <Item
                        {...item}
                        key={item.visitorId}
                        colorFlag={handleTypeColor('その他')}
                      />
                    );
                  })
                ) : (
                  <DefaultItem />
                )}
              </div>
            </div>

            <Divider className={styles.dividerLast} />

            {/*            <Cell.Group card>
              <Cell
                title={
                  <div style={{ color: '#404040' }}>新規来訪者の顔登録</div>
                }
                icon={
                  <div>
                    <img src={newVisitor} className={styles.cellIcon} />
                  </div>
                }
                isLink
                onClick={toVisitorRecord}
              />
            </Cell.Group>*/}

            <Cell.Group card className={styles.mt15}>
              <Cell
                title={<div style={{ color: '#F55C4F' }}>着信拒否一覧</div>}
                icon={
                  <div>
                    <img src={icBlock} className={styles.cellIcon} />
                  </div>
                }
                isLink
                onClick={jump}
              />
            </Cell.Group>
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default Visitor;
