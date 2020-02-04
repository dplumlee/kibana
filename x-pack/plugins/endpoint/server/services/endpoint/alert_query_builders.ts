/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { KibanaRequest } from 'kibana/server';
import { EndpointAppConstants } from '../../../common/types';
import { EndpointAppContext } from '../../types';

export const kibanaRequestToAlertListQuery = async (
  request: KibanaRequest<any, any, any>,
  endpointAppContext: EndpointAppContext
): Promise<Record<string, any>> => {
  const pagingProperties = await getPagingProperties(request, endpointAppContext);

  // Calculate minimum total hits set to indicate there's a next page
  const DEFAULT_TOTAL_HITS = 10000;

  const fromIdx = pagingProperties.pageIndex * pagingProperties.pageSize;
  const totalHitsMin = Math.max(fromIdx + pagingProperties.pageSize * 2, DEFAULT_TOTAL_HITS);

  return {
    body: {
      track_total_hits: totalHitsMin,
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
    from: fromIdx,
    size: pagingProperties.pageSize,
    index: EndpointAppConstants.ALERT_INDEX_NAME,
  };
};

async function getPagingProperties(
  request: KibanaRequest<any, any, any>,
  endpointAppContext: EndpointAppContext
) {
  const config = await endpointAppContext.config();
  const pagingProperties: { page_size?: number; page_index?: number } = {};

  if (request?.route?.method === 'get') {
    pagingProperties.page_index = request.query?.page_index;
    pagingProperties.page_size = request.query?.page_size;
  } else {
    pagingProperties.page_index = request.body?.page_index;
    pagingProperties.page_size = request.body?.page_size;
  }

  return {
    pageSize: pagingProperties.page_size || config.alertResultListDefaultPageSize,
    pageIndex: pagingProperties.page_index || config.alertResultListDefaultFirstPageIndex,
  };
}
