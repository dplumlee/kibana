/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { mount } from 'enzyme';
import * as React from 'react';

import { mockBrowserFields } from '../../containers/source/mock';
import { TestProviders } from '../../mock';

import { FIELD_BROWSER_HEIGHT, FIELD_BROWSER_WIDTH } from './helpers';

import { StatefulFieldsBrowser } from '.';
// Suppress warnings about "act" until async/await syntax is supported: https://github.com/facebook/react/issues/14769
/* eslint-disable no-console */
const originalError = console.error;
describe('StatefulFieldsBrowser', () => {
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });
  const timelineId = 'test';

  test('it renders the Fields button, which displays the fields browser on click', () => {
    const wrapper = mount(
      <TestProviders>
        <StatefulFieldsBrowser
          browserFields={mockBrowserFields}
          columnHeaders={[]}
          height={FIELD_BROWSER_HEIGHT}
          onUpdateColumns={jest.fn()}
          timelineId={timelineId}
          toggleColumn={jest.fn()}
          width={FIELD_BROWSER_WIDTH}
        />
      </TestProviders>
    );

    expect(
      wrapper
        .find('[data-test-subj="show-field-browser"]')
        .first()
        .text()
    ).toEqual('Columns');
  });

  describe('toggleShow', () => {
    test('it does NOT render the fields browser until the Fields button is clicked', () => {
      const wrapper = mount(
        <TestProviders>
          <StatefulFieldsBrowser
            browserFields={mockBrowserFields}
            columnHeaders={[]}
            height={FIELD_BROWSER_HEIGHT}
            onUpdateColumns={jest.fn()}
            timelineId={timelineId}
            toggleColumn={jest.fn()}
            width={FIELD_BROWSER_WIDTH}
          />
        </TestProviders>
      );

      expect(wrapper.find('[data-test-subj="fields-browser-container"]').exists()).toBe(false);
    });

    test('it renders the fields browser when the Fields button is clicked', () => {
      const wrapper = mount(
        <TestProviders>
          <StatefulFieldsBrowser
            browserFields={mockBrowserFields}
            columnHeaders={[]}
            height={FIELD_BROWSER_HEIGHT}
            onUpdateColumns={jest.fn()}
            timelineId={timelineId}
            toggleColumn={jest.fn()}
            width={FIELD_BROWSER_WIDTH}
          />
        </TestProviders>
      );

      wrapper
        .find('[data-test-subj="show-field-browser"]')
        .first()
        .simulate('click');

      expect(wrapper.find('[data-test-subj="fields-browser-container"]').exists()).toBe(true);
    });
  });

  describe('updateSelectedCategoryId', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    test('it updates the selectedCategoryId state, which makes the category bold, when the user clicks a category name in the left hand side of the field browser', () => {
      const wrapper = mount(
        <TestProviders>
          <StatefulFieldsBrowser
            browserFields={mockBrowserFields}
            columnHeaders={[]}
            height={FIELD_BROWSER_HEIGHT}
            onUpdateColumns={jest.fn()}
            timelineId={timelineId}
            toggleColumn={jest.fn()}
            width={FIELD_BROWSER_WIDTH}
          />
        </TestProviders>
      );

      wrapper
        .find('[data-test-subj="show-field-browser"]')
        .first()
        .simulate('click');

      wrapper
        .find(`.field-browser-category-pane-auditd-${timelineId}`)
        .first()
        .simulate('click');

      wrapper.update();
      expect(
        wrapper.find(`.field-browser-category-pane-auditd-${timelineId}`).first()
      ).toHaveStyleRule('font-weight', 'bold', { modifier: '.euiText' });
    });

    test('it updates the selectedCategoryId state according to most fields returned', () => {
      const wrapper = mount(
        <TestProviders>
          <StatefulFieldsBrowser
            browserFields={mockBrowserFields}
            columnHeaders={[]}
            height={FIELD_BROWSER_HEIGHT}
            onUpdateColumns={jest.fn()}
            timelineId={timelineId}
            toggleColumn={jest.fn()}
            width={FIELD_BROWSER_WIDTH}
          />
        </TestProviders>
      );

      wrapper
        .find('[data-test-subj="show-field-browser"]')
        .first()
        .simulate('click');
      expect(
        wrapper.find(`.field-browser-category-pane-cloud-${timelineId}`).first()
      ).toHaveStyleRule('font-weight', 'normal', { modifier: '.euiText' });
      wrapper
        .find('[data-test-subj="field-search"]')
        .last()
        .simulate('change', { target: { value: 'cloud' } });

      jest.runOnlyPendingTimers();
      wrapper.update();
      expect(
        wrapper.find(`.field-browser-category-pane-cloud-${timelineId}`).first()
      ).toHaveStyleRule('font-weight', 'bold', { modifier: '.euiText' });
    });
  });

  test('it renders the Fields Browser button as a settings gear when the isEventViewer prop is true', () => {
    const isEventViewer = true;

    const wrapper = mount(
      <TestProviders>
        <StatefulFieldsBrowser
          browserFields={mockBrowserFields}
          columnHeaders={[]}
          height={FIELD_BROWSER_HEIGHT}
          isEventViewer={isEventViewer}
          onUpdateColumns={jest.fn()}
          timelineId={timelineId}
          toggleColumn={jest.fn()}
          width={FIELD_BROWSER_WIDTH}
        />
      </TestProviders>
    );

    expect(
      wrapper
        .find('[data-test-subj="show-field-browser-gear"]')
        .first()
        .exists()
    ).toBe(true);
  });

  test('it does NOT render the Fields Browser button as a settings gear when the isEventViewer prop is false', () => {
    const isEventViewer = false;

    const wrapper = mount(
      <TestProviders>
        <StatefulFieldsBrowser
          browserFields={mockBrowserFields}
          columnHeaders={[]}
          height={FIELD_BROWSER_HEIGHT}
          isEventViewer={isEventViewer}
          onUpdateColumns={jest.fn()}
          timelineId={timelineId}
          toggleColumn={jest.fn()}
          width={FIELD_BROWSER_WIDTH}
        />
      </TestProviders>
    );

    expect(
      wrapper
        .find('[data-test-subj="show-field-browser-gear"]')
        .first()
        .exists()
    ).toBe(false);
  });

  test('it does NOT render the default Fields Browser button when the isEventViewer prop is true', () => {
    const isEventViewer = true;

    const wrapper = mount(
      <TestProviders>
        <StatefulFieldsBrowser
          browserFields={mockBrowserFields}
          columnHeaders={[]}
          height={FIELD_BROWSER_HEIGHT}
          isEventViewer={isEventViewer}
          onUpdateColumns={jest.fn()}
          timelineId={timelineId}
          toggleColumn={jest.fn()}
          width={FIELD_BROWSER_WIDTH}
        />
      </TestProviders>
    );

    expect(
      wrapper
        .find('[data-test-subj="show-field-browser"]')
        .first()
        .exists()
    ).toBe(false);
  });
});
