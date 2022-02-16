/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Position, ScaleType } from '@elastic/charts';
import { EuiSelectOption } from '@elastic/eui';
import { Type, ThreatMapping } from '@kbn/securitysolution-io-ts-alerting-types';
import { Unit } from '@elastic/datemath';
import * as i18n from './translations';
import { histogramDateTimeFormatter } from '../../../../common/components/utils';
import { ChartSeriesConfigs } from '../../../../common/components/charts/common';
/**
 * Determines whether or not to display noise warning.
 * Is considered noisy if alerts/hour rate > 1
 * @param hits Total query search hits
 * @param timeframe Range selected by user (last hour, day...)
 */
export const isNoisy = (hits: number, timeframe: Unit): boolean => {
  if (timeframe === 'h') {
    return hits > 1;
  } else if (timeframe === 'd') {
    return hits / 24 > 1;
  } else if (timeframe === 'w') {
    return hits / 168 > 1;
  } else if (timeframe === 'M') {
    return hits / 30 > 1;
  }

  return false;
};

/**
 * Determines what timerange options to show.
 * Eql sequence queries tend to be slower, so decided
 * not to include the last month option.
 * @param ruleType
 */
export const getTimeframeOptions = (ruleType: Type): EuiSelectOption[] => {
  if (ruleType === 'eql') {
    return [
      { value: 'h', text: i18n.LAST_HOUR },
      { value: 'd', text: i18n.LAST_DAY },
    ];
  } else if (ruleType === 'threat_match') {
    return [
      { value: 'h', text: i18n.LAST_HOUR },
      { value: 'd', text: i18n.LAST_DAY },
      { value: 'w', text: i18n.LAST_WEEK },
    ];
  } else if (ruleType === 'threshold') {
    return [{ value: 'h', text: i18n.LAST_HOUR }];
  } else {
    return [
      { value: 'h', text: i18n.LAST_HOUR },
      { value: 'd', text: i18n.LAST_DAY },
      { value: 'M', text: i18n.LAST_MONTH },
    ];
  }
};

/**
 * Config passed into elastic-charts settings.
 * @param to
 * @param from
 */
export const getHistogramConfig = (
  to: string,
  from: string,
  showLegend = false
): ChartSeriesConfigs => {
  return {
    series: {
      xScaleType: ScaleType.Time,
      yScaleType: ScaleType.Linear,
      stackAccessors: ['g'],
    },
    axis: {
      xTickFormatter: histogramDateTimeFormatter([to, from]),
      yTickFormatter: (value: string | number): string => value.toLocaleString(),
      tickSize: 8,
    },
    yAxisTitle: i18n.QUERY_GRAPH_COUNT,
    settings: {
      legendPosition: Position.Right,
      showLegend,
      showLegendExtra: showLegend,
      theme: {
        scales: {
          barsPadding: 0.08,
        },
        chartMargins: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        chartPaddings: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      },
    },
    customHeight: 200,
  };
};

/**
 * Threshold histogram is displayed a bit differently,
 * x-axis is not time based, but ordinal.
 */
export const getThresholdHistogramConfig = (): ChartSeriesConfigs => {
  return {
    series: {
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
      stackAccessors: ['g'],
    },
    axis: {
      yTickFormatter: (value: string | number): string => value.toLocaleString(),
      tickSize: 8,
    },
    yAxisTitle: i18n.THRESHOLD_QUERY_GRAPH_COUNT,
    settings: {
      legendPosition: Position.Right,
      showLegend: true,
      showLegendExtra: true,
      theme: {
        scales: {
          barsPadding: 0.08,
        },
        chartMargins: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        chartPaddings: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      },
    },
    customHeight: 200,
  };
};

export const getIsRulePreviewDisabled = ({
  ruleType,
  isQueryBarValid,
  isThreatQueryBarValid,
  index,
  threatIndex,
  threatMapping,
  machineLearningJobId,
}: {
  ruleType: Type;
  isQueryBarValid: boolean;
  isThreatQueryBarValid: boolean;
  index: string[];
  threatIndex: string[];
  threatMapping: ThreatMapping;
  machineLearningJobId: string[];
}) => {
  if (!isQueryBarValid || index.length === 0) return true;
  if (ruleType === 'threat_match') {
    if (!isThreatQueryBarValid || !threatIndex.length || !threatMapping) return true;
    if (
      !threatMapping.length ||
      !threatMapping[0].entries?.length ||
      !threatMapping[0].entries[0].field ||
      !threatMapping[0].entries[0].value
    )
      return true;
  }
  if (ruleType === 'machine_learning') {
    return machineLearningJobId.length === 0;
  }
  return false;
};
