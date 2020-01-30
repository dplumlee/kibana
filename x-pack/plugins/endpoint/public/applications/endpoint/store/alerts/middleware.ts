/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// import { AlertData, ImmutableArray } from '../../../../../common/types';
import qs from 'querystring';
import { AppAction } from '../action';
import { MiddlewareFactory } from '../../types';

export const alertMiddlewareFactory: MiddlewareFactory = coreStart => {
  interface Params {
    paging_properties: object[];
  }

  const params: Params = {
    paging_properties: [],
  };

  const qp = qs.parse(window.location.search.slice(1));
  if ('page_size' in qp && typeof qp.page_size === 'string') {
    const pageSize: number = parseInt(qp.page_size, 10);
    params.paging_properties.push({ page_size: pageSize });
  }
  if ('page_index' in qp && typeof qp.page_index === 'string') {
    const pageIndex: number = parseInt(qp.page_index, 10);
    params.paging_properties.push({ page_index: pageIndex });
  }

  return api => next => async (action: AppAction) => {
    next(action);
    if (action.type === 'userNavigatedToPage' && action.payload === 'alertsPage') {
      const response = await coreStart.http.post('/api/endpoint/alerts', {
        body: JSON.stringify(params),
      });
      api.dispatch({ type: 'serverReturnedAlertsData', payload: response });
    }
  };
};
