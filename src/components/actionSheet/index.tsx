import styles from './index.less';
import { Button, Popup } from 'antd-mobile';
import React, { useState } from 'react';

export const BaseActionSheet: React.FC<any> = ({ children, content }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Popup
        visible={visible}
        bodyStyle={{ height: '50vh' }}
        className={styles.basePopup}
        onMaskClick={() => setVisible(false)}
      >
        <div className={styles.baseBody}>
          {content}

          <Button
            onClick={() => {
              setVisible(false);
            }}
            className={styles.cancelButton}
          >
            キャンセル
          </Button>
        </div>
      </Popup>
      {React.cloneElement(children, { onClick: () => setVisible(true) })}
    </>
  );
};
