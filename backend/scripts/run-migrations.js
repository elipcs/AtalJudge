
const { AppDataSource } = require('../dist/config/database');

async function run() {
    try {
        console.log('Connecting to database...');
        await AppDataSource.initialize();

        console.log('Running migrations...');
        await AppDataSource.runMigrations();

        console.log('Migrations completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

run();
