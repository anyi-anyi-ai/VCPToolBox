module.exports = {
  apps: [
    {
      name: 'vcp-server',
      cwd: 'H:/VCP/VCPzhangduan/VCPToolBox',
      script: 'server.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production'
      },
      out_file: './logs/vcp-server-out.log',
      error_file: './logs/vcp-server-error.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};