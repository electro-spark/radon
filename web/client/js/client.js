(function() {
    $(document).ready(function() {
        var radar = new Radar();
        
        var socket = io();
        
        socket.on("reading", function(data) {
            var reading = JSON.parse(data);
            radar.storeReading(reading);
        });
        
        socket.on("error", function(error) {
            radar.showError(error);
        });
        radar.start();
        
        $("#zoom-slider").slider({
        	min: 0,
        	max: 100,
        	value: 0,
        	slide: function(event, ui) {
        		var percentage = ui.value;
        		$("#zoom-text").val("Zoom: " + percentage + "%");
        		radar.storeZoomPercentage(percentage);
        	}
        });
    });
})(); 