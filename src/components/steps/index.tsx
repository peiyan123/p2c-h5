import styles from './index.less';
const Steps = (props: any) => {
  const { current } = props;
  const menu = [
    '電話番号入力',
    '認証コード入力',
    '利用規約とプライバシーポリシーに同意します',
    '本人確認完了',
  ];
  return (
    <div className={styles.steps}>
      {menu.map((item, index) => {
        if (current >= index) {
          return (
            <div className={`${styles.item} ${styles.active}`} key={item}>
              <div className={styles.number}>{index + 1}</div>
              {/* <div className={styles.text}>{item}</div> */}
            </div>
          );
        } else {
          return (
            <div className={styles.item} key={item}>
              <div className={styles.number}>{index + 1}</div>
              {/* <div className={styles.text}>{item}</div>  */}
            </div>
          );
        }
      })}
    </div>
  );
};

export default Steps;
