import styles from './img.less';

export const WarnImg = () => {
  return (
    <div className={styles.wrapper}>
      <img src={require('../../assets/images/mark.png')} />
    </div>
  );
};
