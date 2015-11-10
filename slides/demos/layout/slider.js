Slider = can.Control.extend({
    init: function(){
        this.value(this.options.value);
    },
    "draginit": function(el, ev, drag){
        drag.limit(this.element.parent());
        drag.horizontal();
    },
    "dragmove": function(el, ev, drag){
    	 var el = this.element,
                 container = el.parent(),
                 sliderOffset = el.offset().left,
                 containerOffset = container.offset().left,
                 sliderWidth = el.outerWidth(),
                 containerWidth = container.width(),
                 delta = 1;
            
            containerOffset +=
                parseInt( container.css("paddingLeft") ) +
                parseInt( container.css("borderLeftWidth") );
            
        this._value = ( Math.round(sliderOffset-containerOffset ) /
                         Math.round(containerWidth - sliderWidth) ) * delta;   
    	
    	           
        this.element.trigger("change", this._value);
    },
    
    value: function(value){
        if(!arguments.length){
             return this._value;  
        } else {
            this._value = value;
            var container = this.element.parent(),
                containerOffset = container.offset().left,
                sliderWidth = this.element.outerWidth(),
                containerWidth = container.width(),
                delta = 1;
            
            containerOffset +=
                parseInt( container.css("paddingLeft") ) +
                parseInt( container.css("borderLeftWidth") );
            
            var sliderOffset = containerOffset+
                ( 	(containerWidth - sliderWidth) * 
                 (value) ) /
                (delta);
            
            this.element.offset({
                left: sliderOffset
            });
        }
    },
    "resize": function(){
    	this.value(this._value);
    }
});