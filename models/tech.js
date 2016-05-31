'use strict';

/*
 Задача скрипта - описать модель списка навыкоы
 Модель описана в виде категори со списком навыков
 */

const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    TechSchema = new Schema({
        section: {
            type: String
        },
        items: {
            type: [{
                name: {
                    type: String
                },
                value: {
                    type: Number,
                    default: 0
                }
            }]
        }
    });

//просим mongoose сохранить модель для ее дальнейшего использования
mongoose.model('tech', TechSchema);
