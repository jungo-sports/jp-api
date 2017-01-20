var q = require('q'),
    stream = require('stream'),
    AWS = require('aws-sdk'),
    sharp = require('sharp'),
    apiConfig = require('../utils/api-config');

function MediaService() {
    AWS.config.region = apiConfig.get('services.s3.region');
    this.bucket = apiConfig.get('services.s3.bucket');
    this.client = new AWS.S3(
        {
            accessKeyId: apiConfig.get('services.aws.key'),
            secretAccessKey: apiConfig.get('services.aws.secret')
        }
    );
}

function _uploadImage(imageData, key, options) {
    var _this = this,
        deferred = q.defer();

    options = options || {};

    this.client.upload(
        {
            Bucket: _this.bucket,
            Key: key,
            Body: new Buffer(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
            ContentEncoding: 'base64',
            ContentType: options.contentType || 'image/jpeg',
            ACL: 'public-read'
        },
        function onUploadResponse(error, data) {
            if (error) {
                deferred.reject(error);
            } else {
                deferred.resolve(data);
            }
        }
    );
    return deferred.promise;
}

MediaService.prototype.uploadImage = function(imageData, key, options) {
    var _this = this;
    options = options || {};

    if (options.size) {
        var dimensions = options.size.split('x');
        return sharp(new Buffer(imageData, 'base64'))
            .resize(parseInt(dimensions[0]), parseInt(dimensions[1]))
            .min()
            .toBuffer()
            .then(
                function onSuccess(data) {
                    return _uploadImage.call(_this, data.toString('base64'), key, options);
                }
            );
    } else {
        return _uploadImage.call(_this, imageData, key, options);
    }
};

module.exports = new MediaService();