module.exports = function(req, res, next) {
    if (!req.session.isAuthenticated) {
        req.user = {};
        return res.redirect("/auth/login");
    }
    next();
};