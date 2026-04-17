module.exports = {
  apps: [
    {
      name: 'smarttank-vite',
      script: 'npm',
      args: 'run dev',
      cwd: '/docker/openclaw-r4li/data/.openclaw/workspace/Pumpprice/frontend',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      env: {
        NODE_ENV: 'development',
      },
    },
    {
      name: 'smarttank-ngrok',
      script: '/docker/openclaw-r4li/data/.npm-global/lib/node_modules/ngrok/bin/ngrok',
      args: 'http --url=gentlemanlike-tantalizing-solange.ngrok-free.dev 5173 --config=/docker/openclaw-r4li/data/.config/ngrok/ngrok.yml',
      cwd: '/docker/openclaw-r4li/data/.openclaw/workspace/Pumpprice/frontend',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    }
  ]
};