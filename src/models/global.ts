import { GlobalState } from '@/models/typings';
import { Effect, Reducer } from 'umi';
import { getUser, updateMode } from '@/services/common';
import { get } from 'lodash';

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalState;
  effects: {
    init: Effect;
    switchMode: Effect;
  };
  reducers: {
    merge: Reducer<GlobalState>;
    toggle: Reducer<GlobalState>;
  };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',
  state: {},
  effects: {
    *init({ payload = {} }, { call, put }) {
      const data: GlobalState = yield call(getUser);
      yield put({
        type: 'merge',
        payload: { mode: !!get(data, ['stayBhdMode']) },
      });
    },
    *switchMode({ payload = {} }, { call, put }) {
      const data: GlobalState = yield call(updateMode, payload.status);

      yield put({
        type: 'merge',
        payload: data,
      });
    },
  },
  reducers: {
    merge(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    toggle(state, action) {
      return {
        ...state,
        mode: !state?.mode,
      };
    },
  },
};

export default GlobalModel;
