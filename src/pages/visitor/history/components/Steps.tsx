import React, { useEffect, useState } from 'react';
import {
  AVATAR_STATUS,
  DefaultDesc,
  PendingDesc,
  RejectedDesc,
  RetryStep,
  ResolvedStep,
  TimeoutStep,
} from '@/pages/visitor/history/components/Desc';
import { DefaultStep } from '@/pages/visitor/history/components/DefaultStep';
import { history } from 'umi';
import { listFaces } from '@/services/face';
import { filter, first } from 'lodash';
import { getVisitor } from '@/services/visitor';

export const AvatarRegister: React.FC = () => {
  const { query } = history.location;
  const [status, setStatus] = useState(() => Number(query?.type) || 0);
  const [enable, setEnable] = useState(false);
  const [notSelf, setNotSelf] = useState(false);

  useEffect(() => {
    if ([AVATAR_STATUS.RETRY, AVATAR_STATUS.REJECTED].includes(status)) {
      listFaces().then((res) => {
        const { data } = res;
        setEnable(String(first(data as any[])?.faceStatus) !== '0');
      });

      getVisitor().then((res) => {
        setNotSelf(
          filter(res, (item) => item.visitorType === 'あなた').length <= 0,
        );
      });
    }
  }, [status]);

  switch (status) {
    case AVATAR_STATUS.RETRY:
      return <RetryStep onChange={setStatus} enable={notSelf && enable} />;
    case AVATAR_STATUS.RESOLVED:
      return <ResolvedStep />;
    case AVATAR_STATUS.REJECTED:
      return <RejectedDesc onChange={setStatus} enable={notSelf && enable} />;
    case AVATAR_STATUS.TIMEOUT:
      return <TimeoutStep />;
    case AVATAR_STATUS.PENDING:
      return <PendingDesc onChange={setStatus} />;
    default:
      return <DefaultStep desc={<DefaultDesc />} onChange={setStatus} />;
  }
};
