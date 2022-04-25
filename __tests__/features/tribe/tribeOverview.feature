Feature: Tribe Overview
    Tribe Overview should should show all the spaces in the tribe
    
Scenario: Open Tribe Page
    Given I have opened the tribe overview
    When The tab has loaded
    Then I should see tribe info, the spaces, create new space button and contributors

Scenario: Click on Create New Space
    Given I am on tribe page
    When I click the create new space button
    Then I should see create new space modal 