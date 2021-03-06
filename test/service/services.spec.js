'use strict'

let rootPath = '../../'
let moment = require('moment')
let tv4 = require('tv4')
let ware = require('ware')
let serviceSchema = require(`${rootPath}lib/schema/service`)
let config = require(`${rootPath}config`)

let verifyResponse = (done) => {
  return (err, req, res) => {
    if (err) return done(err)

    let result = tv4.validateResult(res, serviceSchema.menu, true, true)
    if (!result.valid) return done(result)

    done()
  }
}

let createServiceTests = (serviceName, middleware) => {
  describe(`menu service: ${serviceName}`, function () {
    this.timeout(5 * 1000)

    it('can correctly parse lunch menu', (done) => {
      let req = {data: {}}
      let res = {menu: {}}
      middleware.run(req, res, verifyResponse(done))
    })

    it('returns today\'s lunch menu', (done) => {
      let req = {data: {
        date: moment.utc().format('YYYY-MM-DD')
      }}
      let res = {menu: {}}
      middleware.run(req, res, verifyResponse(done))
    })

    it('returns next lunch menu', (done) => {
      let req = {data: {
        date: moment.utc().format('YYYY-MM-DD'),
        next: true
      }}
      let res = {menu: {}}
      middleware.run(req, res, verifyResponse(done))
    })
  })
}

describe('menu services', () => {
  for (let i = 0; i < config.SERVICES.length; i++) {
    let serviceName = config.SERVICES[i].name
    let service = require(`${rootPath}service/scrapper/${serviceName}`)()
    let middleware = ware().use(service.middleware)

    createServiceTests(serviceName, middleware)
  }
})
