/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { httpServerMock, loggingServiceMock } from '../../../../../../src/core/server/mocks';
import { EndpointConfigSchema } from '../../config';
import { getPagingProperties, kibanaRequestToAlertListQuery } from './alert_query_builders';

describe('test query builder', () => {
  describe('test query builder request processing', () => {
    it('test default query params for all alerts when no params or body is provided', async () => {
      const mockRequest = httpServerMock.createKibanaRequest({
        body: {},
      });
      const mockCtx = {
        logFactory: loggingServiceMock.create(),
        config: () => Promise.resolve(EndpointConfigSchema.validate({})),
      };
      const queryParams = await getPagingProperties(mockRequest, mockCtx);
      const query = await kibanaRequestToAlertListQuery(queryParams, mockCtx);

      expect(query).toEqual({
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
          track_total_hits: 10000,
        },
        from: 0,
        size: 10,
        index: 'my-index',
      } as Record<string, any>);
    });
    // TODO: add tests for calculating track_total_hits
  });
});
