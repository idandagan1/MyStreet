const ENV = process.env,
    env = 'development',
    SERVER_DEV_PORT = 8001,
    port = SERVER_DEV_PORT,
    clientport = 8000,
    host = ENV.IP || '127.0.0.1',
    db = 'mongodb://localhost/mystreet',
    url = 'http://localhost';

module.exports = {
    port,
    clientport,
    host,
    db,
    url,
    env,
}
