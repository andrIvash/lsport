'use strict';

/*
 Задача скрипта - описать модель записи блога
 У каждой записи в блоге есть заголовок, дата и тело
 Все поля обязательны для заполнения
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BlogSchema = new Schema({
        title: {
            type: String,
            required: [true, 'Укажите заголовок статьи']
        },
        body: {
            type: String,
            required: [true, 'Укажите содержимое статьи']
        },
        date: {
            type: String,
            required: [true, 'Укажите дату публикации']
        }
    });

//просим mongoose сохранить модель для ее дальнейшего использования
mongoose.model('blog', BlogSchema);
