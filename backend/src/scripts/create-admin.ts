import 'reflect-metadata';
import { AppDataSource, initializeDatabase, closeDatabase } from '../config/database';
import { User } from '../models/User';
import { UserRole } from '../enums/UserRole';

async function createAdmin() {
    try {
        console.log('Initializing database connection...');
        await initializeDatabase();

        const userRepository = AppDataSource.getRepository(User);
        const adminEmail = 'admin@ataljudge.com';
        const adminPassword = '@Admin123!ataljudge';

        console.log(`Checking if admin user (${adminEmail}) exists...`);
        const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            console.log('Creating admin user...');
            const admin = new User();
            admin.name = 'System Admin';
            admin.email = adminEmail;
            admin.role = UserRole.PROFESSOR; // Professor has highest privileges
            admin.setEmail(adminEmail); // Ensure Email VO is valid
            await admin.setPassword(adminPassword);

            await userRepository.save(admin);
            console.log('Admin user created successfully!');
            console.log('-----------------------------------');
            console.log(`Email: ${adminEmail}`);
            console.log(`Password: ${adminPassword}`);
            console.log('-----------------------------------');
        }

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await closeDatabase();
    }
}

createAdmin();
