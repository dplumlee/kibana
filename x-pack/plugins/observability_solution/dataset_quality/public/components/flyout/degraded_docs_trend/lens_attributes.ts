/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { DataView } from '@kbn/data-views-plugin/common';
import { i18n } from '@kbn/i18n';
import { GenericIndexPatternColumn, TypedLensByValueInput } from '@kbn/lens-plugin/public';

import { DEFAULT_LOGS_DATA_VIEW } from '../../../../common/constants';
import {
  flyoutDegradedDocsPercentageText,
  flyoutDegradedDocsTrendText,
} from '../../../../common/translations';

const defaultDataView = {
  id: `${DEFAULT_LOGS_DATA_VIEW}-id`,
  title: DEFAULT_LOGS_DATA_VIEW,
  timeFieldName: '@timestamp',
} as DataView;

enum DatasetQualityLensColumn {
  Date = 'date_column',
  DegradedDocs = 'degraded_docs_column',
  CountIgnored = 'count_ignored',
  CountTotal = 'count_total',
  Math = 'math_column',
  Breakdown = 'breakdown_column',
}

const MAX_BREAKDOWN_SERIES = 5;

export function getLensAttributes(
  color: string,
  dataView: DataView = defaultDataView,
  breakdownFieldName?: string
) {
  const columnOrder = [
    DatasetQualityLensColumn.Date,
    DatasetQualityLensColumn.CountIgnored,
    DatasetQualityLensColumn.CountTotal,
    DatasetQualityLensColumn.Math,
    DatasetQualityLensColumn.DegradedDocs,
  ];

  if (breakdownFieldName) {
    columnOrder.unshift(DatasetQualityLensColumn.Breakdown);
  }

  const columns = getChartColumns(breakdownFieldName);

  return {
    visualizationType: 'lnsXY',
    title: flyoutDegradedDocsTrendText,
    references: [
      {
        id: dataView.id!,
        name: 'indexpattern-datasource-current-indexpattern',
        type: 'index-pattern',
      },
      {
        id: dataView.id!,
        name: 'indexpattern-datasource-layer-layer1',
        type: 'index-pattern',
      },
    ],
    state: {
      datasourceStates: {
        formBased: {
          layers: {
            layer1: {
              columnOrder,
              columns,
              indexPatternId: dataView.id!,
            },
          },
        },
      },
      filters: [],
      query: {
        language: 'kuery',
        query: '',
      },
      visualization: {
        axisTitlesVisibilitySettings: {
          x: false,
          yLeft: false,
          yRight: false,
        },
        fittingFunction: 'None',
        gridlinesVisibilitySettings: {
          x: true,
          yLeft: true,
          yRight: true,
        },
        layers: [
          {
            accessors: [DatasetQualityLensColumn.DegradedDocs],
            layerId: 'layer1',
            layerType: 'data',
            seriesType: 'line',
            xAccessor: DatasetQualityLensColumn.Date,
            ...(breakdownFieldName
              ? { splitAccessor: DatasetQualityLensColumn.Breakdown }
              : {
                  yConfig: [
                    {
                      forAccessor: DatasetQualityLensColumn.DegradedDocs,
                      color,
                    },
                  ],
                }),
          },
        ],
        legend: {
          isVisible: true,
          position: 'right',
          legendSize: 'large',
          shouldTruncate: true,
        },
        preferredSeriesType: 'line',
        tickLabelsVisibilitySettings: {
          x: true,
          yLeft: true,
          yRight: true,
        },
        valueLabels: 'hide',
        yLeftExtent: {
          mode: 'custom',
          lowerBound: 0,
          upperBound: undefined,
        },
      },
    },
  } as TypedLensByValueInput['attributes'];
}

function getChartColumns(breakdownField?: string): Record<string, GenericIndexPatternColumn> {
  return {
    [DatasetQualityLensColumn.Date]: {
      dataType: 'date',
      isBucketed: true,
      label: '@timestamp',
      operationType: 'date_histogram',
      params: {
        interval: 'auto',
      },
      scale: 'interval',
      sourceField: '@timestamp',
    } as GenericIndexPatternColumn,
    [DatasetQualityLensColumn.CountIgnored]: {
      label: '',
      dataType: 'number',
      operationType: 'count',
      isBucketed: false,
      scale: 'ratio',
      sourceField: '___records___',
      filter: {
        query: '_ignored: *',
        language: 'kuery',
      },
      params: {
        emptyAsNull: false,
      },
      customLabel: true,
    } as GenericIndexPatternColumn,
    [DatasetQualityLensColumn.CountTotal]: {
      label: '',
      dataType: 'number',
      operationType: 'count',
      isBucketed: false,
      scale: 'ratio',
      sourceField: '___records___',
      params: {
        emptyAsNull: false,
      },
      customLabel: true,
    } as GenericIndexPatternColumn,
    [DatasetQualityLensColumn.Math]: {
      label: '',
      dataType: 'number',
      operationType: 'math',
      isBucketed: false,
      scale: 'ratio',
      params: {
        tinymathAst: {
          type: 'function',
          name: 'divide',
          args: ['count_ignored', 'count_total'],
          location: {
            min: 0,
            max: 34,
          },
          text: "count(kql='_ignored: *') / count()",
        },
      },
      references: ['count_ignored', 'count_total'],
      customLabel: true,
    } as GenericIndexPatternColumn,
    [DatasetQualityLensColumn.DegradedDocs]: {
      label: flyoutDegradedDocsPercentageText,
      customLabel: true,
      operationType: 'formula',
      dataType: 'number',
      references: [DatasetQualityLensColumn.Math],
      isBucketed: false,
      params: {
        formula: "count(kql='_ignored: *') / count()",
        format: {
          id: 'percent',
          params: {
            decimals: 3,
          },
        },
        isFormulaBroken: false,
      },
    } as GenericIndexPatternColumn,
    ...(breakdownField
      ? {
          [DatasetQualityLensColumn.Breakdown]: {
            dataType: 'number',
            isBucketed: true,
            label: getFlyoutDegradedDocsTopNText(MAX_BREAKDOWN_SERIES, breakdownField),
            operationType: 'terms',
            scale: 'ordinal',
            sourceField: breakdownField,
            params: {
              size: MAX_BREAKDOWN_SERIES,
              orderBy: {
                type: 'significant',
                fallback: true,
              },
              orderDirection: 'desc',
              otherBucket: true,
              missingBucket: false,
              parentFormat: {
                id: 'terms',
              },
            },
          } as GenericIndexPatternColumn,
        }
      : {}),
  };
}

export const getFlyoutDegradedDocsTopNText = (count: number, fieldName: string) =>
  i18n.translate('xpack.datasetQuality.flyoutDegradedDocsTopNValues', {
    defaultMessage: 'Top {count} values of {fieldName}',
    values: { count, fieldName },
    description:
      'Tooltip label for the top N values of a field in the degraded documents trend chart.',
  });
