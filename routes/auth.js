'use strict';

/*
 Задача скрипта - авторизация пользователя
 */

//подключаем модули
const route = require('express').Router(),
    mongoose = require('mongoose'),
    crypto = require('crypto');

//при получении post-запроса по адресу /auth
route.post('/', (req, res) => {
    //требуем наличия логина и пароля в теле запроса
    if (!req.body.login || !req.body.password) {
        //если не указан логин или пароль - сообщаем об этом
        return res.json({error: 'Укажите логин и пароль!'});
    }

    //получаем модель пользователя и шифруем введенный пароль
    const Model = mongoose.model('user'),
        password = crypto.createHash('md5').update(req.body.password).digest('hex');

    //пытаемся найти пользователя с указанным логином и паролем
    Model.findOne({login: req.body.login, password: password}).then(item => {
        //если такой пользователь не найден - сообщаем об этом
        if (!item) {
            res.json({error: 'Логин и/или пароль введены неверно!'});
        } else {
            //если найден, то делаем пометку об этом в сессии пользователя, который сделал запрос
            req.session.isAdmin = true;
            res.json({});
        }
    });
});

module.exports = route;
