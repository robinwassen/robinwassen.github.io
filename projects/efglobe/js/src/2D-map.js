function Map2D() {
	var mapCanvas;
	var mapPointers;
	var draggingMap2D = false;
	
	var prevX = 0;
	var prevY = 0;
	
	this.init = function() {
		var mapParent = $("#map").parent();
		$("#map").remove();
		mapParent.append($("<div></div>").attr("id", "map"));
		$(".zoom-wrapper").hide();
	
		mapCanvas = $("<div></div>").addClass("map-canvas");		
		
		targetX = -577;
		targetY = -50;
		
		mapCanvas.css("top", "-50px")
		mapCanvas.css("left", "-570px")		
		$("#map").append(mapCanvas);
		
		var mapImage = $("<img />").attr("src", "./i/earth.jpg");
		mapCanvas.append(mapImage);
				
		mapCanvas[0].addEventListener( 'mousedown', onMouseDown, false );
		mapCanvas[0].addEventListener( 'mouseup', onMouseUp, false );
		mapCanvas[0].addEventListener( 'mouseout', onMouseOut, false );
		mapCanvas[0].addEventListener( 'mousemove', onMouseMove, false );
		addTouch(mapCanvas[0]);
		
		updateLoop();
	}
	
	this.addPoint = function(lat, lon, name, videoId) {
		var coords	= getXY(lat, lon);
		var point 	= $("<div></div>").addClass("map-point");	
		
		point.css("left", coords.x - 5 + "px");
		point.css("top", coords.y - 5 + "px");		
		point.attr("name", name);
		
		mapCanvas.append(point);
		
		point.mouseover(name, function(event) {			
			$("#tooltip").text(event.data);
			$("#tooltip").stop(true, false).fadeTo("fast", 1);
			$("#tooltip").css("left", (event.clientX + 14) + "px");
			$("#tooltip").css("top", (event.clientY + 10) + "px");
		});
		
		point.mouseout(function() {
			$("#tooltip").stop(true, false).fadeTo("fast", 0);			
		});
		
		point.click(videoId, function(event) {			
			event.stopPropagation();
			playVideo(event.data);			
		});
		
		addTouch(point[0]);
	}
	
	function onMouseDown(event) {
		draggingMap2D = true;
		prevX = event.clientX;
		prevY = event.clientY;		
	}
	
	function onMouseOut(event) {			
		draggingMap2D = false;
	}
	
	function onMouseUp(event) {			
		draggingMap2D = false;		
	}
	
	
	var targetX;
	var targetY;
	
	function onMouseMove(event) {
		
		if (draggingMap2D) {
			targetX += (event.clientX - prevX) * 1.5;
			targetY += (event.clientY - prevY) * 1.5;
			
			if (0 < targetY)
				targetY = 0;
			else if (targetY < -(1002 - 444))
				targetY = -(1002 - 444);
			
			if (0 < targetX)
				targetX = 0;
			else if (targetX < -(2000 - 970))
				targetX = -(2000 - 970);
			
			prevX = event.clientX;
			prevY = event.clientY;		
			
			event.preventDefault();
		}
	}
	
	var updateTimer;
	
	
	var currentLeft, currentTop, newX, newY;
	function updateLoop() {				
		
		currentLeft = parseFloat(mapCanvas.css("left"));
		currentTop 	= parseFloat(mapCanvas.css("top"));	
		
		newX = currentLeft - (currentLeft - targetX) * 0.1; 
		newY = currentTop - (currentTop - targetY) * 0.1;
		
		mapCanvas.css("left", newX + "px");
		mapCanvas.css("top", newY + "px");
		
		//mapCanvas.css("-webkit-transform", "translate(" + targetX + "px, " + targetY + "px)");
		
		updateTimer = setTimeout(updateLoop, 1000 / 60);
	}
	
	function getXY(lat, lon) {
		var originX = 999;
		var originY = 1022;
		
		var pixelCord = {};
		pixelCord.x = 942 + lon * (originX / 180);
		pixelCord.y = 509 - lat * (originY / 180);
		
		return pixelCord;
	}
	
	function addTouch(element) {		
		element.addEventListener("touchstart", touchHandler, true);
		element.addEventListener("touchmove", touchHandler, true);
		element.addEventListener("touchend", touchHandler, true);
		element.addEventListener("touchcancel", touchHandler, true); 
	}
	
	var simulatedEvent, touches;
	function touchHandler(event)
	{
		touches = event.changedTouches,
			first = touches[0],
			type = "";
			 switch(event.type)
		{
			case "touchstart": type = "mousedown"; break;
			case "touchmove":  type="mousemove"; break;        
			case "touchend":   type="mouseup"; break;
			default: return;
		}
		
		simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1, 
								  first.screenX, first.screenY, 
								  first.clientX, first.clientY, false, 
								  false, false, false, 0/*left*/, null);
		
		if (type == "mouseup") {
			simulatedEvent.initMouseEvent("click", true, true, window, 1, 
									  first.screenX, first.screenY, 
									  first.clientX, first.clientY, false, 
									  false, false, false, 0/*left*/, null);
		}

																					 first.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	}
	
	this.showPoints = function (nameArray) {
		var objects = $(".map-point");
	
		for (var i = 0; i < objects.length; i++) {			
			if (nameArray == null || $.inArray($(objects[i]).attr("name"), nameArray) > -1) {				
				$(objects[i]).show();
			}
			else {				
				$(objects[i]).hide();
			}
		}
	}
	
	return this;
}