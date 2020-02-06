/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Dispatch, MiddlewareAPI } from 'redux';
import { CoreStart } from 'kibana/public';
import { History } from 'history';
import { AlertListState } from './store/alerts';
import { EndpointListState } from './store/endpoint_list';
import { AppAction } from './store/action';

export type MiddlewareFactory = (
  coreStart: CoreStart,
  history: History
) => {
  middleware: (
    api: MiddlewareAPI<Dispatch<AppAction>, GlobalState>
  ) => (next: Dispatch<AppAction>) => (action: AppAction) => unknown;
  start?: () => void;
};

export interface GlobalState {
  readonly endpointList: EndpointListState;
  readonly alertList: AlertListState;
}

// We have no need to pass state through the Browser History at the moment
export type EndpointAppHistory = History<never>;
