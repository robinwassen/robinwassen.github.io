(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function Map3D() {
	var container, stats;

	var camera, scene, renderer, projector;
	var cube, plane, sphere, flag;

	var targetRotationX = -45;
	var targetRotationXOnMouseDown = 0;

	var targetRotationY = 2;
	var targetRotationYOnMouseDown = 0;

	var mouseX = 0;
	var mouseXOnMouseDown = 0;
	var mouseY = 0;
	var mouseYOnMouseDown = 0;

	var w = 970;
	var h = 444;

	var windowHalfX = w / 2;
	var windowHalfY = h / 2;

	var idleSpin = true;
	var targetCameraZ = 330;

	var objects = [];
	var hitTestBoxes = [];

	// Materials
	var normalFlagStateMaterial 		= new THREE.MeshBasicMaterial({ color: 0xFF0000, overdraw: false});
	var hiddenMaterial 					= new THREE.MeshBasicMaterial({ color: 0xFF0000, overdraw: false, transparent: true, depthWrite: false, depthTest: true });
	var highlightedFlagStateMaterial 	= new THREE.MeshBasicMaterial({ color: 0xFF6666, overdraw: false, transparent: true });

	var dragging3DMap = false;

	var vector;
	var ray;

	var zoomLevel = 5;
	
	var flagTexture = THREE.ImageUtils.loadTexture( "./i/pin.png" );

	this.addPoint = function(lat, lon, name, videoId) {			
				
		var flag;
		
		if (window.WebGLRenderingContext) {
			flag = new THREE.Sprite( { map: flagTexture, useScreenCoordinates: false, affectedByDistance: true} );
			setFlagScale(flag, 1);
		}
		else {
			flag = new THREE.Mesh( new THREE.SphereGeometry( 3, 10, 10), normalFlagStateMaterial);			
		}
		
		flag.lat 		= lat;
		flag.lon 		= lon;
		flag.videoId 	= videoId;
		flag.name 		= name;	

		sphere.add(flag);	
		objects.push(flag);
		
		// Adding the hit test box.
		flag.box 			= new THREE.Mesh( new THREE.SphereGeometry( 5, 4, 4), hiddenMaterial);				
		flag.box.parent 	= flag;
		flag.box.videoId 	= videoId;
		flag.box.name 		= name;	
		flag.box.material.opacity = 0;
			
		updateFlagPosition(flag);

		sphere.add(flag.box);	
		hitTestBoxes.push(flag.box);	
		hitTestBoxes.push(sphere);
	}

	function updateFlagPosition(flag) {		
		var latOffset = 3 * flag.scale.x / 0.27;
		var radOffset = 99.5 + 2.0 * flag.scale.x / 0.27;
		//alert(radOffset);

		var flagCoordinates = getXYZ(parseFloat(flag.lat) + latOffset, flag.lon, radOffset);
		flag.position.x 	= flagCoordinates.x;
		flag.position.y 	= flagCoordinates.y;
		flag.position.z 	= flagCoordinates.z;
		flag.box.position 	= flag.position;
	}

	function setFlagScale(flag, scale) {
		flag.scale.x = 0.27 * scale;
		flag.scale.y = 0.46 * scale;
	}

	this.init = function() {
		var mapParent = $("#map").parent();
		$("#map").remove();
		mapParent.append($("<div></div>").attr("id", "map"));
		
		$(".zoom-wrapper").show();
		
		var isiPad = navigator.userAgent.match(/iPad/i) != null;
		
		if (window.WebGLRenderingContext && !isiPad) {
			try	{
				renderer = new THREE.WebGLRenderer({antialias: true});				
			}
			catch(ex) {
				renderer = new THREE.CanvasRenderer();
			}
		}
		else {			
			renderer = new THREE.CanvasRenderer();				
		}
		
		container = document.getElementById( 'map' );
		container.style.width = '970px';
		container.style.height = '444px';
				
		scene 		= new THREE.Scene();
		projector 	= new THREE.Projector();
		vector 		= new THREE.Vector3();
		ray 		= new THREE.Ray();

		camera = new THREE.PerspectiveCamera( 40, w / h, 1, 1000 );	
		camera.position.z = targetCameraZ;	
		scene.add( camera );
		
		var light = new THREE.AmbientLight(0xC7C7C7);
		scene.add(light);

		var pointLight = new THREE.PointLight( 0xd8d7c3, 5, 370 );
		pointLight.position.z = 300;
		pointLight.position.y = 300;
		pointLight.position.x = 100;
		scene.add(pointLight);
				
		var sphereMaterial 	= new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture( "./i/earth.jpg" ), overdraw: true });
		
		sphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 20, 20),  sphereMaterial);	
		sphere.rotation.y = -4;
		sphere.rotation.z = 0;
		scene.add(sphere);	
		
		renderer.setSize( w, h );

		container.appendChild( renderer.domElement );
		

		container.addEventListener( 'mousedown', onDocumentMouseDown, false );
		container.addEventListener( 'mousemove', onDocumentMouseMove, false );
		container.addEventListener( 'mouseup', onDocumentMouseUp, false );
		container.addEventListener( 'mouseout', onDocumentMouseOut, false );	
				
		animate();
	}
	
	this.showPoints = function (nameArray) {
		for (var i = 0; i < objects.length; i++) {			
			if (nameArray == null || $.inArray(objects[i].name, nameArray) > -1) {				
				sphere.add(objects[i]);
				sphere.add(objects[i].box);
			}
			else {				
				sphere.remove(objects[i]);
				sphere.remove(objects[i].box);
			}
		}
	}
	

	// Lat = Vertical
	// Lon = Horizontal
	function getXYZ(lat,lon,rad)
	{	
		lon -= 11; // Fix the offset problem in the map

		var cosLat = Math.cos(lat * Math.PI / 180.0);
		var sinLat = Math.sin(lat * Math.PI / 180.0);
		var cosLon = Math.cos(lon * Math.PI / 180.0);
		var sinLon = Math.sin(lon * Math.PI / 180.0);
		
		var xyz = new Object();
		
		xyz.x = rad * cosLat * cosLon;	
		xyz.y = rad * sinLat;
		xyz.z = -rad * cosLat * sinLon;
		
		return xyz;
	}

	function onDocumentMouseDown( event )
	{
		event.preventDefault();
		
		// Update the ray used to check intersects.
		vector.x = ( event.clientX / 970 ) * 2 - 1;
		vector.y = - ( event.clientY / 444 ) * 2 + 1;
		vector.z = 0.5;
		
		projector.unprojectVector( vector, camera );	
		ray.origin = camera.position;
		ray.direction = vector.subSelf( camera.position ).normalize();
		
		// If intersects with the globe, start rotating.
		if (ray.intersectObject(sphere).length > 0) {
			dragging3DMap = true;
			
			mouseXOnMouseDown = event.clientX - windowHalfX;
			targetRotationXOnMouseDown = targetRotationX;
			
			mouseYOnMouseDown = event.clientY - windowHalfY;
			targetRotationYOnMouseDown = targetRotationY;
		}		
		
		// Play video if the first intersect isnt the globe.
		var intersects = ray.intersectObjects( hitTestBoxes );

		if ( intersects.length > 0 && intersects[ 0 ].object.boundRadius != 100) {			
			playVideo(intersects[0].object.videoId);			
		}
	}	

	var d = new Date();
	var lastUpdate = 0;
	var highlightedObject = null;
	function onDocumentMouseMove( event )
	{
		if (dragging3DMap)
		{
			idleSpin = false;
			mouseX = event.clientX - windowHalfX;
			targetRotationX = targetRotationXOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.1;
			mouseY = event.clientY - windowHalfY;
			targetRotationY = targetRotationYOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.1;
		}
			
		d = new Date();
		if (lastUpdate + 50 < d.getTime()) {	
			vector.x = ( event.clientX / 970 ) * 2 - 1;
			vector.y = - ( event.clientY / 444 ) * 2 + 1;
			vector.z = 0.5;
			
			projector.unprojectVector( vector, camera );	
			ray.origin = camera.position;
			ray.direction = vector.subSelf( camera.position ).normalize();
			
			var intersects = ray.intersectObjects( hitTestBoxes );

			if ( intersects.length > 0 && intersects[ 0 ].object.boundRadius != 100) {
				highlightedObject = intersects[ 0 ].object;
				//highlightedObject.material = highlightedFlagStateMaterial;		
				
				$("#tooltip").text(highlightedObject.name);
				$("#tooltip").stop(true, false).fadeTo("fast", 1);
				highlightedOnLastUpdate = true;
				
			}
			else {
				$("#tooltip").stop(true, false).fadeTo("fast", 0);
				
				/*if (highlightedObject != null)
					highlightedObject.material = hiddenMa*/
			}
			lastUpdate = d.getTime();
		}
		
		$("#tooltip").css("left", (event.clientX + 14) + "px");
		$("#tooltip").css("top", (event.clientY + 10) + "px");
	}

	function onDocumentMouseUp( event ) {
		dragging3DMap = false;
	}

	function onDocumentMouseOut( event ) {
		dragging3DMap = false;
	}

	this.setZoomLevel = function (level) {
		zoomLevel = level;
		targetCameraZ = 180 + level * 30;

		var scale = 0.4 + level * 0.12;
		//alert(level);
			
		for (var i = 0; i < objects.length; i++) {
			updateFlagPosition(objects[i]);
			setFlagScale(objects[i], scale);
		}
	}

	function animate() {
		if (idleSpin) {
			targetRotationX -= 0.01;
		}
		
		render();
		if (stats != null) {
			stats.update();
		}
		
		requestAnimationFrame( animate );
	}


	function render() {		
		camera.position.z -= (camera.position.z - targetCameraZ) * 0.05;		
		sphere.rotation.y = sphere.rotation.y += ( (targetRotationX/8) - sphere.rotation.y ) * 0.035;
		sphere.rotation.x = sphere.rotation.x += ( (targetRotationY/8) - sphere.rotation.x ) * 0.035;
		renderer.render( scene, camera );
	}
	
	return this;
}