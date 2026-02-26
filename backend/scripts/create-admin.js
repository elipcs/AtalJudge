const { AppDataSource, initializeDatabase, closeDatabase } = require('../dist/config/database');
const { User } = require('../dist/models/User');
const { UserRole } = require('../dist/enums/UserRole');
const { Password } = require('../dist/domain/value-objects/Password');
const { Email } = require('../dist/domain/value-objects/Email');

async function createAdmin() {
    try {
        console.log('Initializing database connection...');
        await initializeDatabase();

        const userRepository = AppDataSource.getRepository(User);
        const adminEmail = 'admin@ataljudge.com';

        console.log(`Checking if admin user (${adminEmail}) exists...`);
        const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            console.log('Creating admin user...');
            const admin = new User();
            admin.name = 'System Admin';
            admin.email = adminEmail;
            admin.role = UserRole.PROFESSOR;
            admin.email = adminEmail;

            // Password hashing
            const passwordVO = await Password.create('@Admin123!ataljudge');
            admin.passwordHash = passwordVO.getHash();

            await userRepository.save(admin);
            console.log('Admin user created successfully!');
            console.log('-----------------------------------');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: @Admin123!ataljudge`);
            console.log('-----------------------------------');
        }

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await closeDatabase();
    }
}

createAdmin();
