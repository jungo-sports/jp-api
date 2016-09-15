var randomstring = require('randomstring'),
    CodeDao = require('../persistence/code/code-dao');

function CodeService() {};

function CodeServiceBuilder() {
    this.length = 16;
    this.capitalization = null;
    this.charset = 'alphanumeric';

    this.withLength = function(length) {
        if (isNaN(length)) {
            throw new TypeError('CodeServiceBuilder#withLength(...) requires integer value');
        }
        this.length = parseInt(length);
        return this;
    };

    this.withCapitalization = function(capitalization) {
        if (['lowercase', 'uppercase', null].indexOf(capitalization) === -1) {
            throw new Error('CodeServiceBuilder#withCapitalization(...) invalid capitalization defined');
        }
        this.capitalization = capitalization;
        return this;
    };

    this.withCharset = function(charset) {
        if (['alphanumeric', 'alphabetic', 'numeric', 'hex'].indexOf(charset) === -1) {
            throw new Error('CodeServiceBuilder#withCharset(...) invalid charset defined');
        }
        this.charset = charset;
        return this;
    };
    
    this.build = function() {
        return randomstring.generate(
            {
                length: this.length,
                charset: this.charset,
                capitalization: this.capitalization
            }
        );
    };
};

CodeService.prototype.getBuilder = function() {
    return new CodeServiceBuilder();
};

CodeService.prototype.getById = function(id) {
    return CodeDao.getById(id);
};

CodeService.prototype.getByCode = function(code) {
    return CodeDao.getByCode(code);
};

CodeService.prototype.generateCode = function(builder, expirationDate, extra) {
    if (!(builder instanceof CodeServiceBuilder)) {
        throw new TypeError('CodeService#generateCode(...) requires a valid builder');
    }
    if ((extra instanceof Object)) {
        extra = JSON.stringify(extra);
    }
    var _this = this;
    return CodeDao.addCode(builder.build(), expirationDate, extra)
        .then(
            function onSuccess(data) {
                if (!data) {
                    return data;
                }
                return _this.getById(data.id);
            }
        );
};

module.exports = new CodeService();