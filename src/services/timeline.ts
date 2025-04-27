import request from '@/utils/request';

interface TimeLine {
  from: string;
  to: string;
}

interface getTimeBody {
  userId?: string;
  eventId: string;
}

export async function timeLine(body: TimeLine) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/room/timeline`, {
    method: 'Post',
    data: body,
  }).then((res: any) => {
    return res;
  });
}

export async function getExpirDay() {
  const userId = localStorage.getItem('userId');

  return request(
    `/v1/app_user/${userId}/variable/query?key=${'visitorFeatureReserveDays'}`,
    {
      method: 'GET',
      // params: {
      //   key: 'visitorFeatureReserveDays',
      // },
    },
  ).then((res: any) => {
    return res;
  });
}

export async function getClickTime(body: getTimeBody) {
  const userId = localStorage.getItem('userId');
  return request(`/v1/app_user/${userId}/event/${body.eventId}/click`, {
    method: 'Post',
    data: {
      userId,
      eventId: body.eventId,
    },
  }).then((res: any) => {
    return res;
  });
}

export async function deleteVisitorPic(id: string) {
  const userId = localStorage.getItem('userId');
  return request(`v1/app_user/${userId}/visitor/portrait`, {
    method: 'DELETE',
    params: { visitorLogId: id },
  });
}
