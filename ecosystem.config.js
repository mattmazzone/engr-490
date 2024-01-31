module.exports = {
    apps: [
        {
                name: "tw-node-backend",
                script: 'npm',
                args: 'run start',
                instances: 1,
                autorestart: true,
                max_memory_restart: '6G',
                exec_mode: 'fork',
                watch: true,
                cwd: "backend/"
        },
        {
                name: "tw-frontend",
                script: 'npm',
                args: 'run web',
                watch: false,
                cwd: "frontend/Tripwise/"
        }
    ]
};
