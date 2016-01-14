/**
 * Code from: https://github.com/heartnetkung/node-fancy-qr
 * This code have a little changes, to return a buffer and not write a file
 */

var QRCode = require('qrcode');

var drawLogo = function(logoPath, canvas, callback) {
    var img = new QRCode.canvas.Image(),
        ctx = canvas.getContext('2d');

    console.log(canvas.width);
    img.src = logoPath;
    var x = (canvas.width - img.width) / 2,
        y = (canvas.height - img.height) / 2;
    ctx.drawImage(img, x, y, img.width, img.height);
    callback(null, canvas);
};
var changeColor = function(r, g, b, canvas) {
    var ctx = canvas.getContext('2d'),
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0, ii = imgData.data.length; i < ii; i += 4) {
        imgData.data[i] = r | imgData.data[i];
        imgData.data[i + 1] = g | imgData.data[i + 1];
        imgData.data[i + 2] = b | imgData.data[i + 2];
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas
};

var perform = exports.draw = function(text, options, nextStep) {
    QRCode.draw(text, {
        errorCorrectLevel: options.err
    }, function(err, canvas) {
        if (err)
            nextStep(err, null);
        if (options.r || options.g || options.b)
            canvas = changeColor(options.r, options.g, options.b, canvas);
        if (options.logoPath)
            drawLogo(options.logoPath, canvas, nextStep);
        else
            nextStep(null, canvas);
    });
};

exports.save = function(text, options, callback) {
    perform(text, options, function(err, canvas) {
        if (err)
            callback(err);

        var buff = [];
        //var out = fs.createWriteStream(outputPath);
        var stream = canvas.pngStream();
        stream.on('data', function(chunk) {
            buff.push(chunk);
        });
        stream.on('end', function() {
            var buf = Buffer.concat(buff);
            callback(null, buf);
        });
    });
};