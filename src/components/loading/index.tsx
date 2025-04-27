import { SpinLoading } from 'antd-mobile';
import styles from './index.less';

const Loading = () => {
  return (
    <>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <SpinLoading color="primary" className={styles.pos} />
      </div>
    </>
  );
};

export default Loading;
