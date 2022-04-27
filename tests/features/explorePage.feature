Feature: Explore Page

    Explore page should show all the tribes
    
Scenario: Open Explore page
    Given I have opened the explore page
    When The page has loaded
    Then I should see all the tribes
    