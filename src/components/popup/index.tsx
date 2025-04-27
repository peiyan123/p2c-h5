import { Divider, Popup } from 'antd-mobile';
import styles from './index.less';
import { CloseOutline } from 'antd-mobile-icons';
interface propsType {
  visible: boolean;
  setVisible: Function;
  contentSlot?: Object;
  url?: string;
}
const CustomPopup = (props: propsType) => {
  const { visible, setVisible, contentSlot, url } = props;
  return (
    <Popup
      visible={visible}
      onMaskClick={() => {
        setVisible(false);
      }}
      className={styles.basePopup}
      bodyStyle={{ height: '95vh' }}
    >
      {/*<div>*/}
      <div className={styles.popupHeader}>
        <div
          className={`${styles.font16} ${styles.mr10} color-primary`}
          onClick={() => {
            setVisible(false);
          }}
        >
          閉じる
        </div>
        <div
          className={styles.close}
          onClick={() => {
            setVisible(false);
          }}
        >
          <CloseOutline color="var(--adm-color-primary)" />
        </div>
      </div>

      <Divider style={{ margin: 0 }}></Divider>
      <div className={styles.popupContent}>
        {url ? (
          <iframe
            className={styles.iframe}
            sandbox="allow-scripts allow-forms allow-same-origin"
            src={url}
            frameBorder="0"
          ></iframe>
        ) : (
          <div className={styles.content}>{contentSlot}</div>
        )}
      </div>
      {/*</div>*/}
    </Popup>
  );
};

export default CustomPopup;
