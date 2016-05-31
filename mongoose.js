'use strict';

/*
 Задача скрипта - создать соединение с БД
 */

//подключаем модули
const mongoose = require('mongoose'),
    config = require('./config.json'),
//берем из конфига логин и пароль для соединения с базой
    options = {
        user: config.db.user,
        pass: config.db.password
    };

//создаем соединение с базой с параметрами из конфига
mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, options)
    .catch(e => {
        console.error(e);
        throw e;
    });

module.exports = mongoose;
