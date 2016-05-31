'use strict';

/*
 Задача скрипта - описать модель пользователя
 У каждой пользователя есть логин и пароль
 При указании пароля, он автоматически шифруется алгоритмом MD5
 Все поля обязательны для заполнения
 */

const mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,
    UserSchema = new Schema({
        login: {
            type: String,
            required: [true, 'Укажите логин']
        },
        password: {
            type: String,
            required: [true, 'Укажите пароль'],
            set: v => v == '' ? v : crypto.createHash('md5').update(v).digest('hex')
        }
    });

//просим mongoose сохранить модель для ее дальнейшего использования
mongoose.model('user', UserSchema);
