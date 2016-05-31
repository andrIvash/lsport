'use strict';

/*
 Задача скрипта - описать модель проекта
 У каждого проекта есть имя, список используемых технологий, ссылка на проект и картинки
 Все поля(кроме картинок) обязательны для заполнения
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    WorkSchema = new Schema({
        name: {
            type: String,
            required: [true, 'Укажите имя проекта']
        },
        tech: {
            type: String,
            required: [true, 'Укажите используемые технологии']
        },
        link: {
            type: String,
            required: [true, 'Укажите ссылку на проект']
        },
        pictures: {
            type: [String]
        }
    });

//просим mongoose сохранить модель для ее дальнейшего использования
mongoose.model('work', WorkSchema);
