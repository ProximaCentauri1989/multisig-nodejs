const crypto = require('crypto');

class HmacSha256Provider {
    compute(payload, secret) {
        return crypto
          .createHmac('sha256', secret)
          .update(payload, 'utf8')
          .digest('hex');
      }
}

module.exports = {
    HmacSha256Provider,
}