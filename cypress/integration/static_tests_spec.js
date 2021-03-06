describe('Basic flagpole tests using config.yaml....', function () {
  const env = Cypress.env('ENVIRONMENT'),
    YAML = require('yamljs');
  var baseURL = '', flagpoleData = {}, flagpoleKeys = null;
  var flagpoleName = '', flagpoleValue = '', flagpoleTrueName = '', flagpoleFalseName = '';

  it('Set up data ', function () {
    cy.readFile('config.yaml').then((str) => {
      const config = YAML.parse(str);
      baseURL = config[env].domain;
      cy.visit(baseURL).then(function () {
        flagpoleData = {}
        cy.get('.flagpole-container').each(function(flagpolesElem){

          cy.wrap(flagpolesElem).find('.flagpole-name').then(function(elem) {
            flagpoleName = elem.text();
            flagpoleData[flagpoleName] = {name:flagpoleName,value:false, trueName:'',falseName:''}
          })
          cy.wrap(flagpolesElem).find('.flagpole-value').then(function(elem) {
            flagpoleValue = elem.text();
          })
          cy.wrap(flagpolesElem).find('input').first().then(function(flagpoleTrueElem){
            flagpoleTrueName = flagpoleTrueElem.attr('data-check-role');
            flagpoleData[flagpoleName].trueName = flagpoleTrueName;
          })
          cy.wrap(flagpolesElem).find('span').last().then(function(flagpoleTrueSpanElem){
            let desc = flagpoleTrueSpanElem.text();
            flagpoleData[flagpoleName].trueDesc = desc.replace(/^.*: /,'')
          })
          cy.wrap(flagpolesElem).find('input').last().then(function(flagpoleFalseElem){
            flagpoleFalseName = flagpoleFalseElem.attr('data-check-role');
            flagpoleData[flagpoleName].falseName = flagpoleFalseName;

            flagpoleData[flagpoleName].value = flagpoleValue === flagpoleTrueName
          })
          cy.wrap(flagpolesElem).find('span').last().then(function(flagpoleFalseSpanElem){
            let desc = flagpoleFalseSpanElem.text();
            flagpoleData[flagpoleName].falseDesc = desc.replace(/^.*: /,'')
          })
        })
      })
    })
  })

  describe("Ensure that the flagpole data is displayed consistently in an enviromment", function() {

      it("Show all flagpoles from the flagpole data", function () {
        cy.visit(baseURL).then(function () {
          flagpoleKeys = Object.keys(flagpoleData)
          cy.get('.flagpole-container').should('have.length', flagpoleKeys.length)
        })
      })

      it("Shows each flagpole as an element", function () {
          for (let i=0; i<flagpoleKeys.length;i++){
            cy.get('[data-flagpole='+flagpoleKeys[i].toUpperCase()).then(function(flagpoleElem) {
              expect(flagpoleElem).to.have.length(1)
            })
          }
        })

      it("Shows each flagpole current value correctly", function () {
        flagpoleKeys = Object.keys(flagpoleData);
        for (let i=0; i<flagpoleKeys.length;i++){
          let flagpole = flagpoleData[flagpoleKeys[i]],
            flagpoleNameText = flagpole.name.toUpperCase(),
            flagpoleValueText = flagpole.value?flagpole.trueName:flagpole.falseName,
            flagpoleValueTextDesc = flagpole.value?flagpole.trueDesc:flagpole.falseDesc;

          cy.get('[data-flagpole="'+flagpoleNameText+'"]').then(function(flagpoleElem) {
            cy.wrap(flagpoleElem).find('.flagpole-value').contains(flagpoleValueText);

            cy.wrap(flagpoleElem).find('.flagpole-value-desc').contains(flagpoleValueTextDesc)
          })
        }
      })

      it("Shows edit controls for each flagpole value correctly", function () {
        flagpoleKeys = Object.keys(flagpoleData);
        for (let i = 0; i < flagpoleKeys.length; i++) {
          let flagpole = flagpoleData[flagpoleKeys[i]],
            flagpoleNameText = flagpole.name.toUpperCase(),
            flagpoleValue = flagpole.value,
            flagpoleTrueName = flagpole.trueName,
            flagpoleFalseName = flagpole.falseName;

          if (flagpoleValue) {
            cy.get('[name="' + flagpoleNameText + '"][data-check-role="'+flagpoleTrueName+'"]:checked').should('exist');
            cy.get('[name="' + flagpoleNameText + '"][data-check-role="'+flagpoleFalseName+'"]:checked').should('not.exist')
          } else {
            cy.get('[name="' + flagpoleNameText + '"][data-check-role="'+flagpoleTrueName+'"]:checked').should('not.exist');
            cy.get('[name="' + flagpoleNameText + '"][data-check-role="'+flagpoleFalseName+'"]:checked').should('exist')
          }
        }
      })
     })
})



