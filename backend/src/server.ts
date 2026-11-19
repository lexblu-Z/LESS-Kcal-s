import { app } from './app.js';
import { ENV } from './config/env.js';

const server = app.listen(ENV.PORT, () => {
  console.log(`🚀 Servidor LESS-Kcal-s rodando na porta ${ENV.PORT}`);
  console.log(`👉 Health check: http://localhost:${ENV.PORT}/api/health`);
  console.log(`👉 Ambiente: ${ENV.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  console.log('Recebido sinal SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recebido sinal SIGINT, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado com sucesso.');
    process.exit(0);
  });
});
