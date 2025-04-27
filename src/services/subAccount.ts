import request from '@/utils/request';

export async function getSubList() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/subaccount/info`, {
    method: 'GET',
  }).then((res: any) => {
    return res;
  });
}
export async function deleteSub(subId: string) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/subaccount/delete/${subId}`, {
    method: 'DELETE',
  }).then((res: any) => {
    return res;
  });
}

export async function changeStatusSub(
  subId: string,
  isAutoResRejection: boolean,
) {
  const userId = localStorage.getItem('userId');
  const status = isAutoResRejection ? 1 : 0;
  return request(
    `/v1/app_user/${userId}/subaccount/change_autores_status/${subId}/${status}`,
    {
      method: 'PUT',
    },
  ).then((res: any) => {
    return res;
  });
}

export async function addSubAccount(params: any) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/subaccount`, {
    method: 'POST',
    data: params,
  }).then((res: any) => {
    return res;
  });
}

export async function unlockSubAccount(subId: string) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/subaccount/unlock/${subId}`, {
    method: 'PUT',
  }).then((res: any) => {
    return res;
  });
}
