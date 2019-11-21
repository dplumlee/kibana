/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Dispatch, Action as ReduxAction } from 'redux';
import { userNavigated } from '../concerns/routing';

// TODO move these types elsewhere

interface ActionAndState<Action, State> {
  action: Action;
  state: State;
}

interface ActionsAndState<Action, State> {
  (): AsyncIterableIterator<ActionAndState<Action, State>>;
}

interface SagaParameter<Action, State> {
  actionsAndState: ActionsAndState<Action, State>;
  dispatch: (action: Action) => Action;
}

interface Saga<Action, State> {
  (actionsAndStateAsyncIteratorAndDispatch: SagaParameter<Action, State>): void;
}

/**
 * This must be used for `withPageNavigationStatus`
 */
export const routingSaga: Saga<
  TacoAction, // TODO needs to change,
  GlobalState
> = async function routingSaga({
  dispatch,
  actionsAndState,
}: {
  dispatch: Dispatch;
  actionsAndState: ActionsAndState<ReduxAction>;
}) {
  window.addEventListener('popstate', emit);
  emit();

  for await (const { action } of actionsAndState()) {
    if (action.type === 'LOCATION_CHANGE' && action.payload.action !== 'POP') {
      emit();
    }
  }

  function emit() {
    dispatch(userNavigated(window.location.href));
  }
};

// TODO: Type actionsAndState and isOnPage
export async function* withPageNavigationStatus({
  actionsAndState,
  isOnPage = function() {
    return false;
  },
}: {
  actionsAndState: ActionsAndState<TacoAction, GlobalState>; // NEED To CHANGE
  isOnPage?: (href: string) => boolean;
}): AsyncIterableIterator<UninitializedNavigationStatus | NavigationStatus> {
  // TODO: do we need userIsLoggedIn?
  let userIsOnPage = false;
  let userIsLoggedIn = false;
  let href: string | null | undefined = null;
  for await (const { action, state } of actionsAndState()) {
    // TODO: ignore location_change action?
    if (action.type === 'LOCATION_CHANGE') {
      continue;
    }
    const userWasLoggedIn = userIsLoggedIn;
    const userWasOnPageAndLoggedIn = userIsOnPage && userIsLoggedIn;
    const oldHref = href;

    userIsLoggedIn = state.get('user').get('isLoggedIn', false);
    href = state.get('saga');
    if (typeof href === 'string') {
      userIsOnPage = isOnPage(href);
    }

    const userIsOnPageAndLoggedIn = userIsOnPage && userIsLoggedIn;

    const authenticationStatusChanged = userWasLoggedIn !== userIsLoggedIn;

    if (typeof href === 'string') {
      yield {
        action,
        state,
        href,
        previousHref: typeof oldHref === 'undefined' ? null : oldHref,

        // indicates whether the href changed since the last action
        hrefChanged: href !== oldHref,

        authenticationStatusChanged,

        // indicates whether the user is on the page defined by `path` and logged in
        userIsOnPageAndLoggedIn,

        // `true` if `userIsOnPageAndLoggedIn` just became true for this action.
        shouldInitialize: userIsOnPageAndLoggedIn && userWasOnPageAndLoggedIn === false,
      };
    } else {
      yield {
        action,
        state,
        href: null,
        previousHref: null,

        // indicates whether the href changed since the last action
        hrefChanged: false,

        authenticationStatusChanged,

        // indicates whether the user is on the page defined by `path` and logged in
        userIsOnPageAndLoggedIn: false,

        // `true` if `userIsOnPageAndLoggedIn` just became true for this action.
        shouldInitialize: false,
      };
    }
  }
}

// TODO: type this properly, Should we use immutable?
// Dont think we need
function hrefFromState(state: any) {
  return state.saga;
}

interface AbstractNavigationStatus {
  action: TacoAction;
  state: GlobalState;
  authenticationStatusChanged: boolean;
}

interface UninitializedNavigationStatus extends AbstractNavigationStatus {
  href: null;
  previousHref: null;
  hrefChanged: false;
  userIsOnPageAndLoggedIn: false;
  shouldInitialize: false;
}

interface NavigationStatus extends AbstractNavigationStatus {
  href: string;
  previousHref: string | null;
  hrefChanged: boolean;
  userIsOnPageAndLoggedIn: boolean;
  shouldInitialize: boolean;
}
