/* eslint-disable no-undef */
import { defineFeature, loadFeature } from 'jest-cucumber';
import { configure, mount } from 'enzyme';
import React from 'react';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { Avatar } from '@mui/material';

import Overview from '../../app/components/modules/overviewTab';
import MockTribe from '../fixtures/tribe/mockTribe.json';
import MockUser from '../fixtures/user/mockUser.json';
import {
  BoardButton,
  CreateBoardButton,
} from '../../app/components/modules/boardsTab';
import CreateBoard from '../../app/components/modules/boardsTab/createBoard';

configure({ adapter: new Adapter() });

const feature = loadFeature('./__tests__/features/tribe/tribeOverview.feature');

jest.mock('../../pages/tribe/[id]', () => ({
  useTribe: () => ({
    tribe: MockTribe,
  }),
}));

jest.mock('react-moralis', () => ({
  useMoralis: () => ({
    user: MockUser,
  }),
}));

defineFeature(feature, (test) => {
  test('Open Tribe page', ({ given, when, then }) => {
    const wrapper = mount(<Overview />);
    given('I have opened the tribe overview', () => {
      expect(
        wrapper.find({ 'data-testid': 'overviewContainer' }).exists()
      ).toBe(true);
    });

    when('The tab has loaded', () => {
      expect(
        wrapper.find({ 'data-testid': 'overviewContainer' }).exists()
      ).toBe(true);
    });

    then(
      'I should see tribe info, the spaces, create new space button and contributors',
      () => {
        expect(
          wrapper
            .find({
              'data-testid': 'tribeDescription',
            })
            .contains('Mock Tribe 1 Description')
        ).toBe(true);
        expect(wrapper.find(BoardButton).length).toBe(2);
        expect(
          wrapper
            .find({
              'data-testid': 'space-TI2k3PRCnGVuNPbIlh7GdC3v',
            })
            .contains('Mock Space 1')
        ).toBe(true);
        expect(wrapper.find(CreateBoardButton).length).toBe(1);
        expect(
          wrapper
            .find({
              'data-testid': 'avatarGroup',
            })
            .find(Avatar).length
        ).toBe(3);
      }
    );
  });

  test('Click on Create New Space', ({ given, when, then }) => {
    const wrapper = mount(<Overview />);
    given('I am on tribe page', () => {
      expect(
        wrapper.find({ 'data-testid': 'overviewContainer' }).exists()
      ).toBe(true);
    });

    when('I click the create new space button', () => {
      wrapper.find('#bCreateBoardButton').hostNodes().simulate('click');
    });

    then('I should see create new space modal', () => {
      expect(wrapper.find(CreateBoard).exists()).toBe(true);
      expect(
        wrapper.find({ 'data-testid': 'bCreateSpaceModalButton' }).exists()
      ).toBe(true);
    });
  });
});
