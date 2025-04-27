import React from 'react';
import styles from './index.less';
import backIcon from '@/assets/images/login/back.png';
import { history } from 'umi';

const Banner: React.FC = ({ children }) => {
  return (
    <div className={styles.banner}>
      <div className={styles.backIcon} onClick={() => history.goBack()}>
        <img src={backIcon} alt="" />
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
};

export default Banner;
