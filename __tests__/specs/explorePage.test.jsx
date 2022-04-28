/* eslint-disable no-undef */
import { defineFeature, loadFeature } from 'jest-cucumber';
import { configure, mount } from 'enzyme';
import React from 'react';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

import ExploreTemplate from '../../app/components/templates/explore';
import mockData from '../fixtures/explorePage/mockData.json';
import DAOCard from '../../app/components/elements/daoCard';

configure({ adapter: new Adapter() });

const feature = loadFeature(
  './__tests__/features/explorePage/explorePage.feature'
);

jest.mock('../../pages', () => ({
  useExplore: () => ({
    publicTribes: mockData,
  }),
}));

defineFeature(feature, (test) => {
  test('Open Explore page', ({ given, when, then }) => {
    const wrapper = mount(<ExploreTemplate />);
    given('I have opened the explore page', () => {
      expect(
        wrapper.find({ 'data-testid': 'explore-template-container' }).exists()
      ).toBe(true);
    });

    when('The page has loaded', () => {
      expect(wrapper.find(DAOCard).length).toBe(2);
    });

    then('I should see all the tribes', () => {
      expect(
        wrapper
          .find({
            'data-testid': 'tribe-card-947b90a3-f66d-4023-8ec2-31dd2664892e',
          })
          .exists()
      ).toBe(true);
      expect(
        wrapper
          .find({
            'data-testid': 'tribe-card-947b90a3-f66d-4023-8ec2-31dd2664892e',
          })
          .contains('Mock Tribe 1')
      ).toBe(true);
    });
  });
});
