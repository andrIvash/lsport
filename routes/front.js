'use strict';

/*
 Задача скрипта - обработка маршрутов фронтенда
 */

//подключаем модули
const route = require('express').Router(),
    mongoose = require('mongoose'),
    tech = require('../models/tech.json');

//при получении get-запроса /
route.get('/', (req, res) => {
    //обрабатываем шаблон и отправляем его в браузер
    res.render('auth');
});

//при получении get-запроса /blog.html
route.get('/blog.html', (req, res) => {
    //получаем модель записей блога
    const Model = mongoose.model('blog');

    //получаем список записей в блоге из базы
    Model.find().then(items => {
        //обрабатываем шаблон и отправляем его в браузер
        //передаем в шаблон список записей в блоге
        res.render('blog', {items: items});
    });
});

//при получении get-запроса /works.html
route.get('/works.html', (req, res) => {
    const Model = mongoose.model('work');

    //получаем список работ из базы
    Model.find().then(items => {
        //обрабатываем шаблон и отправляем его в браузер
        //передаем в шаблон список работ
        console.log(items);
        res.render('works', {items: items});
    });
});

//при получении get-запроса /about.html
route.get('/about.html', (req, res) => {
    const Model = mongoose.model('tech');

    //получаем проценты навыков из базы
    Model.find().then(items => {
        //трансформируем навыки из базы в вид - удобный для передачи в шаблон
        let form = items.reduce((prev, cur) => {
            prev[cur.section] = cur.items.reduce((prev, cur) => {
                prev[cur.name] = cur.value;

                return prev;
            }, {});

            return prev;
        }, {});

        //обрабатываем шаблон и отправляем его в браузер
        //передаем в шаблон список всех возможных навыков и их процент из админки
        res.render('about', {tech: tech, form: form});
    });
});

module.exports = route;
