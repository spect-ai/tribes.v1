Feature: List View
    List View Should show all the tasks
    
Scenario: Go to list view and check if all the tasks are shown
    Given I am on list view
    When The tasks are loaded
    Then I should see all the tasks

Scenario: Go to list view and check if we can add tasks
    Given I am on list view
    When The tasks are loaded
    Then I should be able to create tasks
    