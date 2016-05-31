'use strict';

/*
 Точка входа в приложение.
 Задача скрипта- инициализировать http-сервер, соединение с базой и модели
 */

//подключаем все используемые модули
const
//работа с файловой системой
    fs = require('fs'),
//работа с именами файлов и папок
    path = require('path'),
//работа с http-сервером
    express = require('express'),
//работа с базой данных
    mongoose = require('./mongoose'),
//шаблонизация
    jade = require('jade'),
//логирование http-запросов в консоли
    morgan = require('morgan'),
//модуль, позволяющий получать доступ к телу post-запроса
    bodyParser = require('body-parser'),
//работа с сессиями
    session = require('express-session'),
//создаем express-приложение
    app = express(),
//модуль, при помощи которого можно хранить сессии в mongo.db
    MongoStore = require('connect-mongo')(session),
//подключаем конфигурационный файл
    config = require('./config.json');

//подключаем модели(сущности, описывающие коллекции базы данных)
require('./models/blog');
require('./models/work');
require('./models/tech');
require('./models/user');

//просим express использовать jade в качестве обработчика шаблонов
app.set('view engine', 'jade');
//говорим express - где хранятся шаблоны
app.set('views', path.resolve(`./${config.http.publicRoot}/markups/_pages`));
//настраиваем параметры сессии
app.use(session({
    secret: 'loftschool',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

//говорим express где он должен брать статику (js, css, картинки и т.д.)
app.use(express.static(path.resolve(config.http.publicRoot)));
//просим express использовать body parser
app.use(bodyParser.urlencoded({extended: false}));
//просим express использовать morgan
app.use(morgan('dev'));

//настраиваем маршруты
//указываем маршруты относительно корня сайта
app.use('/', require('./routes/front'));
//указываем маршруты относительно раздела admin
app.use('/admin', require('./routes/admin'));
//указываем маршруты относительно раздела auth
app.use('/auth', require('./routes/auth'));
//указываем маршруты относительно раздела mail
app.use('/mail', require('./routes/mail'));

//обработчик страницы 404
//если стребуемая страница не найдена - будет выполнена указанная функция
//обработчики 404 страниц должны быть указаны в самом конце настройки маршрутов
app.use((req, res, next) => res.status(404).send('Не удается найти страницу!'));

//обработка ошибок сервера
//при возникновении ошибок при обработке запроса(например exception), будет выполнена указанная функция
//от обычного обработчка маршрутов, эта функция отличается тем, что имеет 4 параметра
//там express отличает обработчики маршрутов от обработчиков ошибок
app.use((err, req, res, next) => {
    res.status(500);
    res.render('error', {error: err.message});
    console.error(err.message, err.stack);
});

//после всех настроек - запускаем сервер с параметрами из конфига
app.listen(config.http.port, config.http.host, () => {
    //получаем абсолютный путь к папке upload, в которую будут загружаться картинки проектов
    const uploadDir = path.resolve(config.http.publicRoot, 'upload');

    //если такой папки нет - создаем ее
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    console.log(`Server is up on ${config.http.host}:${config.http.port}!`);
});
