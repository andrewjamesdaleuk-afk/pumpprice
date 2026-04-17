module.exports = {
  apps: [
    {
      name: "pumpprice-ui",
      cwd: "./frontend",
      script: "npm",
      args: "run preview",
      env: {
        NODE_ENV: "production",
        PORT: 3005
      },
      error_file: "../logs/pumpprice-ui-error.log",
      out_file: "../logs/pumpprice-ui-out.log"
    },
    {
      name: "pumpprice-vite",
      cwd: "./frontend",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development"
      },
      error_file: "../logs/pumpprice-vite-error.log",
      out_file: "../logs/pumpprice-vite-out.log"
    }
  ]
};
