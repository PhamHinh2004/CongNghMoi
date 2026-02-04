exports.checkRole = (role) => {
    return (req, res, next) => {
        // Giả sử bạn lưu user vào session sau khi đăng nhập
        if (req.session.user && req.session.user.role === role) {
            return next();
        }
        res.status(403).send("Bạn không có quyền thực hiện hành động này!");
    };
};