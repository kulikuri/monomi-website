const Database = require('./server/models/database');

console.log('Initializing database...');
const db = new Database();

// Wait for database to initialize
setTimeout(() => {
    console.log('Testing database...');

    // Test creating a user
    db.createUser({
        name: 'Test User',
        email: 'test@example.com',
        ip_address: '127.0.0.1',
        user_agent: 'Test'
    }, (err, userId) => {
        if (err) {
            console.error('Error creating user:', err);
            process.exit(1);
        }

        console.log('✅ User created:', userId);

        // Test creating conversation
        db.createConversation(userId, (err, convId) => {
            if (err) {
                console.error('Error creating conversation:', err);
                process.exit(1);
            }

            console.log('✅ Conversation created:', convId);
            console.log('✅ Database is working!');
            process.exit(0);
        });
    });
}, 3000); // Wait 3 seconds for init
