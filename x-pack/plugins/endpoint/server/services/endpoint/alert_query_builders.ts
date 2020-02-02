/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import qs from 'querystring';
import { KibanaRequest } from 'kibana/server';
import { EndpointAppConstants } from '../../../common/types';
import { EndpointAppContext } from '../../types';

export const kibanaRequestToAlertListQuery = async (
  request: KibanaRequest<any, any, any>,
  endpointAppContext: EndpointAppContext
): Promise<Record<string, any>> => {
  const pagingProperties = await getPagingProperties(request, endpointAppContext);
  return {
    body: {
      query: {
        match_all: {},
      },
      sort: [
        {
          '@timestamp': {
            order: 'desc',
          },
        },
      ],
    },
    from: pagingProperties.pageIndex * pagingProperties.pageSize,
    size: pagingProperties.pageSize,
    index: EndpointAppConstants.ALERT_INDEX_NAME,
  };
};

async function getPagingProperties(
  request: KibanaRequest<any, any, any>,
  endpointAppContext: EndpointAppContext
) {
  const config = await endpointAppContext.config();
  let pagingProperties: { page_size?: number; page_index?: number } = {};

  if (request?.route?.method === 'get') {
    if (typeof request?.url?.query === 'string') {
      const qp = qs.parse(request.url.query);
      pagingProperties.page_size = Number(qp.page_size);
      pagingProperties.page_index = Number(qp.page_index);
    } else if (request?.url?.query) {
      pagingProperties = request.url.query;
    }
  } else {
    if (request?.body?.paging_properties) {
      for (const property of request.body.paging_properties) {
        Object.assign(
          pagingProperties,
          ...Object.keys(property).map(key => ({ [key]: property[key] }))
        );
      }
    }
  }

  return {
    pageSize: pagingProperties.page_size || config.alertResultListDefaultPageSize,
    pageIndex: pagingProperties.page_index || config.alertResultListDefaultFirstPageIndex,
  };
}
