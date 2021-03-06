# Docker Flagpole
A containerised application to manage flagpoles in a JSON file that is accessible to
 all applications operating in an environment

## Environment
The system requires that the following versions of applications to be installed:

node v10.16.x (npm v6.9.0)

### Installation
To install the system clone the repository ```git@github.com:bbc/bbc-gn-dockerflagpole.git``` and
then, in the directory the repo was cloned into, run ```npm install```

If testing/development is required to be done, also run the following command ```npm install --dev```

### Building
In development there is no further building required. When the application is used in test
 or production, a docker image will have to be built.

#### Test docker build
In order to run the application as a stand-alone docker image running on the tester's laptop, the tester
needs to start docker on their laptop. Once the docker application is running, run the
following command once to build a testing docker image ```npm run docker-build-test```.

This npm command ultimately runs the script build.sh with the argument 'build' This creates an image that
will communicate to localhost:3001 otf thehost machine.

#### Production docker build
In this situation the docker image needs to be built and signed with appropriate keys so that it can be 
managed with all the other docker images in Global News' ECS system.

Scripts for this have not yet been finalised but there are established mechanisms for achieving this used
in previous projects.

## Configuration
The app can be configured to be run in a number of different environments. This is achieved with a YAML file that
allows a very straight forward mechanism for setting out the different properties for each environment.
Each target environment can have their own distinct set of properties.

Here are the configuration values that can be set for each environment:-
* port - This is the port thaat the application will operate on.
* domain - This is not actively used at the moment but may prove useful later.
* usesS3 - This is a boolean to indicate if the environment will use S3 for its flagpole source.
* s3Bucket - This is the name of the S3 bucket to use (only required if uses_s3 is true)
* defaultSource - The is the name of the flagpole source that will be used if no other source is specified
* sources - An object keyed by names of flagpole data sources.  

Please refer to the operation section for more information on how each configuration value is used in each 
different environment.

### Flagpole data
The flagpole data will be the following for each JSON flagpole which will allow each flagpole to be more expresive
when read in the application.

```
{
    <flagpole name> : {
        "name" : <The name of the flagpole>,
        "value" : <flagpole value (boolean)>,
        "modified" : <Date of last modification (format:"ddd, dd mmm yyyy HH:MM:ss")>
        "message" : <Message to be displayed against flagpole data>,
        "trueName" : <Name of the flagpole true state>,
        "trueDesc" : <Description to display when flagpole is true>,
        "falseName" : <Name of the flagpole false state>,
        "falseDesc" : <Description to display when flagpole is false>
    },
    .....
}
```
Below is an example of a poulated flagpole object. Please note the following:-
* The initial modified date is blank. No user intervention is required as it will be managed by the application.
* The name value in the flagpole object must exactly match the property name of the flagpole object in the JSON.
* The true/false names should be the most succinct statement that fits the use case of the flagpole value. 
* The true/false descriptions can be anything that makes flagpole management easier.

```
{
  "adverts":{
    "name" : 
    "value" : true,
    "modified" : "",
    "message" : "For non-LIVE (INT, TEST, STAGE), do not change this flagpole without speaking to GNL/bbc.com (WWGNDevelopmentTeam@bbc.com) first.",
    "trueName" : "ON",
    "trueDesc" : "Adverts are ENABLED",
    "falseName" : "OFF",
    "falseDesc" : "Adverts are SUPPRESSED"
  }
}
```

## Operation
Once the environment is installed the following operational capabilities are possible.

### Startup
The application can be started up in several environments the each section below describes that environment.

#### Development startup
The application can be run with the following ```npm run start-dev```
which will connect to the following web address on the user's machine ```localhost:3000```.

The port used is defined in the dev configuration. The file that is used a source for flagpoles is a checked in 
standard file that only serves for testing. If the developer wishes to add new or edit existing flagpoles,
Cypress or Jasmine tests should be adjusted to fir the new values.

#### Test startup
In test, the app is envisioned to run as a stand-alone docker image running on the tester's laptop, the 
tester must launch docker image with the following command ```npm run docker-launch-test```.
This command will remove the image (if it exists), build a new one and then launch the container. 

At the moment the docker container cannot access S3 so the test Flagpoles data in S3 as the user it 
runs as has no permission.

