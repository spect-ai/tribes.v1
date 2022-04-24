import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('features/explorePage.feature');

defineFeature(feature, (test) => {
  test('Open Explore page', ({ given, when, then }) => {
    given('I am on the explore page', () => {
      console.log('hi');
    });

    // when('I click on the explore button', () => {
    //   browser.click('#explore-button');
    // });

    // then('I should see the explore page', () => {
    //   browser.waitForVisible('#explore-page');
  });
});
