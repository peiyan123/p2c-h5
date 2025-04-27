import React from 'react';
import { Popup } from 'antd-mobile';

const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');
import { CloseOutline } from 'antd-mobile-icons';
import styles from './index.less';

interface propsType {
  visible: boolean;
  setVisible: Function;
  imgUrl?: string;
  time: any;
  nickName: string;
}

const ImgView = (props: propsType) => {
  const { visible, setVisible, imgUrl, nickName, time } = props;
  return (
    <Popup
      visible={visible}
      bodyStyle={{
        height: '100vh',
        backgroundColor: 'rgba(0,0,0)',
        color: '#fff',
      }}
    >
      <div className={styles.preview}>
        <div className={styles.popHeader}>
          <CloseOutline fontSize={24} onClick={() => setVisible(false)} />
          <div>
            <h4>{nickName || '未登録者'}</h4>
            <span>
              {time
                ? moment(time).format('YYYY/MM/DD HH:mm')
                : moment(new Date()).format('YYYY/MM/DD HH:mm')}
            </span>
          </div>
        </div>
        <img src={imgUrl} className={styles.imglarge} />
      </div>
    </Popup>
  );
};

export default ImgView;
