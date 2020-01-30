/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import {
  IClusterClient,
  IRouter,
  IScopedClusterClient,
  KibanaResponseFactory,
  RequestHandler,
  RequestHandlerContext,
  RouteConfig,
} from 'kibana/server';
import {
  elasticsearchServiceMock,
  httpServerMock,
  httpServiceMock,
  loggingServiceMock,
} from '../../../../../src/core/server/mocks';
import { AlertData, AlertResultList } from '../../common/types';
import { SearchResponse } from 'elasticsearch';
import { registerAlertRoutes } from './alerts';
import { EndpointConfigSchema } from '../config';
import * as data from '../test_data/all_alerts_data.json';

describe('test alerts route', () => {
  let routerMock: jest.Mocked<IRouter>;
  let mockResponse: jest.Mocked<KibanaResponseFactory>;
  let mockClusterClient: jest.Mocked<IClusterClient>;
  let mockScopedClient: jest.Mocked<IScopedClusterClient>;
  let routeHandler: RequestHandler<any, any, any>;
  let routeConfig: RouteConfig<any, any, any, any>;

  beforeEach(() => {
    mockClusterClient = elasticsearchServiceMock.createClusterClient() as jest.Mocked<
      IClusterClient
    >;
    mockScopedClient = elasticsearchServiceMock.createScopedClusterClient();
    mockClusterClient.asScoped.mockReturnValue(mockScopedClient);
    routerMock = httpServiceMock.createRouter();
    mockResponse = httpServerMock.createResponseFactory();
    registerAlertRoutes(routerMock, {
      logFactory: loggingServiceMock.create(),
      config: () => Promise.resolve(EndpointConfigSchema.validate({})),
    });
  });

  it('test find the latest of all alerts', async () => {
    const mockRequest = httpServerMock.createKibanaRequest({});

    const response: SearchResponse<AlertData> = (data as unknown) as SearchResponse<AlertData>;
    mockScopedClient.callAsCurrentUser.mockImplementationOnce(() => Promise.resolve(response));
    [routeConfig, routeHandler] = routerMock.post.mock.calls.find(([{ path }]) =>
      path.startsWith('/api/endpoint/alerts')
    )!;

    await routeHandler(
      ({
        core: {
          elasticsearch: {
            dataClient: mockScopedClient,
          },
        },
      } as unknown) as RequestHandlerContext,
      mockRequest,
      mockResponse
    );

    expect(mockScopedClient.callAsCurrentUser).toBeCalled();
    expect(routeConfig.options).toEqual({ authRequired: true });
    expect(mockResponse.ok).toBeCalled();
    const alertResultList = mockResponse.ok.mock.calls[0][0]?.body as AlertResultList;
    expect(alertResultList.total).toEqual(132);
    expect(alertResultList.request_page_index).toEqual(0);
    expect(alertResultList.request_page_size).toEqual(10);
  });

  it('test find the latest of all alerts with pagination params', async () => {
    const mockRequest = httpServerMock.createKibanaRequest({
      body: {
        paging_properties: [
          {
            page_size: 20,
          },
          {
            page_index: 2,
          },
        ],
      },
    });
    mockScopedClient.callAsCurrentUser.mockImplementationOnce(() =>
      Promise.resolve((data as unknown) as SearchResponse<AlertData>)
    );
    [routeConfig, routeHandler] = routerMock.post.mock.calls.find(([{ path }]) =>
      path.startsWith('/api/endpoint/alerts')
    )!;

    await routeHandler(
      ({
        core: {
          elasticsearch: {
            dataClient: mockScopedClient,
          },
        },
      } as unknown) as RequestHandlerContext,
      mockRequest,
      mockResponse
    );

    expect(mockScopedClient.callAsCurrentUser).toBeCalled();
    expect(routeConfig.options).toEqual({ authRequired: true });
    expect(mockResponse.ok).toBeCalled();
    const alertResultList = mockResponse.ok.mock.calls[0][0]?.body as AlertResultList;
    expect(alertResultList.alerts.length).toEqual(20);
    expect(alertResultList.total).toEqual(132);
    expect(alertResultList.request_page_index).toEqual(40);
    expect(alertResultList.request_page_size).toEqual(20);
  });
});
