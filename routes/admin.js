'use strict';

/*
 Задача скрипта - обработка маршрутов админки
 */

//подключаем модули
const
//работа с файловой системой
    fs = require('fs'),
//работа с именами файлов и папок
    path = require('path'),
//маршрутизатор express
    route = require('express').Router(),
//работа с базой данных
    mongoose = require('mongoose'),
//модуль для получения файлов, загружаемых пользователем
    multiparty = require('multiparty'),
//конфиг
    config = require('../config.json'),
//список возможных навыков
    tech = require('../models/tech.json'),
//специальная функция, которая проверяет - авторизован ли пользователь
//и если не авторизован - перебрасывает его на главную страницу
    isAdmin = (req, res, next) => {
        //если в сессии текущего пользователя есть пометка о том, что он является администратором
        if (req.session.isAdmin) {
            //то всё хорошо :)
            return next();
        }

        //если нет, то перебросить пользователя на главную страницу сайта
        res.redirect('/');
    };

//при получении get-запроса по адресу /admin/works.html
route.get('/works.html', isAdmin, (req, res) => {
    //обрабатываем шаблон и отправляем его в браузер
    res.render('admin-3');
});

//при получении post-запроса по адресу /admin/works.html
route.post('/works.html', isAdmin, (req, res) => {
    //инициализируем модуль для получения загружаемых файлов и полей формы
    let form = new multiparty.Form();

    //получаем список полей и файлов
    form.parse(req, function(err, fields, files) {
        //если есть ошибки
        if (err) {
            //обрабатываем шаблон и отправляем его в браузер
            //в шаблон передаем старое содержимое полей(чтобы не вводить их заново) и описание ошибки
            res.render('admin-2', Object.assign(fields, {error: error}))
        } else {
            //если ошибок нет, то создаем новую работу и передаем в нее поля из формы
            const Model = mongoose.model('work'),
                item = new Model({name: fields.workName, tech: fields.workTech, link: fields.workLink});

            //сохраняем работу
            item.save().then(work => {
                //получаем список картинок и копируем кажду картинку в папку upload
                const pictures = files.workPicture.filter(f => f.size).map((file, key) => {
                    //формируем путь к файлу
                    const newFilePath = path.join('upload', `${work._id}_${key}${path.extname(file.path)}`);

                    //копируем файл
                    fs.writeFileSync(path.resolve(config.http.publicRoot, newFilePath), fs.readFileSync(file.path));

                    //возвращаем путь, по которому можно найти новый файл
                    return newFilePath;
                });

                //обновляем сохраненную работу, добавив массив путей к картинкам проекта
                return Model.update({_id: work._id}, {$pushAll: {pictures: pictures}});
            }, e => {
                throw new Error(Object.keys(e.errors).map(key => e.errors[key].message).join(', '));
            }).then(
                //обрабатываем шаблон и отправляем его в браузер
                i => res.render('admin-3', {message: 'Запись успешно добавлена!'}),
                e => res.render('admin-3', Object.assign(fields, {error: e}))
            );
        }
    });
});

//при получении get-запроса по адресу /admin/blog.html
route.get('/blog.html', isAdmin, (req, res) => {
    //обрабатываем шаблон и отправляем его в браузер
    res.render('admin-2');
});

//при получении post-запроса по адресу /admin/blog.html
route.post('/blog.html', isAdmin, (req, res) => {
    //создаем новую запись блога и передаем в нее поля из формы
    const Model = mongoose.model('blog'),
        item = new Model({title: req.body.itemName, date: req.body.itemDate, body: req.body.itemBody});

    //сохраняем запись в базе
    item.save().then(
        //обрабатываем шаблон и отправляем его в браузер
        i => res.render('admin-2', {message: 'Запись успешно добавлена!'}),
        e => {
            //если есть ошибки, то получаем их список и так же передаем в шаблон
            const error = Object.keys(e.errors).map(key => e.errors[key].message).join(', ');

            //обрабатываем шаблон и отправляем его в браузер
            res.render('admin-2', Object.assign(req.body, {error: error}))
        });
});

//при получении get-запроса по адресу /admin/about.html
route.get('/about.html', isAdmin, (req, res) => {
    //получаем модель навыков
    const Model = mongoose.model('tech');

    //получаем список процентов навыков
    Model.find().then(items => {
        //трансформируем навыки в такой вид, чтобы их было удобно передать в шаблон
        let form = items.reduce((prev, cur) => {
            prev[cur.section] = cur.items.reduce((prev, cur) => {
                prev[cur.name] = cur.value;

                return prev;
            }, {});

            return prev;
        }, {});

        //обрабатываем шаблон и отправляем его в браузер
        //передаем в шаблон список всех возможных навыков и их процент из админки
        res.render('admin', {tech: tech, form: form});
    });
});

//при получении post-запроса по адресу /admin/about.html
route.post('/about.html', isAdmin, (req, res) => {
    //получаем модель навыков
    const Model = mongoose.model('tech');
    //создаем массив, в который будем складывать навыки, которые нужно сохранить
    let models = [],
    //получаем данные, введенные в форму и преобразуем их в объект, с которым можно работать в дальнейшем
        form = Object.keys(req.body).map(i => i.match(/(.+)->(.+)/)).filter(i => i).reduce((prev, cur) => {
            prev[cur[1]] = prev[cur[1]] || {};
            prev[cur[1]][cur[2]] = req.body[`${cur[1]}->${cur[2]}`];

            return prev;
        }, {});

    //перебираем свойства полученного объекта и формируем записи, для сохранения в БД
    Object.keys(form).map(section => ({
        section: section,
        items: Object.keys(form[section]).map(i => ({name: i, value: form[section][i]}))
    })).forEach(toSave => models.push(new Model(toSave)));

    //получаем список записей, которые не прошли валидацию(проверку на корректную заполненность полей)
    //если такие записи есть
    if (models.filter(m => m.validateSync()).length) {
        //обрабатываем шаблон и отправляем его в браузер
        //передаем в шаблон список всех возможных навыков и их процент из админки
        res.render('admin', {
            tech: tech,
            form: form,
            error: 'Не удалось сохранить данные!'
        });
    } else {
        //если таких записей нет
        //удаляем старые записи из базы
        Model.remove({}).then(() => {
            //и добавляем новые
            return Model.insertMany(models).then(() => {
                //обрабатываем шаблон и отправляем его в браузер
                //передаем в шаблон список всех возможных навыков и их процент из админки
                res.render('admin', {
                    tech: tech,
                    form: form,
                    message: 'Сохранено!'
                });
            });
        });
    }
});

module.exports = route;
