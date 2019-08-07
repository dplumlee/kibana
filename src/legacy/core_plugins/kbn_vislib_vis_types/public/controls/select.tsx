/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { EuiFormRow, EuiSelect } from '@elastic/eui';

interface SelectOptionProps<ParamName extends string, ValidParamValues extends string> {
  label: string;
  options: Array<{ value: ValidParamValues; text: string }>;
  paramName: ParamName;
  value?: ValidParamValues;
  setValue: (paramName: ParamName, value: ValidParamValues) => void;
}

function SelectOption<ParamName extends string, ValidParamValues extends string>({
  label,
  options,
  paramName,
  value,
  setValue,
}: SelectOptionProps<ParamName, ValidParamValues>) {
  return (
    <EuiFormRow label={label} fullWidth={true} compressed>
      <EuiSelect
        options={options}
        value={value}
        onChange={ev => setValue(paramName, ev.target.value as ValidParamValues)}
        fullWidth={true}
      />
    </EuiFormRow>
  );
}

export { SelectOption };
