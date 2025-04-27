import styles from '@/pages/visitor/detail/index.less';
import React, { useState } from 'react';
import ImgView from '@/components/imgview';
import { Input } from 'antd-mobile';
import { BaseAvatar } from '@/components/avatar';

export const ContentEdit: React.FC<{
  content?: string;
  color: string;
  onConfirm: (v: string) => void;
  editable?: boolean;
}> = ({ content, color, onConfirm, editable }) => {
  return (
    <Input
      readOnly={!editable}
      className={`${styles.nickName} bd-${color} ${
        editable ? styles.nickNameFocus : ''
      }`}
      onChange={(v) => onConfirm(v)}
      value={content}
      maxLength={30}
      placeholder={'未登録者'}
    />
  );
};

export const UserHeader: React.FC<any> = ({
  color = 'orange',
  user = {},
  editable = false,
  chooseImg,
  onChange,
  isEdit = false,
  value = '未登録者',
  bindAccount = false,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div className={`${styles.headerBackColor} bg-${color}`} />
      <div className={styles.headerInfo}>
        <div className={styles.headerIcon}>
          <div
            className={styles.headerBox}
            onClick={() => {
              if (isEdit) return;
              setVisible(true);
            }}
          >
            <BaseAvatar
              avatar={user.smallImageUrl}
              color={color}
              binded={bindAccount}
              mode={user.stayBhdMode}
              autoRes={user.autoAnswer}
              block={user.blackStatus}
            />

            {editable ? (
              <div
                className={styles.editAvatar}
                onClick={(e) => {
                  e.stopPropagation();
                  chooseImg?.();
                }}
              >
                <img
                  src={require('../../../../assets/images/visitor/pen-to-square-solid.png')}
                />
              </div>
            ) : null}
          </div>

          <ContentEdit
            editable={isEdit}
            content={value}
            color={color}
            onConfirm={(v) => {
              onChange?.(v);
            }}
          />
        </div>
      </div>
      <ImgView
        visible={visible}
        setVisible={setVisible}
        nickName={user.nickName}
        time={user.maxTime}
        imgUrl={user.largeImageUrl}
      />
    </>
  );
};
