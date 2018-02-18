'use strict';

const Audit = require('lighthouse').Audit;

const MAX_REQUEST_TIME = 3000;

class ApiTimeAudit extends Audit {
    static get meta() {
        return {
            category: 'MyPerformance',
            name: 'api-audit',
            description: 'Api time initialized and ready',
            failureDescription: 'API request requires more than 3 seconds',
            helpText: 'Used to measure time to request ratp Api',
            requiredArtifacts: ['ApiRequest']
        };
    }

    static audit(artifacts) {
        const loadedTime = artifacts.ApiRequest;

        const belowThreshold = loadedTime <= MAX_REQUEST_TIME;

        return {
            rawValue: loadedTime,
            score: belowThreshold
        };
    }
}

module.exports = ApiTimeAudit;
