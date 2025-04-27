import React from 'react';
import styles from './index.less';
import Banner from '@/components/banner';
import { AvatarRegister } from '@/pages/visitor/history/components/Steps';

const VisitorHistory: React.FC = () => {
  return (
    <div className={styles.h100}>
      <Banner>
        <h1 className={styles.title}>顔登録</h1>
      </Banner>

      <AvatarRegister />
    </div>
  );
};

export default VisitorHistory;
