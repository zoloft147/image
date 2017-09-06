$(function () { 
    $(window).bind('load', function(){
        var canvas = document.getElementById("my-canvas");
        var ctx = canvas.getContext("2d");
        console.log(ctx);
        let image = document.getElementById("bird1");
        let width = image.clientWidth;

        ctx.drawImage(image, 0, 0, 275, 183);
    });
});