The command ```npm run start-test``` can be used to launch the app locally (i.e. no container) running against
localhost:3001 so that tests can be run using test flagpole data on S3.

#### Production startup
When in production the app will run as its own EC2 container as part of the standard ECS that Global News runs.
When the app is operated in a container with no overriding commmand (as is used in test docker) it will assume
that tit is live and will read the live config.

The image instance that is run will be accessible via a public web address that will route all web traffic to 
the appropriate port on the image (fixed at 3000). The app is configured to read from and write to an S3 bucket 
 file that will be accessible to all live applications requiring flagpole data.
 
### Functionality
This section details the functional operation of the docker flagpole application.

#### Flagpole data source
When opened the app will display a list of flagpoles read from the default source for that environment. The environment 
needs to be configured so that the defaultSource configuration key exists in the configured defined sources.

If a user wishes to look at flagpoles from a different source there are two options: -
* Start the app giving the name of the flagpole data source (i.e. localhost:3000/wwhp)
* Start the app giving the name of a flagpole file (.json suffix optional) (i.e. localhost:3000/test_flagpoles_file) 
 
All flagpoles found in the source are displayed to the user.

#### Flagpole display
Each flagpole display will have the following UI details :-
* Name - The capitalized name of the flagpole.
* Current Value - The name of the flagpole's boolean value state will be displayed.
* Value description - The description of the flagpole's boolean value state will be displayed. 
* Message - If a message is included in the flagpole object, it will be displayed here.
 
#### Flagpole editing
Below the flagpole display, the following UI controls will be displayed
* Modified date - The date and time this flagpole was last changed. This is not user editable.
* True radio - Initially selected if the flagpole state is true. Can set a flagpole value from false to true.
* False radio - Initially selected if the flagpole state is false. Can set a flagpole value from true to false.
* Update button - A button to write the current flagpole state to file if the state of the flagpole has changed.

Clicking the update button will set the value of the flagpole to the current state of the radio buttons and cause
all flagpoles to be written out to the source file. Once the write has completed successfully, only the updated
flagpoles will be re-displayed with its new value, leaving all other flagpoles unchanged.

The modified date of the edited flagpole will be set to the date and time of the moment when the flagpole was
updated.

### Testing
End-to-end testing is performed using the Cypress test framework where the tests read in the configuration of the
environment they're asked to run under to determine the urls and test   

The Cypress tests are javascript spec files held in the directory ```cypress/integration```  and  have two main
mechanisms of testing, active and static tests.
* Static tests - These tests test that all flagpoles in the environment are displayed correctly in the UI.
* Active tests - These tests operate the editing functionality of the UI to check the behaviour and actually 
update the flagpoles JSON data file.
  
#### Development environment testing
The following command will start up the development Cypress environment ```npm run cypress-dev```.
This will allow execution of tests in the development environment using the development configuration parameters
such as source (flagpoles JSON file) and domain.

 Prior to running this command the developer will need to have launched the development server with the command
 ```npm run start-dev```.

The following tests can be run in the development environment ```dev_static_tests_spec.js & dev_active_test_spec.js```.
Each test will read in the contents of the development data source and check that the data in the file is correctly 
displayed in the app. 

#### Test environment testing
The following command will start up the test Cypress environment ```npm run cypress-test```.
 This will allow execution of tests in the test environment using the test configuration parameters
 such as S3 source (flagpoles JSON file), S3 bucket and test domain. The app is designed to be testedthrough
 localhost connected to a docker image where the actual app will be running.
 
Prior to running the above command the tester will need to have built and launched the test docker container 
(see Test Startup section - Please note the current limitations)

The following test can be run in the test environment ```static_tests_spec.js```.
As Cypress cannot read the contents of an S3 file, this test extrapolates the contents of the flagpole JSON file
from the data displayed in the browser. The dynamic tests have not yet been implemented for the test environment
due to the limitations described in the Test Startup section

Cypress tests can currently be run by initially starting up the app in test mode (```npm run start-test```) and then
running the standard commands described above. This will be functionally the same as running the tests against
a docker image.
   
#### Production environment testing
The following command will start up the Cypress environment that will execute the tests in the live
 environment ```npm run cypress-live```.
 
The tests that can be run in the live environment will be the same as those that can be performed in test.
   
