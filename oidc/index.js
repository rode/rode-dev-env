const {Provider} = require('oidc-provider');
const {URL} = require('url');

const ISSUER_URL = process.env.ISSUER_URL || 'http://localhost:3000';

const clientRoles = {
    administrator: 'Administrator',
    collector: 'Collector',
    enforcer: 'Enforcer',
    'application-developer': 'ApplicationDeveloper',
    'policy-developer': 'PolicyDeveloper',
    'policy-administrator': 'PolicyAdministrator',
};

const clients = Object.keys(clientRoles).map((clientId) => ({
    client_id: clientId,
    client_secret: clientId,
    redirect_uris: [],
    response_types: [],
    grant_types: ['client_credentials'],
}));

const config = {
    accessTokenFormat: 'jwt',
    clients: clients,
    features: {
        clientCredentials: {
            enabled: true,
        },
        devInteractions: {
            enabled: false
        },
        resourceIndicators: {
            enabled: true,
            defaultResource: () => 'http://rode.example.com',
            getResourceServerInfo: () => ({
                audience: 'rode',
                scope: 'rode',
                accessTokenTTL: 5 * 60,
                accessTokenFormat: 'jwt',
            })
        }
    },
    formats: {
        customizers: {
            jwt: async (ctx, token, jwt) => {
                const clientRole = clientRoles[token.clientId];
                if (clientRole) {
                    jwt.payload.roles = [clientRole];
                }
            }
        },
    },
    ttl: {
        ClientCredentials: () => 5 * 60
    }
};

(() => {
    const oidc = new Provider(ISSUER_URL, config);
    const issuerUrl = new URL(ISSUER_URL);

    const handler = (signal) => () => {
        console.log(`Received ${signal}, shutting down`);
        process.exit(0);
    }
    ['SIGINT', 'SIGTERM'].forEach((signal) => process.once(signal, handler(signal)));

    oidc.listen(issuerUrl.port, () => {
        console.log(`oidc provider started: ${ISSUER_URL}/.well-known/openid-configuration`);
    });
})();
