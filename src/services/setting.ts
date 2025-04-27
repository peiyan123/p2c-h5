import request from '@/utils/request';

export async function getTimeLineRejectionSetting() {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/timeline/rejection/setting`, {
    method: 'Get',
  }).then((res: any) => {
    return res;
  });
}

export async function timeLineRejectionSetting(status: string) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/timeline/rejection/setting`, {
    method: 'Post',
    data: status,
  }).then((res: any) => {
    return res;
  });
}

export async function getVisitorDetail(options?: {}) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/visitor/detail`, {
    method: 'GET',
    ...(options || {}),
  }).then((res: any) => {
    return res;
  });
}
