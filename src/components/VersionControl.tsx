import React from 'react';
import { gt } from '@/utils';
import { omit } from 'lodash';

export const VersionControl: React.FC<any> = (props) => {
  const handleClick = () => {
    gt('3.1.0')
      .then(() => {
        props.onClick();
      })
      .catch((e) => console.error(e));
  };
  return (
    <div {...omit(props, ['children', 'onClick'])} onClick={handleClick}>
      {props.children}
    </div>
  );
};
