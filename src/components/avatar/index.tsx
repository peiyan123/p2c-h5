import React, { ReactNode } from 'react';
import defaultAvatar from '../../assets/images/visitor/avatar_default.png';
import styles from './index.less';

export const BaseAvatar: React.FC<{
  avatar: string;
  className?: string;
  newer?: boolean;
  autoRes?: boolean;
  binded?: boolean;
  mode?: boolean;
  color?: string;
  block?: string;
  home?: ReactNode;
}> = ({
  avatar,
  className,
  newer,
  autoRes,
  binded,
  mode,
  color,
  block,
  home,
}) => {
  return (
    <div className={styles.avatarContainer}>
      <div className={`${styles.avatar} ${className} bd-${color}`}>
        <img src={avatar || defaultAvatar} alt="" />
      </div>

      {newer ? <div className={styles.newIcon} /> : null}
      {autoRes ? <div className={styles.responseIcon} /> : null}
      {block ? <div className={styles.blockIcon} /> : null}
      {binded ? <div className={`${styles.reg}`} /> : null}
      {binded ? (
        mode ? (
          <div className={styles.abnormal} />
        ) : (
          <div className={styles.normal} />
        )
      ) : null}
      {home}
    </div>
  );
};
