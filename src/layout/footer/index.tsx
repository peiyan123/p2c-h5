import { TabBar } from 'antd-mobile';
import { useHistory, useLocation } from 'react-router-dom';

import TimeLineOn from '../../assets/images/footer/timeline_on.png';
import TimeLineOff from '../../assets/images/footer/timeline_off.png';
import OtherOn from '../../assets/images/footer/other_on.png';
import OtherOff from '../../assets/images/footer/other_off.png';
import FaceListOn from '../../assets/images/footer/facelist_on.png';
import FaceListOff from '../../assets/images/footer/facelist_off.png';
import SettingOff from '../../assets/images/footer/setting_off.png';
import SettingOn from '../../assets/images/footer/setting_on.png';

export default (props: any) => {
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  const setRouteActive = (value: string) => {
    history.push(value);
  };
  const tabs = [
    {
      key: '/timeline',
      title: 'タイムライン',
      icon: (active: boolean) =>
        active ? (
          <img className="footer-icon" src={TimeLineOn} alt="" />
        ) : (
          <img className="footer-icon" src={TimeLineOff} alt="" />
        ),
    },
    {
      key: `/visitor`,
      title: '来訪者一覧',
      icon: (active: boolean) =>
        active ? (
          <img className="footer-icon" src={FaceListOn} alt="" />
        ) : (
          <img className="footer-icon" src={FaceListOff} alt="" />
        ),
    },
    {
      key: '/setting',
      title: '設定',
      icon: (active: boolean) =>
        active ? (
          <img className="footer-icon" src={SettingOn} alt="" />
        ) : (
          <img className="footer-icon" src={SettingOff} alt="" />
        ),
    },
    {
      key: '/other',
      title: 'その他',
      icon: (active: boolean) => (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {active ? (
            <img className="footer-icon" src={OtherOn} alt="" />
          ) : (
            <img className="footer-icon" src={OtherOff} alt="" />
          )}
        </div>
      ),
    },
  ];

  return (
    <TabBar
      activeKey={`/${pathname.split('/')[1]}`}
      onChange={(value) => setRouteActive(value)}
    >
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
};
