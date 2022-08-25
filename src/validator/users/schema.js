const Joi = require('joi')

const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().require(),
  fullname: Joi.string().required(),
})

module.exports = {
  UserPayloadSchema,
}

