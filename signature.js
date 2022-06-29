const { OPTIONS } = require('./constants');
const  ProviderFactory  = require('./provider-factory');


class SignerValidator {

    /**
     * Generates batch of signatures for each version
     *
     * @typedef {object} options
     * @property {number} timestamp - timestamp of the signature. Defaults to Date.now()
     * @property {string} payload - stringified JSON body
     * @property {string} secret - signing key
     * @property {string} version - crypto provider version
     * @property {string} signature - computed signature
     * @returns multisignature string
    */
    sign(payload, secret, options) {
      if (typeof payload === 'object') {
        payload = JSON.stringify(payload);
      } else if (typeof payload !== 'string') {
        throw new Error(`Unable to sign payload. JSON or raw string reuired ${v}`);
      }

      if (!options || !options.versions) {
        console.log(`Using default crypto provider for ${OPTIONS.DEFAULT_VERSION} version`)
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const versions = options.versions || [OPTIONS.DEFAULT_VERSION];

      let signatures = [];
      versions.forEach(v => {
        const provider = getProvider(v);
        if (!provider) {
            throw new Error(`Unable to load crypto provider for version ${v}`);
        }

        const hash = provider.compute(
            timestamp + '.' + payload,
            secret
        );

        signatures.push(v + '=' + hash);
      });

      signatures.push('timestamp=' + timestamp);
      return signatures.join(',');
    };

    /**
     * Parses signature from batch and validates for certain version
     *
     * @typedef {object} options
     * @property {number} treshold - allowed age for signature
     * @property {string} payload - stringified JSON body
     * @property {string} secret - signing key
     * @property {string} version - crypto provider version
     * @property {string} signature - computed signature
     * @returns parsed JSON payload if signature is valid
    */
    validate(payload, signature, secret, options) {
      if (!options || !options.version) {
        console.log(`Using default crypto provider for ${OPTIONS.DEFAULT_VERSION} version`)
      }

      validSignatureFailOnInvalid(
        payload,
        signature,
        secret,
        options.treshold || OPTIONS.DEFAULT_TRESHOLD,
        options.version,
      )

      return JSON.parse(payload);
    }
}

/**
 * 
 * Helpers:
 * getProvider - returns crypto provider for version
 * parseSignature - parses signature from multisig string
 * validSignatureFailOnInvalid - validates signature
 */

function getProvider(version) {
    return ProviderFactory.get(version);
}

function validSignatureFailOnInvalid(
    payload,
    signature,
    secret,
    treshold,
    version
) {
    const parsed = parseSignature(signature, version);
    if (!parsed || parsed.timestamp === 0 || parsed.sig === null) {
        throw new Error(`Unable to parse signature ${signature} for version ${version}`);
    }

    const provider = getProvider(version);
    const expectedSignature = provider.compute(
        parsed.timestamp + '.' + payload,
        secret
    );

    if (parsed.sig !== expectedSignature) {
        throw new Error(`Unable to validate signature ${signature}. Does not match for version ${version}`);
    }
    
    const timestampTimeout = Math.floor(Date.now() / 1000) - parsed.timestamp;
    if (timestampTimeout > 0 && timestampTimeout >= treshold) {
        throw new Error(`Unable to validate signature ${signature}. Signature age is out of allowed treshold ${treshold} seconds`);
    }

    return true;
}

function parseSignature(signature, version) {
    if (typeof signature !== 'string') {
        return null;
    }
    
    return signature.split(',').reduce(
      (details, item) => {
          const kv = item.split('=');
    
          if (kv[0] === 'timestamp') {
            details.timestamp = kv[1];
          }
    
          if (kv[0] === version) {
            details.sig = kv[1];
          }
    
          return details;
        },
        {
          timestamp: 0,
          sig: null,
        }
    );   
}

module.exports = new SignerValidator;
