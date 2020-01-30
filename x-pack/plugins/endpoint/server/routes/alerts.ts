/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { IRouter } from 'kibana/server';
import { SearchResponse } from 'elasticsearch';
import { schema } from '@kbn/config-schema';

import { kibanaRequestToAlertListQuery } from '../services/endpoint/alert_query_builders';
import { AlertData, AlertResultList } from '../../common/types';
import { EndpointAppContext } from '../types';

export function registerAlertRoutes(router: IRouter, endpointAppContext: EndpointAppContext) {
  router.post(
    {
      path: '/api/endpoint/alerts',
      validate: {
        body: schema.nullable(
          schema.object({
            paging_properties: schema.arrayOf(
              // FIXME: This structure is weird, but it will change when the following bug is fixed:
              // https://github.com/elastic/kibana/issues/54843
              schema.oneOf([
                // the number of results to return for this request per page
                schema.object({
                  page_size: schema.number({ defaultValue: 10, min: 1, max: 10000 }),
                }),
                // the index of the page to return
                schema.object({
                  page_index: schema.number({ defaultValue: 0, min: 0 }),
                }),
              ])
            ),
          })
        ),
      },
      options: { authRequired: true },
    },
    async (context, req, res) => {
      try {
        const queryParams = await kibanaRequestToAlertListQuery(req, endpointAppContext);
        const response = (await context.core.elasticsearch.dataClient.callAsCurrentUser(
          'search',
          queryParams
        )) as SearchResponse<AlertData>;
        return res.ok({ body: mapToAlertResultList(queryParams, response) });
      } catch (err) {
        return res.internalError({ body: err });
      }
    }
  );
}

function mapToAlertResultList(
  queryParams: Record<string, any>,
  searchResponse: SearchResponse<AlertData>
): AlertResultList {
  interface Total {
    value: number;
    relation: string;
  }

  let totalNumberOfAlerts: number = 0;
  let totalIsLowerBound: boolean = false;

  // HACK: because of mismatch in elasticsearch type versions
  if (typeof searchResponse?.hits?.total === 'object') {
    const total: Total = searchResponse?.hits?.total as Total;
    totalNumberOfAlerts = total?.value || 0;
    totalIsLowerBound = total?.relation === 'gte' || false;
  } else {
    totalNumberOfAlerts = searchResponse?.hits?.total || 0;
  }

  if (totalIsLowerBound) {
    // TODO: handle this
  }

  if (searchResponse.hits.hits.length > 0) {
    return {
      request_page_size: queryParams.size,
      request_page_index: queryParams.from,
      alerts: searchResponse.hits.hits.map(entry => entry._source),
      total: totalNumberOfAlerts,
    };
  } else {
    return {
      request_page_size: queryParams.size,
      request_page_index: queryParams.from,
      total: totalNumberOfAlerts,
      alerts: [],
    };
  }
}
