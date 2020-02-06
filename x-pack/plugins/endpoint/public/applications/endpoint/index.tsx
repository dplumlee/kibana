/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import * as React from 'react';
import ReactDOM from 'react-dom';
import { CoreStart, AppMountParameters } from 'kibana/public';
import { I18nProvider, FormattedMessage } from '@kbn/i18n/react';
import { Route, Switch, Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { createBrowserHistory } from 'history';
import { appStoreFactory } from './store';
import { AlertIndex } from './view/alerts';
import { EndpointAppHistory } from './types';

/**
 * This module will be loaded asynchronously to reduce the bundle size of your plugin's main bundle.
 */
export function renderApp(coreStart: CoreStart, { appBasePath, element }: AppMountParameters) {
  coreStart.http.get('/api/endpoint/hello-world');
  const history: EndpointAppHistory = createBrowserHistory({ basename: appBasePath });
  const [store, stopSagas] = appStoreFactory(coreStart, history);

  ReactDOM.render(<AppRoot store={store} history={history} />, element);

  return () => {
    ReactDOM.unmountComponentAtNode(element);
    stopSagas();
  };
}

interface RouterProps {
  history: EndpointAppHistory;
  store: Store;
}

const AppRoot: React.FunctionComponent<RouterProps> = React.memo(({ history, store }) => (
  <Provider store={store}>
    <I18nProvider>
      <Router history={history}>
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <h1 data-test-subj="welcomeTitle">
                <FormattedMessage id="xpack.endpoint.welcomeTitle" defaultMessage="Hello World" />
              </h1>
            )}
          />
          <Route
            path="/management"
            render={() => {
              // FIXME: This is temporary. Will be removed in next PR for endpoint list
              store.dispatch({ type: 'userEnteredEndpointListPage' });

              return (
                <h1 data-test-subj="endpointManagement">
                  <FormattedMessage
                    id="xpack.endpoint.endpointManagement"
                    defaultMessage="Manage Endpoints"
                  />
                </h1>
              );
            }}
          />
          <Route path="/alerts" component={AlertIndex} />
          <Route
            render={() => (
              <FormattedMessage id="xpack.endpoint.notFound" defaultMessage="Page Not Found" />
            )}
          />
        </Switch>
      </Router>
    </I18nProvider>
  </Provider>
));
