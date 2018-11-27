var groupData;
var categoryData;
var videoData;
var filteredVideoData;
var map2D, map3D;
var featuredVideosSlider;
var touchEnabled;

$(function() {	
	touchEnabled = is_touch_device();

	$.get('./data.xml', function(data) {		
		var dataXML = $(data);
		
		categoryData 	= dataXML.find("categories:first");
		groupData		= dataXML.find("groups:first");
		videoData 		= dataXML.find("videos:first");
		
		onDataLoaded();		
	}).error(function(error) { console.log("Failed to parse data.xml, make sure its properly formatted.") });
});

function onDataLoaded() {
	$("*").disableSelection();
	
	$(".zoom-slide-area").slider({
		orientation: "vertical",
		max: 7,
		value: 2,
		change: function(event, ui) {
			map3D.setZoomLevel(7 - ui.value);
		},
		slide: function(event, ui) {
			map3D.setZoomLevel(7 - ui.value);
		}	
	});

	$(".zoom-button.plus").click(function() {
		var val = $(".zoom-slide-area").slider("value");
		$(".zoom-slide-area").slider("value", val + 1);
	});

	$(".zoom-button.minus").click(function() {
		var val = $(".zoom-slide-area").slider("value");
		$(".zoom-slide-area").slider("value", val - 1);
	});
	
	// Video box
	$(".map-wrapper").click(function(event) {		
		swfobject.removeSWF("video-player")
		$("#video-player").remove();
		$(".video-window").fadeOut();
	});
	
	$("body").on("click", "a[rel=video-link]", function() {
		var videoId = $(this).attr("href").replace("#", "");	
		playVideo(videoId);		
		return false;
	});
	
	$("a[rel=parent-redirect]").click(function() {
		window.top.location.href = $(this).attr("href"); 
		return false;
	});
	
	var canvas2DSupported = !!window.CanvasRenderingContext2D;
	
	var isiPad = navigator.userAgent.match(/iPad/i) != null;
	var isiPhone = navigator.userAgent.match(/iPhone/i) != null;
	
	if (canvas2DSupported && !isiPad && !isiPhone) {
		map3D = new Map3D();
		map3D.init();
	}
	else {
		map2D = new Map2D();
		map2D.init();
	}
	
	// Add groups as points to the active map
	for (var i = 0; i < groupData.children().length; i++) {
		var group = $(groupData.children()[i]);
		var lat = group.find("lat").text();
		var lng = group.find("lng").text();
		var welcomeVideoId = group.find("welcomeVideoId").text();
		var name = group.find("name").text();
		
		if (map3D != null) {
			map3D.addPoint(lat, lng, name, welcomeVideoId);
		}		
		
		if (map2D != null) {
			map2D.addPoint(lat, lng, name, welcomeVideoId);
		}
	}	
	
	$("#category-slide-area").slider({
		max: categoryData.children().length,		
		change: function(event, ui) { 
			showSliderTooltip();
			
			var index = ui.value;
			
			if (index == 0) {
				updateData();
			}
			else {
				var category = categoryData.children(":nth-child(" + index + ")").text();				
				updateData(category)
			}
		},
		slide: function(event, ui) {
			setTimeout(showSliderTooltip, 20);
			
			var index = ui.value;
			var catName = "";
			
			if (index == 0) {
				catName = "All";
			}
			else {
				catName = categoryData.children(":nth-child(" + index + ")").text();				
			}
			
			$("#slidertooltip").text(catName);			
		}
	});
	
	if (touchEnabled) {
		bindTouchEvents();
	}
	
	updateData();
}

function bindTouchEvents() {
	$(".related-videos-container").bind("touchmove", function (event) {
		event.preventDefault();
	
		var currentTouchY = event.originalEvent.touches[0].pageY;	
		
		if (touchPrevY == null) {
			touchPrevY = currentTouchY;
		}
		
		var sliderValue = $(".video-right-bar .slide-area").slider("value");
		var newSliderValue = sliderValue + (currentTouchY - touchPrevY);
		$(".video-right-bar .slide-area").slider("value", newSliderValue);				
		
		touchPrevY = currentTouchY;
	});
	
	$(".related-videos-container").bind("touchend", function (event) {
		if (touchPrevY != null) {
			event.preventDefault();
		}
	
		touchPrevY = null;
	});
	
	$(".featured-videos-container ul").bind("touchmove", function (event) {
		event.preventDefault();
	
		var currentTouchX = event.originalEvent.touches[0].pageX;	
		
		if (touchPrevX == null) {
			touchPrevX = currentTouchX;
		}
		
		var sliderValue = featuredVideosSlider.slider("value");
		var newSliderValue = sliderValue - (currentTouchX - touchPrevX);
		featuredVideosSlider.slider("value", newSliderValue);				
		
		touchPrevX = currentTouchX;
	});
	
	$(".featured-videos-container ul").bind("touchend", function (event) {
		if (touchPrevX != null) {
			event.preventDefault();
		}
	
		touchPrevX = null;
	});
}

