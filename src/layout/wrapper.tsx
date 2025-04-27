import styles from '@/layout/index.less';
import React, { PropsWithChildren, ReactNode } from 'react';
import { useSelector } from 'umi';
import { GlobalState, RootState } from '@/models/typings';

export const Wrapper: React.FC<
  PropsWithChildren<{ nav?: ReactNode; className?: string }>
> = ({ nav, children, className = '' }) => {
  const { mode } = useSelector<RootState, GlobalState>((state) => state.global);

  return (
    <>
      {nav ? (
        <div
          className={
            mode === undefined
              ? ''
              : mode
              ? styles.abnormalLine
              : styles.normalLine
          }
        >
          {nav}
        </div>
      ) : null}
      <div className={`${styles.pageBody} ${className}`}>{children}</div>
    </>
  );
};
