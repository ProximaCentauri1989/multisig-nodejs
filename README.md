# signature-check

## Prepare environment
npm install

## Usage for testing

Use prepared cli in test.js

```console
node test.js --generate:case1
Output: v0=bd84404281fa89d9ae5d27af418cc3e9744029958ecdf2cbc0504b75b11589fd,timestamp=1656504175

node test.js --generate:case2
Output: Provider type not supported

node test.js --validate:case1
Output: { id: 1, description: 'dumb' }

node test.js --validate:case2
Output: Unable to validate signature v0=5c639bbbaaf50c64449decff8ef8f58d42af87bf8e2c62578fbf63a79b0f9c1f,timestamp=1656504245. Does not match for version v0

node test.js --validate:case3
Output: Unable to validate signature v0=4a764c252cdc9ed9d6da6e047ba8732facb7a600c0d1f6dbd758767288cfa2d3,timestamp=1656504274. Signature age is out of allowed treshold 2 seconds
```
