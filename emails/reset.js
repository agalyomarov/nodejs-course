const keys = require("../keys");

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: "Восстановление досдупа",
        html: `
        <h1>Вы забыли парол</h1>
        <p>Если нетб то проигнорируйте данное писмо</p>
        <p>Иначе нажмите на сcылку:</p>
        <a href="${keys.BASE_URL}/auth/password/${email}/${token}">Ввостоновить доступ</a>
        <hr/>
        <a href="${keys.BASE_URL}">Магазин курсов</a>
        `,
    };
};