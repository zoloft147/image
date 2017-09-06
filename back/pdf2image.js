var PDFImage = require("pdf-image").PDFImage;

var pdfImage = new PDFImage("buildiOS.pdf");
pdfImage.convertPage(200).then(function (imagePath) {
 // 0-th page (first page) of the slide.pdf is available as slide-0.png 
 fs.existsSync("sampleBuild200.png") // => true 
});