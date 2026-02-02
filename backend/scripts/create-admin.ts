
import 'reflect-metadata';
import { AppDataSource } from '../src/config/database';
import { User } from '../src/models/User';
import { UserRole } from '../src/enums';

async function run() {
    try {
        console.log('Connecting to database...');
        // Ensure we pick up environment variables if not already loaded (though bun usually loads .env)
        // Assuming the script is run in an environment where ENV vars are set (like inside docker)
        await AppDataSource.initialize();

        const userRepo = AppDataSource.getRepository(User);
        const email = 'admin@computacao.ufcg.edu.br';

        console.log(`Checking for user: ${email}`);
        let user = await userRepo.findOneBy({ email });

        if (user) {
            console.log('User already exists. Updating password and role...');
        } else {
            console.log('Creating new user...');
            user = new User();
            user.email = email;
        }

        user.name = 'Admin';
        user.role = UserRole.PROFESSOR;
        // Set password using the logic defined in User entity which uses Password Value Object
        await user.setPassword('@ATALJUDGE!admin20252');

        await userRepo.save(user);
        console.log('Admin user created/updated successfully.');
        console.log(`Email: ${email}`);
        console.log('Role: PROFESSOR');

    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

run();
