/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AlertData } from '../../../../../common/types';

export interface AlertListData {
  alerts: AlertData[];
  request_page_size: number;
  request_index: number;
  total: number;
}

export type AlertListState = AlertListData;
