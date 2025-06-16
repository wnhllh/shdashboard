module.exports = {
  version: '2.0',
  framework: {
    name: 'shanghai-cybersecurity-dashboard',
    plugins: {
      website: {
        use: '@cloudbase/framework-plugin-website',
        inputs: {
          installCommand: 'npm install --prefer-offline --no-audit --progress=false',
          buildCommand: 'npm run build',
          outputPath: 'dist',
          cloudPath: '/shanghai-cybersecurity-dashboard',
        },
      },
    },
  },
}; 