var pager = {
	showImage: function showImage(imgId, folder, images, next){//00,01,11,10
		var img = document.getElementById(imgId);
		var currentImage = img.src ? img.src.replace(/^.*[\\\/]+/, '') : null;
		var ii = !currentImage ? 0 : (images.indexOf(currentImage) + (next ? 1 : -1));
		var r = [0, 0, ii + 1];
		if(ii < 0 || ii >= images.length)
			return r;
		currentImage = images[ii];
		img.src = folder + '/' + currentImage;
		//alert(img.src);
		//alert(images);
		if(ii > 0)
			r[0] = 1;
		if(ii < images.length - 1)
			r[1] = 1;
		return r;
	},

	showImage2: function (counterId, pbId, nbId, imgId, folder, images, next){
		var r = this.showImage(imgId, folder, images, next);
		document.getElementById(pbId).disabled = !r[0];
		document.getElementById(nbId).disabled = !r[1];	
		document.getElementById(counterId).innerHTML = ' [ ' + r[2] + ' / ' + images.length + ' ]';
	},
}