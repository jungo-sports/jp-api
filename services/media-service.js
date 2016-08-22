var q = require('q'),
    stream = require('stream'),
    AWS = require('aws-sdk'),
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
};

MediaService.prototype.uploadImage = function(imageData, key) {
    var _this = this,
        deferred = q.defer(),
        dataStream = new stream.Readable();

    dataStream._read = function noop(){};
    dataStream.push(new Buffer(imageData, 'base64'));
    dataStream.push(null);

    this.client.upload(
        {
            Bucket: _this.bucket,
            Key: key,
            Body: dataStream,
            ContentType: 'image/jpeg',
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
};

module.exports = new MediaService();