var touchInProgress = false;
var touchPrevX;
var touchPrevY;


var sliderTooltipTimeout;
function showSliderTooltip() {
	if (sliderTooltipTimeout != null) {
		clearTimeout(sliderTooltipTimeout);
	}
	
	var sliderHandle = $(".category-button-wrapper .ui-slider-handle");
	
	$("#slidertooltip").stop(true, false).fadeTo("fast", 1);
	$("#slidertooltip").css("left", sliderHandle.offset().left + "px");
	$("#slidertooltip").css("top", (sliderHandle.offset().top - 20) + "px");
	$("#slidertooltip").css("marginLeft", (-$("#slidertooltip").outerWidth() / 2) + 8 + "px");
	// Show tooltip.
	
	sliderTooltipTimeout = setTimeout(hideSliderTooltip, 2000);
}

function hideSliderTooltip() {	
	$("#slidertooltip").stop(true, false).fadeTo("fast", 0);
}



function updateData(category) {
	
	if (category != null) {				
		filteredVideoData = videoData.find("categories").find("category:contains('" + category + "')").parent().parent();		
	}
	else {
		filteredVideoData = videoData;
	}
	
	var featuredVideoData = filteredVideoData.find("featured:contains('true')").parent();
	
	clearFeaturedVideoList();
	addVideosToFeaturedList(featuredVideoData);

	// Featured video section
	var featuredVideosList	= $(".featured-videos-container ul");
	var featuredVideos 		= featuredVideosList.children().not(".template");
	var featuredVideoWidth 	= featuredVideos.first().outerWidth(true);
	
	featuredVideosList.css("width", (featuredVideos.length * (featuredVideoWidth)) + "px");
	
	var pixelsToScrollSpan 	= featuredVideosList.outerWidth(true) - $(".featured-videos-container").width();
	
	if (pixelsToScrollSpan > 0) {
		featuredVideosSlider = $(".featured-videos-scroll-wrapper .slider").slider({
			max: pixelsToScrollSpan,		
			slide: function(event, ui) { 
				$(".featured-videos-container ul").css("left", -ui.value + "px");
			},
			change: function(event, ui) { 
				$(".featured-videos-container ul").css("left", -ui.value + "px");
			}
		});
	}
	
	
	var videoGroups = [];
	
	filteredVideoData.find("group").each(function() {
		if ($.inArray($(this).text(), videoGroups) == -1) 
			videoGroups.push($(this).text());
	});
	
	
	if (map2D != null) {	
		map2D.showPoints(videoGroups);		
	}	
	if (map3D != null) {
		map3D.showPoints(videoGroups);
	}	

	updateRelatedVideos(prevGroupName);
}

