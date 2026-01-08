const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

module.exports = (db) => {
    // Admin login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        db.getUserByEmail(email, (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user || !user.is_admin) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err || !result) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                req.session.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    is_admin: user.is_admin
                };

                res.json({
                    success: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    }
                });
            });
        });
    });

    // Check authentication status
    router.get('/status', (req, res) => {
        if (req.session.user && req.session.user.is_admin) {
            res.json({
                authenticated: true,
                user: req.session.user
            });
        } else {
            res.json({ authenticated: false });
        }
    });

    // Logout
    router.post('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Logout failed' });
            }
            res.json({ success: true });
        });
    });

    return router;
};