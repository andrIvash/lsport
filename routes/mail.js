'use strict';

/*
 Задача скрипта - отправка писем с сайта
 */

//подключаем модули
const route = require('express').Router(),
    //модуль для работы с почтой
    nodemailer = require('nodemailer'),
    config = require('../config.json');

//при получении post-запроса по адресу /mail
route.post('/', (req, res) => {
    //требуем наличия имени, обратной почты и текста
    if (!req.body.name || !req.body.email || !req.body.text) {
        //если что-либо не указано - сообщаем об этом
        return res.json({error: 'Укажите данные!'});
    }

    //инициализируем модуль для отправки писем и указываем данные из конфига
    const transporter = nodemailer.createTransport(config.mail.smtp),
        mailOptions = {
            from: `"${req.body.name}" <${req.body.email}>`,
            to: config.mail.smtp.auth.user,
            subject: config.mail.subject,
            text: req.body.text.trim().slice(0, 500)
        };

    //отправляем почту
    transporter.sendMail(mailOptions, function(error, info) {
        //если есть ошибки при отпарвке - сообщаем об этом
        if (error) {
            return res.json({error: error.message});
        }

        res.json({});
    });
});

module.exports = route;
