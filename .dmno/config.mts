import { OnePasswordDmnoPlugin } from '@dmno/1password-plugin';
import { DmnoBaseTypes, defineDmnoService, switchBy } from 'dmno';
import { GitDataTypes } from 'dmno/vendor-types';

const onePass = new OnePasswordDmnoPlugin('1pass', {
  fallbackToCliBasedAuth: true,
});

export default defineDmnoService({
  isRoot: true,
  schema: {
    SOME_API_KEY: { // ~ validation demo
      extends: DmnoBaseTypes.string({ startsWith: 'xyz_'}),
      value: 'xyz_123'
    },
    NUMBER_ITEM: { // ~ coercion demo
      extends: DmnoBaseTypes.number({ precision: 2 }),
      value: '123.45678', // coerced to number and rounded according to settings
    },
    FN_DEMO: {
      value: () => DMNO_CONFIG.NUMBER_ITEM * 2,
    },

    DB_URL: { // ~ intellisense/docs demo
      summary: 'Primary DB URL',
      required: true,
      description: 'houses all of our users, products, and orders data',
      typeDescription: 'Postgres connection url',
      externalDocs: {
        description: 'explanation (from prisma docs)',
        url: 'https://www.prisma.io/dataguide/postgresql/short-guides/connection-uris#a-quick-overview',
      },
      ui: {
        // uses iconify names, see https://icones.js.org for options
        icon: 'akar-icons:postgresql-fill',
        color: '336791', // postgres brand color :)
      },
      sensitive: true,
      value: 'postgres://localhost:5432/my-api-db'
    },

    INTELLISENSE_DEMO: { // ~ show intellisense
      value: () => DMNO_CONFIG.DB_URL,
    },
    GIT_BRANCH: { // ~ type system means we get this stuff for free!
      extends: GitDataTypes.BranchName,
    },

    MY_APP_ENV: { // ~ custom app env flag, used in switch demo below
      extends: DmnoBaseTypes.enum(['development', 'staging', 'production']),
      value: 'development',
    },
    SWITCH_DEMO: {
      value: switchBy('MY_APP_ENV', {
        _default: 'dev val',
        staging: 'staging val',
        production: 'production val',
      }),
    },
    ONEPASS_ITEM: { // ~ plugins, fetching from backends
      value: onePass.itemByReference('op://dev test/example/staging'),
    },

    // ~ EXAMPLE FASTIFY APP CONFIG ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    PORT: {
      extends: DmnoBaseTypes.port,
      description: 'port to listen on - Fastify CLI will automatically pick this up from the env',
      value: 4321,
    },

    SOME_CONFIG_ITEM: {
      value: 'config-value-from-dmno!',
    },
    SECRET_VAR: { // ~ sensitive demo
      value: switchBy('MY_APP_ENV', {
        _default: 'shhh-im-secret', // but not actually sensitive
        staging: onePass.itemByReference('op://dev test/example/staging'),
        production: onePass.itemByReference('op://dev test/example/production'),
      }),
      sensitive: true,
      description: 'super secret key used to communicate with api',
      // sensitive: {
      //   redactMode: 'show_last_2',
      //   allowedDomains: ['api.sampleapis.com']
      // }
    },
  },
});
