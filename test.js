const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const SignerValidator = require('./signature');

const payload = {
    id: 1,
    description: 'dumb'
};
const knownVersions = ['v0'];
const unknownVersions = ['v1'];
const correctSecret = 'correctSecret'
const incorrectSecret = 'incorrectSecret';
const delay = 2; // seconds

const sections = [
    {
        header: 'Script',
        content:
            'Interacts signer and validator implementation to test different use cases',
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'generate:case1',
                typeLabel: ' ',
                description: 'generate:case1',
            },
            {
                name: 'generate:case2',
                typeLabel: ' ',
                description: 'generate:case2',
            },
            {
                name: 'validate:case1',
                typeLabel: ' ',
                description: 'validate:case1',
            },
            {
                name: 'validate:case2',
                typeLabel: ' ',
                description: 'validate:case2',
            },
            {
                name: 'validate:case3',
                typeLabel: ' ',
                description: 'validate:case3',
            },
        ],
    },
];

const optionDefinitions = [
   { name: 'generate:case1'},
   { name: 'generate:case2'},
   { name: 'validate:case1'},
   { name: 'validate:case2'},
   { name: 'validate:case3' },
   { name: 'treshold'},
   { name: 'version'},
   { name: 'validateWithCorrectSecret'},
   { name: 'validateWithIncorrectSecret'}
];

const runDelay = ms => new Promise(resolve => setTimeout(resolve, ms))

function generateWithKnownVersion(secret) {
    const signature = SignerValidator.sign(
        payload,
        secret,
        { 
            versions : knownVersions
        },
    )
    return signature;
}

function generateWithUnknownVersion(secret) {
    try {
        SignerValidator.sign(
            payload,
            secret,
            { 
                versions : unknownVersions
            },
        )
    } catch(err) {
        return err.message;
    }
}

function validateWithCorrectSecret(correctSecret) {
    const sig = generateWithKnownVersion(correctSecret);
    const parsedPayload = SignerValidator.validate(
        JSON.stringify(payload),
        sig,
        correctSecret,
        { 
            version : knownVersions[0]
        },
    )
    return parsedPayload;
}

function validateWithIncorrectSecret(signingKey) {
    try {
        const sig = generateWithKnownVersion(correctSecret);
        // validate with incorrect secret
        SignerValidator.validate(
            JSON.stringify(payload),
            sig,
            signingKey,
            { 
                version : knownVersions[0]
            },
        )
    } catch(err) {
        console.log(err.message)
        return err.message;
    }    
}

async function validateWithIncorrectTreshold() {
    try {
        const sig = generateWithKnownVersion(correctSecret);
        await runDelay(delay*1000);
        // validate with incorrect secret
        SignerValidator.validate(
            JSON.stringify(payload),
            sig,
            correctSecret,
            { 
                version : knownVersions[0],
                treshold: delay,
            },
        )
    } catch(err) {
        return err.message;
    }    
}

const main = async () => {
    const usage = commandLineUsage(sections);

    try {
        const options = commandLineArgs(optionDefinitions);
        if ('generate:case1' in options) {
            const sig = generateWithKnownVersion(correctSecret);
            console.log(sig);
        } else if ('generate:case2' in options) {
            const errResult = generateWithUnknownVersion(correctSecret);
            console.log(errResult);
        } else if ('validate:case1' in options) {
            const parsedPayload = validateWithCorrectSecret(correctSecret);
            console.log(parsedPayload);
        } else if ('validate:case2' in options) {
            const errResult = validateWithIncorrectSecret(incorrectSecret);
            console.log(errResult);
        } else if ('validate:case3' in options) {
            const errResult = await validateWithIncorrectTreshold();
            console.log(errResult);
        }
    } catch (e) {
        console.log(e);
        console.log(usage);
    }
    return 0;
};

main()
    .then()
    .catch((e) => {
        console.log(e);
    });