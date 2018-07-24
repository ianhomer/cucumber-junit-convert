const builder = require('junit-report-builder');
const fs = require("fs");
const jsonFile = require('jsonfile');

function convert(options) {
    const jsonFileResult = jsonFile.readFileSync(options.inputJsonFile);
    jsonFileResult.forEach(function (feature) {
        let durationInSec = 0;
        const suite = builder.testSuite().name(feature.name);
        feature.elements.forEach(function (scenario) {
            const result = getScenarioSummary(scenario);
            durationInSec += result.duration;
            if (result.status === 'failed') {
                suite.testCase()
                     .name(scenario.name)
                     .classname(scenario.id)
                     .failure(result.message)
                     .time(result.duration);            
            }
            else {
                suite.testCase()
                     .name(scenario.name)
                     .classname(scenario.id)
                     .time(result.duration);            
            }
        });
        suite.time(durationInSec);
    });
    builder.writeTo(options.outputXmlFile);  
}

function getScenarioSummary(scenario) {
    let status = 'passed';
    let message = null;
    let duration = 0;
    scenario.steps.forEach(function (step) {
        if (step.result.duration) {
            duration += step.result.duration; 
        }
        if (step.result.status == 'failed') {
            status = 'failed';
            message = step.result.error_message;
        } 
    });
    const durationInSec = duration / 1000000000; //ns to sec
    return { status: status, 
             message: message,
             duration: durationInSec
        }; 
}

module.exports = {
    convert: convert
};  