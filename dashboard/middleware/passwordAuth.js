module.exports = function(config) {
    return function passwordAuth(req, res, next) {
        // Check if password protection is enabled
        if (!config.dashBoard.passwordProtection.enable) {
            return next();
        }

        // Login and logout routes
        if (req.path === '/login') {
            if (req.method === 'GET') {
                return res.render('login', { config });
            } else if (req.method === 'POST') {
                const { password } = req.body;
                const correctPassword = config.dashBoard.passwordProtection.password;
                
                if (password === correctPassword) {
                    req.session.authenticated = true;
                    return res.json({ success: true });
                } else {
                    return res.json({ success: false, message: 'Invalid password' });
                }
            }
        }

        if (req.path === '/logout' && req.method === 'POST') {
            req.session.destroy();
            return res.json({ success: true });
        }

        // List of paths that REQUIRE authentication
        const protectedPaths = ['/appstate', '/api/file/account.txt'];
        const isProtected = protectedPaths.some(path => req.path.startsWith(path));

        // Check if user is authenticated for protected paths
        if (isProtected && !req.session.authenticated) {
            if (req.xhr || req.path.startsWith('/api/')) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }
            return res.redirect('/login');
        }

        next();
    };
};
