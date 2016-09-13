function Radar() {
    var currentStyle = {
        obstacleStrokeRed: 255,
        obstacleStrokeGreen: 0,
        obstacleStrokeBlue: 0,
        obstacleFillRed: 255,
        obstacleFillGreen: 0,
        obstacleFillBlue: 0,
        obstacleLineWidth: 2,
        spaceStrokeRed: 0,
        spaceStrokeGreen: 255,
        spaceStrokeBlue: 0,
        spaceFillRed: 0,
        spaceFillGreen: 255,
        spaceFillBlue: 0,
        spaceLineWidth: 2,
        gridStrokeRed: 0,
        gridStrokeGreen: 255,
        gridStrokeBlue: 0,
        gridFillRed: 0,
        gridFillGreen: 255,
        gridFillBlue: 0,
        gridLineWidth: 2,
        gridMaxAlpha: 1,
        readingMaxAlpha: 0.7,
        alphaDecrement: 0.01,
        displayIntervalInMs: 50,
        radiusDecrementInCm: 50
    };
    
    var zoomPercentage = 0;
    var distanceInCmMax = 0;
    var zoomedDistanceInCmMax = 0;
    var angleInDegMin = 0;
    var angleInDegMax = 360;
    var displayedAngleInRadMin =0;
    var displayedAngleInRadMax = 0;
    var displayedAngleInDegMin =0;
    var displayedAngleInDegMax = 0;
    var centerX = 0;
    var centerY = 0;
    var radiusInPxMax = 0;
    var context;
    var timeInterval;
    var timerInterval = null;
    var readings = [];
    
    for (var i = angleInDegMin; i <= angleInDegMax; i++) {
        readings[i] = {
        	angleInDeg: i,
            distanceInCm: 0,
            alpha: 0
        };
    }

    var getDistanceInPx = function(distanceInCm, distanceInCmMax, radiusInPxMax) {
        return Math.floor((radiusInPxMax * distanceInCm) / distanceInCmMax);
    };

    var getAngleInRad = function(angleInDeg) {
        return 2 * Math.PI - (angleInDeg * 2 * Math.PI) / 360; 
    };

    var determineBoundaries = function() {
        // there is no jquery mapping specifc for a canvas element
        var canvas = document.getElementById("radar");
        canvas.width = window.innerWidth;
        var headerHeight = parseInt($("header").css("height"));
        var footerHeight = parseInt($("footer").css("height"));
        canvas.height = window.innerHeight - headerHeight - footerHeight;
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        centerX = canvasWidth / 2;
        centerY = canvasHeight / 2 + currentStyle.gridLineWidth;
        context = canvas.getContext("2d");
        radiusInPxMax = Math.floor(Math.min(canvasWidth - 2 * currentStyle.gridLineWidth,
        									canvasHeight - 2 * currentStyle.gridLineWidth) / 2);  
    };

    var drawSlice = function(angleInDeg, angleSpanInDeg, radiusInPx, strokeColor, fillColor) {
        var halfAngleSpanInDeg = angleSpanInDeg / 2;
        
        var currentAngleBeginInRad;
        if (angleInDeg - halfAngleSpanInDeg >= displayedAngleInRadMin) {
        	currentAngleBeginInRad = getAngleInRad(angleInDeg - halfAngleSpanInDeg);
        } else {
        	currentAngleBeginInRad = getAngleInRad(angleInDeg);
        }
        
        var currentAngleEndInRad;
        if (angleInDeg + halfAngleSpanInDeg <= displayedAngleInRadMax) {
        	currentAngleEndInRad = getAngleInRad(angleInDeg + halfAngleSpanInDeg);
        } else {
        	currentAngleEndInRad = getAngleInRad(angleInDeg);
        }
        
        context.strokeStyle = strokeColor;
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.arc(
            centerX, 
            centerY, 
            radiusInPx,
            currentAngleBeginInRad,
            currentAngleEndInRad,
            true);
        context.lineTo(centerX, centerY);
        context.closePath();
        context.stroke();
        context.fillStyle = fillColor;
        context.fill();
    };

    var getRgbaColor = function(red, green, blue, alpha) {
        return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
    };

    var drawGrid = function() {
        var radiusDecrement = Math.floor(radiusInPxMax / distanceInCmMax * currentStyle.radiusDecrementInCm);
        
        context.fillStyle = getRgbaColor(
            currentStyle.gridFillRed,
            currentStyle.gridFillGreen,
            currentStyle.gridFillBlue,
            currentStyle.gridMaxAlpha
        );
        context.fill();
        context.lineWidth = currentStyle.gridLineWidth;
        context.strokeStyle = getRgbaColor(
            currentStyle.gridStrokeRed,
            currentStyle.gridStrokeGreen,
            currentStyle.gridStrokeBlue,
            currentStyle.gridMaxAlpha
        );

        context.beginPath();
        context.moveTo(centerX, centerY);
    	
    	var zoomedRadiusDecrement = (radiusDecrement / (100 - zoomPercentage)) * 100;
    	if (!zoomedRadiusDecrement) {
    		return;
    	}
    	
    	context.arc(
                centerX, 
                centerY,
                radiusInPxMax,
                displayedAngleInRadMin,
                displayedAngleInRadMax,
                true);
            context.lineTo(centerX, centerY);

		var distancesToDisplayCount = 0;
        var radiusInPx = (Math.floor(radiusInPxMax / zoomedRadiusDecrement) * zoomedRadiusDecrement);
        while (radiusInPx >= 0) {
            context.arc(
                centerX, 
                centerY,
                radiusInPx,
                displayedAngleInRadMin,
                displayedAngleInRadMax,
                true);
            context.lineTo(centerX, centerY);
            radiusInPx -= zoomedRadiusDecrement;
            distancesToDisplayCount++;
        }
        context.closePath();
        context.stroke();
        
        context.textAlign = "center";
        var textPositionFromCenterX = 0;
        var distancesAlreadyDisplayedCount = 0;
		var currentRadiusInCm = 0;
        while (distancesAlreadyDisplayedCount < distancesToDisplayCount) {
	        context.fillText(currentRadiusInCm + "cm", centerX - textPositionFromCenterX, centerY + 10);
	        context.fillText(currentRadiusInCm + "cm", centerX + textPositionFromCenterX, centerY + 10);
	        textPositionFromCenterX += zoomedRadiusDecrement;
	        currentRadiusInCm += currentStyle.radiusDecrementInCm;
	        distancesAlreadyDisplayedCount++;
        }
    };

	var drawReading = function(reading) {
		drawSlice(
            reading.angleInDeg, 
            currentStyle.obstacleLineWidth,
            radiusInPxMax,
            getRgbaColor(
                currentStyle.obstacleStrokeRed,
		        currentStyle.obstacleStrokeGreen,
                currentStyle.obstacleStrokeBlue,
                reading.alpha),
            getRgbaColor(
                currentStyle.obstacleFillRed,
		        currentStyle.obstacleFillGreen,
                currentStyle.obstacleFillBlue,
                reading.alpha)
        );

		var zoomedDistanceInCm = (reading.distanceInCm < zoomedDistanceInCmMax) ? reading.distanceInCm : zoomedDistanceInCmMax;
		
        var distanceInPx = getDistanceInPx(zoomedDistanceInCm, zoomedDistanceInCmMax, radiusInPxMax);

        drawSlice(
            reading.angleInDeg, 
            currentStyle.spaceLineWidth,
            distanceInPx,
            getRgbaColor(
                currentStyle.spaceStrokeRed,
		        currentStyle.spaceStrokeGreen,
                currentStyle.spaceStrokeBlue,
                reading.alpha),
            getRgbaColor(
                currentStyle.spaceFillRed,
		        currentStyle.spaceFillGreen,
                currentStyle.spaceFillBlue,
                reading.alpha)
        );
	};
	
	var alphaFading = function() {
		for (var i = angleInDegMin; i <= angleInDegMax; i++) {
        	if (readings[i]) {
        		var alpha = readings[i].alpha;
        		
        		if (alpha >= currentStyle.alphaDecrement) {
        			alpha -= currentStyle.alphaDecrement;
        		} else {
        			alpha = 0;
        		}
        		
        		readings[i].alpha = alpha;
        	}
    	}
	};
	
	var show = function() {
        determineBoundaries();
        drawGrid();
        alphaFading();
        
        for (var i = displayedAngleInDegMin; i <= displayedAngleInDegMax; i++) {
        	if (readings[i]) {
        		drawReading(readings[i]);
        	}
    	}
    };

	this.storeReading = function(reading) {
		if (reading) {
	    	distanceInCmMax = reading.distanceInCmMax;
	    	displayedAngleInDegMin = reading.angleInDegMin;
	    	displayedAngleInRadMin = getAngleInRad(displayedAngleInDegMin);
	    	displayedAngleInDegMax = reading.angleInDegMax;
	        displayedAngleInRadMax = getAngleInRad(displayedAngleInDegMax);
	        readings[reading.angleInDeg] = {
	        	angleInDeg: reading.angleInDeg,
	            distanceInCm: reading.distanceInCm,
	            alpha: currentStyle.readingMaxAlpha
	        };
		}        
        
        return this;
    };
    
    this.storeZoomPercentage = function(percentage) {
    	zoomPercentage = percentage;
    	zoomedDistanceInCmMax = (Math.abs(100 - zoomPercentage) / 100) * distanceInCmMax;
    };

    this.setStyle = function(style) {
        var currentStyle = $.extend(currentStyle, style);
	
	    return this;
    };
    
    this.getStyle = function(style) {
	    return currentStyle;
    };
    
    this.showError = function(error) {
        alert(error);
        
        return this;
    };
    
    this.start = function() {
    	timerInterval = setInterval(show, currentStyle.displayIntervalInMs);
    	
    	return this;
    };
    
    this.stop = function() {
    	if (timerInterval) {
    		clearInterval(timerInterval);	
    	}
    	
    	return this;
    };
};