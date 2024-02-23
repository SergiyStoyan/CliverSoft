{
    var css = '\
div.copyright { border1: 1px solid grey; margin:0; align-self:center; }\
table.copyright { margin:0; align-self:center; }\
table.copyright, table.copyright td {border:none; }\
table.copyright td {margin:0; padding:0; width:6px; height:6px;}',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet)// This is required for IE8 and below.
      style.styleSheet.cssText = css;
    else 
      style.appendChild(document.createTextNode(css));
    head.appendChild(style);
}

document.write('\
<div class="copyright">\
    <a href="http://cliversoft.com" title="cliversoft.com">\
        <TABLE id="copyrightT" class="copyright">\
            <TR>\
                <TD id="copyright_td_1_1"></TD>\
                <TD id="copyright_td_1_2"></TD>\
            </TR>\
            <TR>\
                <TD id="copyright_td_2_1"></TD>\
                <TD id="copyright_td_2_2"></TD>\
            </TR>\
        </TABLE>\
     </a>\
 </div>\
');

var copyright = {		
    get_random: function(max){
        var ran_unrounded = Math.random() * max;
        return Math.floor(ran_unrounded);
    },

    dec2hex: function(d) {
        return d.toString(16).toUpperCase().padStart(2, 0);
    },

    random_color: function(red_min, red_max, green_min, green_max, blue_min, blue_max){
        var red = red_min + this.get_random(red_max - red_min);
        var green = green_min + this.get_random(green_max - green_min);
        var blue = blue_min + this.get_random(blue_max - blue_min);
        return "#" + this.dec2hex(red) + this.dec2hex(green) + this.dec2hex(blue);
    },
	
    play_: function(){
        var this_ = this;
        setTimeout(function(){this_.play_()}, 500);
		
        var t = document.getElementById("copyright_td_" + (this.get_random(2) + 1) + "_" + (this.get_random(2) + 1));
        var r = this.random_color(120, 230, 120, 230, 120, 230);
        t.style.backgroundColor = r;
		
		this.update_favicon();
    },
	
	update_favicon: function(){				
		for(var y = 1; y < 3; y++)
			for(var x = 1; x < 3; x++){
				var t = document.getElementById("copyright_td_" + y + "_" + x);
				this.favicon_context.fillStyle = t.style.backgroundColor;
				this.favicon_context.fillRect((x - 1) * 8, (y - 1) * 8, x * 8, y * 8);
			}          
		var icon = this.favicon_canvas.toDataURL("image/x-icon");
		document.getElementById('lIcon').href = icon;
	},
	
	favicon_canvas: null,
	favicon_context: null,	

    play: function(){//initializing
		for(var y = 1; y < 3; y++)
			for(var x = 1; x < 3; x++){
				var t = document.getElementById("copyright_td_" + y + "_" + x);
				var r = this.random_color(120, 230, 120, 230, 120, 230);
				t.style.backgroundColor = r;
			}
					
		this.favicon_canvas = document.createElement('canvas');
		this.favicon_canvas.width = 16;
		this.favicon_canvas.height = 16;
		this.favicon_context = this.favicon_canvas.getContext('2d');	
		this.update_favicon();
		
		this.play_();
    },
}

copyright.play();