// Creates the video player element if it doesnt exist, shows the window if its hidden, fetches data from YouTube to update the player window with.
function playVideo(videoId) {	
	// Embedd the flash file
	var c = document.getElementById("video-player");
	if (!c) { // Need to create the element if it does not exist
		c = document.createElement("div");
		c.setAttribute("id", "video-player");
		$(".video").append(c);		
	}	
	
	var params = { allowScriptAccess: "always" };
    var atts = { id: "video-player" };
		
	if (swfobject.hasFlashPlayerVersion("9.0.18")) {
		swfobject.embedSWF("http://www.youtube.com/v/" + videoId + "?enablejsapi=1&playerapiid=ytplayer&version=3&modestbranding=1&rel=0&showinfo=0&cc_load_policy=1", "video-player", "483", "294", "8", null, null, params, atts);
	}
	else {
		$("#video-player").children().remove();
		//<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/VIDEO_ID" frameborder="0"></iframe>
		var ytframe = document.createElement("iframe");
		ytframe.setAttribute("src", "http://www.youtube.com/embed/" + videoId + "?enablejsapi=1&playerapiid=ytplayer&version=3&modestbranding=1&rel=0&showinfo=0&cc_load_policy=1");
		ytframe.setAttribute("frameborder", "0");
		ytframe.style.width = "483px";
		ytframe.style.height = "294px";
		
		$(c).append(ytframe);
	}
	
	// Set metadata from YouTube Data API
	$.get('http://gdata.youtube.com/feeds/api/videos/' + videoId, function(data) {
		var jqDocument 		= $(data);
				
		// View count
		var statsElement 	= jqDocument.find("[viewCount]");		
		$(".video-window .views").text(addThousandSeparators(statsElement.attr("viewCount")));
		
		// Title
		var titleElement	= jqDocument.find("title").first();
		$(".video-window .title").text(titleElement.text());
		
		var authorNameElement	= jqDocument.find("author name").first();
		$(".video-window h4").text("by " + authorNameElement.text());
	});
	
	// Set the data we have "locally"
	var videoDataElement 	= videoData.find("youTubeId:contains('" + videoId + "')").first().parent();	
	var groupName			= videoDataElement.find("group").text();	
	var groupVideoId	 	= groupData.find("name:contains('" + groupName + "')").parent().children("welcomeVideoId").text();	
	var seeMoreLink 		= $(".video-window .see-more-link");
	
	seeMoreLink.text(groupName);
	seeMoreLink.attr("href", "http://www.youtube.com/watch?v=" + groupVideoId);	
	
	prevGroupName = groupName;
	updateRelatedVideos(groupName);
	// Display the window
	$(".video-window").fadeIn();	
}

var prevGroupName = null;

function updateRelatedVideos(groupName) {

	if (groupName == undefined)
		return;

	// Related videos slider
	$(".related-videos-container li:not('.template')").remove();
	
	var relatedVideoElements = filteredVideoData.find("group:contains('" + groupName + "')").parent();	

	var fragment = document.createDocumentFragment();	
	var template = $(".related-videos-container .template");	
	relatedVideoElements.each(function(i, j) {		
		var videoElement	= template.clone();		
		var youtubeId		= $(this).find("youTubeId").text();
		
		videoElement.removeClass("template");	
		
		videoElement.find("a").attr("href", "#" + youtubeId);
		videoElement.find("img").attr("src", getThumbnailUrl(youtubeId));
		
		fragment.appendChild(videoElement.get(0));
	});
	
	template.parent().append(fragment);	
	
	var relatedVideosList	= $(".related-videos-container ul");
	var relatedVideos 		= relatedVideosList.children().not(".template");
	var relatedVideoWidth 	= 80;
	
	var totalHeight = relatedVideos.length * relatedVideoWidth;
	relatedVideosList.css("height", totalHeight + "px");	
	
	var pixelsToScrollSpan 	= totalHeight - 334;	
	
	if (pixelsToScrollSpan < 0) {
		pixelsToScrollSpan = 1;
	}
	
	$(".video-right-bar .slide-area").slider({
		orientation: "vertical",
		max: pixelsToScrollSpan,
		value: pixelsToScrollSpan,
		slide: function(event, ui) {			
			var offset = ui.value - $(this).slider("option","max"); 
			$(".related-videos-container ul").css("top", offset + "px");
		},
		change: function(event, ui) {			
			var offset = ui.value - $(this).slider("option","max"); 
			$(".related-videos-container ul").css("top", offset + "px");
		}	
	});	
}

function clearFeaturedVideoList() {
	$(".featured-videos-container").find("li:not('.template')").remove();	
}

function addVideosToFeaturedList(videoList) {
	var template = $(".featured-videos-container .template");
	var fragment = document.createDocumentFragment();
	
	for (var i = 0; i < videoList.length; i++) {
		var videoData 		= $(videoList[i]);
		var videoElement	= template.clone();
		var youtubeId		= videoData.find("youTubeId").text();
		
		videoElement.removeClass("template");	

		videoElement.find("[rel='video-link']").attr("href", "#" + youtubeId);
		videoElement.find(".thumb-wrapper img").attr("src", getThumbnailUrl(youtubeId));
		videoElement.find("h3").text(videoData.find("title").text());
		
		fragment.appendChild(videoElement.get(0));
	}	
	template.parent().append(fragment);
}

function getThumbnailUrl(youtubeId) {
	return "http://i.ytimg.com/vi/" + youtubeId + "/0.jpg"
}

function addThousandSeparators(nStr)
{
	nStr += '';
	var x = nStr.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function is_touch_device() {
  return !!('ontouchstart' in window);
}