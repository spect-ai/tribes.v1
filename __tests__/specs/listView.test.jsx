/* eslint-disable no-undef */
import { defineFeature, loadFeature } from 'jest-cucumber';
import { configure, mount } from 'enzyme';
import React from 'react';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import ListView from '../../app/components/modules/listView';
import ColumnListSection from '../../app/components/modules/listView/columnListSection';
import TaskListItem from '../../app/components/modules/taskListItem';
import SpaceData from '../fixtures/space/spaceData.json';
import MockUser from '../fixtures/user/mockUser.json';
import MockPallete from '../fixtures/theme/mockData.json';

configure({ adapter: new Adapter() });

const feature = loadFeature('./__tests__/features/listView/listView.feature');

jest.mock('react-moralis', () => ({
  useMoralis: () => ({
    user: MockUser,
    isAuthenticated: true,
  }),
}));

jest.mock('../../pages/tribe/[id]/space/[bid]', () => ({
  useSpace: () => ({
    space: SpaceData,
  }),
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: () => ({
    palette: MockPallete,
  }),
}));

defineFeature(feature, (test) => {
  test('Go to list view and check if all the tasks are shown', ({
    given,
    when,
    then,
  }) => {
    const wrapper = mount(
      <ListView board={SpaceData} handleDragEnd={() => jest.fn()} />
    );
    given('I am on list view', () => {
      expect(
        wrapper.find({ 'data-testid': 'listViewContainer' }).exists()
      ).toBe(true);
    });

    when('The tasks are loaded', () => {
      expect(wrapper.find(ColumnListSection).length).toBe(4);
    });

    then('I should see all the tasks', () => {
      expect(wrapper.find(TaskListItem).length).toBe(23);
    });
  });
  test('Go to list view and check if we can add tasks', ({
    given,
    when,
    then,
  }) => {
    // MockUser.id = 'v6l5KlwBxEmfG6NcKD5zof7t';
    const wrapper = mount(
      <ListView board={SpaceData} handleDragEnd={() => jest.fn()} />
    );
    given('I am on list view', () => {
      expect(
        wrapper.find({ 'data-testid': 'listViewContainer' }).exists()
      ).toBe(true);
    });

    when('The tasks are loaded', () => {
      expect(wrapper.find(ColumnListSection).length).toBe(4);
    });

    then('I should be able to create tasks', () => {
      expect(wrapper.find({ 'data-testid': 'createCardModal' }).exists()).toBe(
        false
      );
      wrapper
        .find({ 'data-testid': 'addTask-column-0' })
        .hostNodes()
        .simulate('click');
      expect(wrapper.find({ 'data-testid': 'createCardModal' }).exists()).toBe(
        true
      );
      wrapper
        .find({ 'data-testid': 'bCreateCardClose' })
        .hostNodes()
        .simulate('click');
    });
  });
  test('Go to list view and try adding tasks without having the right role', ({
    given,
    when,
    then,
  }) => {
    const wrapper = mount(
      <ListView board={SpaceData} handleDragEnd={() => jest.fn()} />
    );
    given('I am on list view with a different user', () => {
      expect(
        wrapper.find({ 'data-testid': 'listViewContainer' }).exists()
      ).toBe(true);
    });

    when('The tasks are loaded', () => {
      expect(wrapper.find(ColumnListSection).length).toBe(4);
    });

    then('I should not be able to create tasks', () => {
      MockUser.id = '';
      expect(wrapper.find({ 'data-testid': 'createCardModal' }).exists()).toBe(
        false
      );
      wrapper
        .find({ 'data-testid': 'addTask-column-0' })
        .hostNodes()
        .simulate('click');
      expect(wrapper.find({ 'data-testid': 'createCardModal' }).exists()).toBe(
        false
      );
      SpaceData.columns['column-0'].createCard[0] = true;
      wrapper
        .find({ 'data-testid': 'addTask-column-0' })
        .hostNodes()
        .simulate('click');
      expect(wrapper.find({ 'data-testid': 'createCardModal' }).exists()).toBe(
        true
      );
      MockUser.id = 'v6l5KlwBxEmfG6NcKD5zof7t';
      SpaceData.columns['column-0'].createCard[0] = false;
      wrapper
        .find({ 'data-testid': 'addTask-column-0' })
        .hostNodes()
        .simulate('click');
      expect(wrapper.find({ 'data-testid': 'createCardModal' }).exists()).toBe(
        true
      );
    });
  });
});
