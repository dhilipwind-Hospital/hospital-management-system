const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      // Use backend service name when running in Docker
      target: 'http://backend:5000',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api': '/api' }, // Keep /api prefix when forwarding to backend
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(504).send({ message: 'Gateway Timeout - Backend service may be unavailable' });
      },
    })
  );
};
