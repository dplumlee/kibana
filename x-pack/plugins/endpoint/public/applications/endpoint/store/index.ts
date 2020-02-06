/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { createStore, compose, applyMiddleware, Store } from 'redux';
import { CoreStart } from 'kibana/public';
import { appSagaFactory } from './saga';
import { appReducer } from './reducer';
import { alertMiddlewareFactory } from './alerts/middleware';
import { routingMiddlewareFactory } from './routing/middleware';
import { EndpointAppHistory } from '../types';

const composeWithReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'EndpointApp' })
  : compose;

export const appStoreFactory = (
  coreStart: CoreStart,
  history: EndpointAppHistory
): [Store, () => void] => {
  const sagaReduxMiddleware = appSagaFactory(coreStart);
  const routingMiddleware = routingMiddlewareFactory(coreStart, history);
  const store = createStore(
    appReducer,
    composeWithReduxDevTools(
      applyMiddleware(
        routingMiddleware.middleware,
        alertMiddlewareFactory(coreStart, history).middleware,
        appSagaFactory(coreStart)
      )
    )
  );
  if (routingMiddleware.start !== undefined) {
    routingMiddleware.start();
  }
  sagaReduxMiddleware.start();
  return [store, sagaReduxMiddleware.stop];
};
