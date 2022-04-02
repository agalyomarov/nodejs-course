module.exports = function(req, res, next) {
    if (!req.session.isAuthenticated) {
        req.user = null;
        return res.redirect("/auth/login");
    }
    next();
};