describe('Metamask', () => {
  context('Test commands', () => {
    // todo: clear the state of extension and test different combinations of setupMetamask with private key & custom network
    it(`setupMetamask should finish metamask setup using secret words`, () => {
      cy.setupMetamask(
        'shuffle stay hair student wagon senior problem drama parrot creek enact pluck',
        'kovan',
        'Tester@1234'
      ).then((setupFinished) => {
        expect(setupFinished).to.be.true;
      });
      cy.addMetamaskNetwork({
        networkName: 'Polygon Testnet Mumbai',
        rpcUrl: 'https://matic-mumbai.chainstacklabs.com',
        chainId: '80001',
        symbol: 'MATIC',
        blockExplorer: 'https://mumbai.polygonscan.com',
        isTestnet: true,
      }).then((networkAdded) => {
        expect(networkAdded).to.be.true;
      });
      cy.createMetamaskAccount().then((created) => {
        expect(created).to.be.true;
      });
      cy.switchMetamaskAccount(1).then((switched) => {
        expect(switched).to.be.true;
      });
      cy.visit('http://localhost:3000/');
      cy.get('[data-testid=bConnectButton]').click();
      cy.acceptMetamaskAccess(true).then((connected) => {
        expect(connected).to.be.true;
      });
      cy.wait(50);
      cy.confirmMetamaskSignatureRequest().then((confirmed) => {
        expect(confirmed).to.be.true;
      });
    });
    it(`create a task on the space with reward`, () => {
      cy.contains('e2e_tribe_1').click();
      cy.contains('e2e_space_1', { timeout: 10000 }).click();
      cy.get('[data-testid=addTask-column-0]').click();
      cy.get('[data-testid=iTaskTitle]').type('e2e_task_1');
      cy.get('[data-testid=bCreateTask').click();
      cy.contains('e2e_task_1').click();
      cy.get('[data-testid=bRewardButton').click();
      cy.get('[data-testid=aRewardChain]')
        .type('mumbai')
        .get('.MuiAutocomplete-popper li[data-option-index="0"]')
        .click();
      cy.get('[data-testid=aRewardToken]')
        .type('MATIC')
        .get('.MuiAutocomplete-popper li[data-option-index="0"]')
        .click();
      cy.get('[data-testid=iRewardValue]').type('0.01');
      cy.get('[data-testid=bRewardSave]').click();
      cy.get('[data-testid=bCloseButton]').click();
      cy.wait(1000);
      cy.get('[data-testid=bProfileButton').click();
      cy.wait(50);
      cy.get('[data-testid=bLogoutButton]').click();
      cy.wait(2000);
    });
    it(`take up the task and move it to done`, () => {
      cy.switchMetamaskAccount(2).then((switched) => {
        expect(switched).to.be.true;
      });
      cy.wait(1000);
      cy.get('[data-testid=bConnectButton]').click();
      cy.wait(50);
      cy.confirmMetamaskSignatureRequest().then((confirmed) => {
        expect(confirmed).to.be.true;
      });
      cy.contains('e2e_tribe_1').click();
      cy.contains('e2e_space_1', { timeout: 10000 }).click();
      cy.contains('e2e_task_1').click();
      cy.get('[data-testid=bAssignToMeButton]').click();
      cy.wait(2000);
      cy.get('[data-testid=bColumnButton').click();
      cy.get('[data-testid=aColumnPicker]')
        .type('Done')
        .get('.MuiAutocomplete-popper li[data-option-index="0"]')
        .click();
      cy.get('[data-testid=bColumnSave]').click();
      cy.wait(100);
      cy.get('[data-testid=bProfileButton').click();
      cy.wait(50);
      cy.get('[data-testid=bLogoutButton]').click();
      cy.wait(2000);
    });
    it(`batch pay for the created task`, () => {
      cy.switchMetamaskAccount(1).then((switched) => {
        expect(switched).to.be.true;
      });
      cy.wait(1000);
      cy.get('[data-testid=bConnectButton]').click();
      cy.wait(50);
      cy.confirmMetamaskSignatureRequest().then((confirmed) => {
        expect(confirmed).to.be.true;
      });
      cy.contains('e2e_tribe_1').click();
      cy.contains('e2e_space_1', { timeout: 10000 }).click();
      cy.wait(2000);
      cy.get('[data-testid=bBatchPayButton]').click();
      cy.get('[data-testid=bCardListNextButton]').click();
      cy.get('[data-testid=bBatchPayModalButton]').click();
      cy.confirmMetamaskTransaction().then((confirmed) => {
        expect(confirmed).to.be.true;
      });
      cy.wait(1000);
      cy.contains('e2e_task_1', { timeout: 60000 }).click();
      cy.get('[data-testid=bCardOptionsButton').click();
      cy.get('[data-testid=bArchiveCardButton').click();
      cy.wait(1000);
    });
  });
});
