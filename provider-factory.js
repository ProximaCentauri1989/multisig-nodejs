const { HmacSha256Provider } = require('./hmac-sha256-provider');

class ProviderFactory {
    constructor() {
        // Add providers
        this.hmacSha256Provider = null; // v0
    }

    get(version) {
        switch(version) {
            case 'v0':
                if (!this.hmacSha256Provider)  {
                    this.hmacSha256Provider = new HmacSha256Provider();
                }
                return this.hmacSha256Provider;
            default:
                throw new Error('Provider type not supported');
        }
    }
}

module.exports = new ProviderFactory();