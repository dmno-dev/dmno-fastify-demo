import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return {
      demos: [
        `http://${request.host}/redact-logs`,
        `http://${request.host}/leak`,
        `http://${request.host}/intercept`
      ]
    }
  })

  fastify.get('/redact-logs', async function (request, reply) {
    // ! Logs redacted via console.log and default pino instance
    console.log('\nLOGGING A SECRET:', DMNO_CONFIG.SECRET_VAR, '\n');
    request.log.info({
      secretShouldBeRedacted: DMNO_CONFIG.SECRET_VAR,
    });
    return {
      message: 'this endpoint succeeds! but logs should be redacted',
    }
  })

  fastify.get('/leak', async function (request, reply) {
    // ! sensitive config returned in server responses are stopped
    return {
      leakedKey: DMNO_CONFIG.SECRET_VAR,
      message: 'this endpoint should throw due to leaking a secret in the response',
    }
  })

  fastify.get('/intercept', async function (request, reply) {
    // ! outgoing fetch requests are scanned and sensitive config must be sent to whitelisted domains
    await fetch('https://api.sampleapis.com/coffee/hot', {
      headers: {
        'x-auth': DMNO_CONFIG.SECRET_VAR
      }
    });
    
    return {
      message: 'this endpoint should throw due to a leaked secret'
    }
  })
}

export default root;
