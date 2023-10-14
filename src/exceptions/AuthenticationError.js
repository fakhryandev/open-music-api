const ClientError = require('./ClientError')

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401)
    this.message = 'AuthenticationError'
  }
}

module.exports = AuthenticationError

