(function(){
    'use strict';

    angular.module('gpmobile-animation',[])
       .animation('.content-holder', ['settingsService', function(settingsService){
    return{
                enter: function(element, done){
                    switch(settingsService.settings.currentTransition){
                        case "fade":
                            TweenMax.set(element[0], {opacity:0});
                            TweenMax.to(element[0], settingsService.settings.slideSpeed, {opacity:1, onComplete:done});
                            break;
                        case "slide-left":
                            TweenMax.set(element[0], {left:$(window).width()+'px'});
                            TweenMax.to(element[0], settingsService.settings.slideSpeed, {left:0, onComplete:done});
                            break;
                        case "slide-right":
                            TweenMax.set(element[0], {left:-$(window).width()+'px'});
                            TweenMax.to(element[0], settingsService.settings.slideSpeed, {left:0, onComplete:done});
                            break;
                    }
                },
                leave: function(element, done){
                    switch(settingsService.settings.currentTransition){
                        case "fade":
                            TweenMax.to(element[0], settingsService.settings.slideSpeed, {opacity:0, onComplete:function(){settingsService.settings.currentTransition = settingsService.settings.defaultTransition;done();}});
                            break;
                        case "slide-left":
                            TweenMax.to(element[0], settingsService.settings.slideSpeed, {left:-$(window).width()+'px', onComplete:function(){settingsService.settings.currentTransition = settingsService.settings.defaultTransition;done();}});
                            break;
                        case "slide-right":
                            TweenMax.to(element[0], settingsService.settings.slideSpeed, {left:$(window).width()+'px', onComplete:function(){settingsService.settings.currentTransition = settingsService.settings.defaultTransition;done();}});
                            break;
                    }
                }
            };
        }]);

})();

(function(){
    'use strict';


    angular.module('gpmobile-services',[])
        .factory('settingsService', ["$rootScope", function ($rootScope) {
            return {
                settings: $rootScope.settings,
                setSettings: function(mySettings)
                {
                    this.settings = mySettings;
                }
            };
        }])
        .factory('stateService', ["$rootScope", function ($rootScope) {
            return {
                state: $rootScope.state,
                setState: function(myState)
                {
                    this.state = myState;
                }
            };
        }])
        .factory('chapterService', ["$rootScope", function ($rootScope) {
            return {
                chapters: $rootScope.chapters,
                setChapters: function(myChapters)
                {
                    this.chapters = myChapters;
                }
            };
        }])
    .factory('audioService', ['$interval', function ($interval) {    var assetsPath = "./audio/";    var manifest = [{"src":"audio.ogg","data":{"audioSprite":[{"id":"AML1_1","startTime":0,"duration":13175.351473922901},{"id":"AML1_2","startTime":15000,"duration":11662.834467120181},{"id":"AML1_3","startTime":28000,"duration":13696.621315192744},{"id":"BoxCat_Games__03__Battle_Special","startTime":43000,"duration":53395.3514739229}]}}];    var onLoadProgress = new signals.Signal();//Audio File loading progress    var onLoadComplete = new signals.Signal();//Audio File loading complete    var onPosition = new signals.Signal();//Audio position change: returns position 0-1, and duration seconds    var onStateChange = new signals.Signal();    var onEnd = new signals.Signal();    var queue;    var instance;    var interval;    var state = {};    state.init = false;//service started    state.loaded = false;//audio loaded    state.action = "pause";//'play', 'pause', 'replay'    state.duration = 0;    state.src = "";    state.position = 0;    state.global = false;////////////////////////////////////////////////////////////                HELPER FUNCTIONS                ////////////////////////////////////////////////////////////    function setState(src, position, global) {        console.log("set State");        state.action = 'play';        state.src = src;        state.position = position;        state.global = global;        for (var i in manifest[0].data.audioSprite) {            if (manifest[0].data.audioSprite[i].id === src) {                state.duration = manifest[0].data.audioSprite[i].duration;            }        }    }    function cloneState() {        var copy = {};        for (var attr in state) {            if (state.hasOwnProperty(attr)) copy[attr] = state[attr];        }        return copy;    }    function replay() {        state.action = "replay";        onStateChange.dispatch(cloneState());    }/////////////////////////////////////////////////////////                AUDIO LOADING                /////////////////////////////////////////////////////////    function handleComplete(e) {        queue.removeEventListener("progress", handleProgress);        queue.removeEventListener("complete", handleComplete);        onLoadComplete.dispatch(e);    }    function handleProgress(e) {        onLoadProgress.dispatch(e);    }///////////////////////////////////////////////////////                DISPATCHING                ///////////////////////////////////////////////////////    function positionChange() {        state.position = (instance.position / state.duration);        onPosition.dispatch(cloneState());    }    function soundComplete() {        $interval.cancel(interval);        state.position = 1;        onPosition.dispatch(cloneState());        replay();        onEnd.dispatch(cloneState());    }//////////////////////////////////////////////////                PUBLIC                //////////////////////////////////////////////////    var init = function () {        if (!state.init) {            queue = new createjs.LoadQueue();            createjs.Sound.alternateExtensions = ["mp3"];            createjs.Sound.initializeDefaultPlugins();            queue.installPlugin(createjs.Sound);            queue.addEventListener("complete", handleComplete);            queue.addEventListener("progress", handleProgress);            queue.loadManifest(manifest, true, assetsPath);            state.init = true;        }    };    var reset = function(){        queue = new createjs.LoadQueue();        createjs.Sound.alternateExtensions = ["mp3"];        createjs.Sound.initializeDefaultPlugins();        queue.installPlugin(createjs.Sound);        queue.addEventListener("complete", handleComplete);        queue.addEventListener("progress", handleProgress);        queue.loadManifest(manifest, true, assetsPath);    };    var play = function (src, position, global) {        if(state.action === "play"){            instance.stop();            state.action = "pause";            $interval.cancel(interval);            console.log("boom play inner");            onStateChange.dispatch(cloneState());        }        setState(src, position, global);        instance = createjs.Sound.play(src);        instance.position = position*state.duration;        instance.addEventListener("complete", soundComplete);        console.log("boom play");        onStateChange.dispatch(cloneState());        interval = $interval(positionChange, 30);    };    var pause = function () {        if(instance){            state.action = "pause";            instance.stop();            $interval.cancel(interval);            console.log("boom pause");            onStateChange.dispatch(cloneState());        }    };    var setPosition = function (pos) {        state.position = pos;        if(instance){            instance.position = pos*state.duration;        }    };    return {        currentAudio: null,        onLoadProgress: onLoadProgress,        onLoadComplete: onLoadComplete,        onPosition: onPosition,        onStateChange: onStateChange,        onEnd: onEnd,        play: play,        pause: pause,        position: setPosition,        init: init,        reset: reset,        state: state    };}])
.factory('lmsService', ["$rootScope", "chapterService", "stateService", "settingsService", function ($rootScope, chapterService, stateService, settingsService) {  var state = {};  state.init = false;  var scorm = pipwerks.SCORM;  var lmsConnected = false;  var version = "";  var calls = {
    "completion": {
        "call": "cmi.core.lesson_status",
        "complete": "completed",
        "incomplete": "incomplete"
    },
    "success": {
        "call": "cmi.core.lesson_status",
        "complete": "completed",
        "incomplete": "incomplete"
    },
    "bookmark": {
        "call": "cmi.core.lesson_location"
    },
    "suspend": {
        "call": "cmi.suspend_data"
    },
    "scoreRaw": {
        "call": "cmi.core.score.raw"
    },
    "scoreScaled": {
        "call": "cmi.core.score.min"
    },
    "interactions": {
        "id": "cmi.interactions.-id-.id",
        "type": "cmi.interactions.-id-.type",
        "timestamp": "cmi.interactions.-id-.timestamp",
        "correctResponse": "cmi.interactions.-id-.correct_responses.0.pattern",
        "learnerResponse": "cmi.interactions.-id-.learner_response",
        "result": "cmi.interactions.-id-.result",
        "description": "cmi.interactions.-id-.description"
    },
    "exit": {
        "call": "cmi.core.exit",
        "suspend": "suspend"
    }
};  function updateCompletion() {    var suspendData = [];    var currentCompletion = 0;    for (var chapter in chapterService.chapters) {      suspendData.push(chapterService.chapters[chapter].completion.join('|')+'|'+chapterService.chapters[chapter].augment);    }    var currentChapter = stateService.state.currentChapter || 0;    suspendData.push(currentChapter + "-" + stateService.state.branch);    console.log('--SuspendData--');    console.log(suspendData);    scorm.set(calls.suspend.call, suspendData.toString());    scorm.set(calls.bookmark.call, stateService.state.pageTitle);    if (pageCompletion()) {      if ("pages" === settingsService.settings.completionMode) {      //  scorm.set(calls.completion.call, calls.completion.complete);      //  scorm.set(calls.success.call, calls.completion.complete);      }    }    scorm.save();  }  function pageCompletion() {    for (var chapter in chapterService.chapters) {      if (0 === chapterService.chapters[chapter].completion.length) {        return false;      }      for (var page in chapterService.chapters[chapter].completion) {        if (!chapterService.chapters[chapter].completion[page]) {          return false;        }      }    }    return true;  }  function ISODateString(d) {    function pad(n) {      return n < 10 ? '0' + n : n;    }    var mydate = d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());    return mydate;  }  var init = function () {    if (!state.init) {      lmsConnected = scorm.init();      console.log("lmsConnected: " + lmsConnected);      if (lmsConnected) {        //version = scorm.version;        //console.log(version);        if (scorm.version == "1.2") {          scorm.set("cmi.core.exit", "suspend");        }        else {          scorm.set("cmi.exit", "suspend");        }        var suspendData = scorm.get(calls.suspend.call);        if (suspendData.length) {          var completionData = suspendData.split(',');          for (var data = 0; data < completionData.length - 1; data++) {            var cda = [];            var cd = completionData[data].split('|');            var augment = cd.pop();            if(cd[0].length > 0) {              for (var i = 0; i < cd.length; i++) {                if (cd[i] == "true")                  cda.push(true);                else                  cda.push(false);              }            }            chapterService.chapters[data].completion = cda;            chapterService.chapters[data].augment = augment;            try{              settingsService.settings.showSplash = false;            } catch(e){            }          }		  var temp = completionData[completionData.length - 1];		  var tempSplit = temp.split("-");		  stateService.state.currentChapter = Number(tempSplit[0]);		  stateService.state.branch = Number(tempSplit[1]);		  // set nr of random questions/*		  switch(stateService.state.branch) {			  case 0:			     stateService.state.nrOfQuestions = 3;			  break;			  case 1:			  	stateService.state.nrOfQuestions = 8;			  break;			  case 2:			  	 stateService.state.nrOfQuestions = 3;			  break;			  case 3:			  	stateService.state.nrOfQuestions = 8;			  break;		  } */          stateService.state.alertMessage = "bookmark.html";          stateService.state.showAlertClose = false;          stateService.state.showAlert = true;        }        $rootScope.$watch(function (scope) {          return chapterService.chapters;        }, function (newValue, oldValue) {          updateCompletion();        }, true);        window.onunload = function () {          scorm.set(calls.exit.call, calls.exit.suspend);          scorm.connection.terminate();        };        window.onbeforeunload = function () {          scorm.set(calls.exit.call, calls.exit.suspend);          scorm.connection.terminate();        };      }      state.init = true;    }  };  var complete = function () {    if (lmsConnected) {      if (arguments.length > 0) {        if (arguments[0] === true) {          scorm.set(calls.completion.call, calls.completion.complete);          scorm.set(calls.success.call, calls.success.complete);          scorm.save();        } else {          scorm.set(calls.completion.call, calls.completion.incomplete);          scorm.set(calls.success.call, calls.success.incomplete);          scorm.save();        }      } else {        return scorm.get(calls.completion.call);      }    }  };  var bookmark = function () {    if (lmsConnected) {      if (arguments.length > 0) {        scorm.set(calls.bookmark.call, arguments[0]);      } else {        return scorm.get(calls.bookmark.call);      }    }  };  var interactions = function (id, result, description, type, correctResponse, learnerResponse) {    scorm.set(calls.interactions.id.replace("-id-", id), id);    scorm.set(calls.interactions.type.replace("-id-", id), type);    scorm.set(calls.interactions.timestamp.replace("-id-", id), ISODateString(new Date()));    scorm.set(calls.interactions.correctResponse.replace("-id-", id), correctResponse);    scorm.set(calls.interactions.learnerResponse.replace("-id-", id), learnerResponse);    scorm.set(calls.interactions.result.replace("-id-", id), result);    scorm.set(calls.interactions.description.replace("-id-", id), description.substr(0, 249));    scorm.save();   };  var score = function (percent) {    scorm.set(calls.scoreRaw.call, percent);    scorm.set(calls.scoreScaled.call, percent / 100);    scorm.save();  };  return {    init: init,    complete: complete,    bookmark: bookmark,    interactions: interactions,    score: score,    state: state  };}]);
})();

(function(){
    'use strict';

    angular.module('gpmobile-custom',[]);
})();
(function(){
	'use strict';

	angular.module('gpmobile', [ 'ngRoute', 'ngAnimate', 'ngAria', 'gpmobile-custom', 'gpmobile-directives', 'gpmobile-plugins', 'gpmobile-services', 'gpmobile-animation', 'templates' ])
	  .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: "tileGrid.html"
        });
        var myChapters = [
    {
        "title": "Creditor Insurance",
        "link": "#/4",
        "template": "pages/chapter4.html",
        "icon": "components/icons/home_icon4.html",
        "color": "black-gradient",
        "augment": "",
        "completion": []
    },
    {
        "title": "Assessment",
        "link": "#/7",
        "template": "pages/chapter7.html",
        "icon": "components/icons/home_icon6.html",
        "color": "red-gradient",
        "augment": "assignment",
        "completion": []
    }
];
        angular.forEach(myChapters, function(chapter) {
            $routeProvider.when(chapter.link.substring(1), {templateUrl: chapter.template});
        });
        $routeProvider.otherwise({
            redirectTo: '/'
        });
      }])
	  .config(["$ariaProvider", function($ariaProvider) {
   		$ariaProvider.config({
     		tabindex: true,
     		ariaHidden: false,
			bindKeypress: true,
			bindRoleForClick: true
   		});
 	  }])
      .controller('AppCtrl', ["$scope", "$timeout", "$location", "$anchorScroll", "settingsService", "stateService", "chapterService", "audioService", "lmsService", function ($scope, $timeout, $location, $anchorScroll, settingsService, stateService, chapterService, audioService, lmsService){
            $scope.firstTouch = true;

            //audioService.init();

            $scope.title = "2018 Canada Business Required Training: Creditor Insurance";
            $scope.chapters = [
    {
        "title": "Creditor Insurance",
        "link": "#/4",
        "template": "pages/chapter4.html",
        "icon": "components/icons/home_icon4.html",
        "color": "black-gradient",
        "augment": "",
        "completion": []
    },
    {
        "title": "Assessment",
        "link": "#/7",
        "template": "pages/chapter7.html",
        "icon": "components/icons/home_icon6.html",
        "color": "red-gradient",
        "augment": "assignment",
        "completion": []
    }
];
            chapterService.setChapters($scope.chapters);
            $scope.settings = {
    "stopConsole": true,
    "forceSequence": false,
    "forceSpecificSequence": true,
    "chapterAutoAdvance": false,
    "completionMode": "score",
    "policyLink": "https://ycl.cigna.com/en/Enterprise/Our_Business_Units/Norterra/Pages/Ergonomics.aspx",
    "mtmSurvey": "http://www.metricsthatmatter.com/student/evaluation.asp?k=19029&i=EN0AL0106w_ST",
    "accessPath1": "./resources/samplePDFDocument1a.pdf",
    "accessPath2": "./resources/samplePDFDocument2.pdf",
    "accessPath3": "./resources/samplePDFDocument1a.pdf",
    "accessPath4": "./resources/samplePDFDocument2.pdf",
    "presentationMode": false,
    "pageNumbers": false,
    "hintOn": false,
    "audioOn": false,
    "commentsOn": false,
    "helpOn": false,
    "unlockOverride": false,
    "slideSpeed": 0.3,
    "defaultTransition": "fade",
    "currentTransition": "fade",
    "showSplash": true,
    "showLoadProgress": false,
    "totalQuiz1Pass": 100,
    "totalQuiz2Pass": 100,
    "quiz1NrOfQuestions": 10,
    "quiz2NrOfQuestions": 10,
    "nrOfTopics": 1,
    "autoRevealBegin": {
        "opacity": 0
    },
    "autoRevealShow": {
        "opacity": 1
    },
    "autoRevealEnd": {
        "opacity": 0
    },
    "autoRevealIntroDuration": 0.5,
    "autoRevealIntroStep": 0.4,
    "autoRevealOutroDuration": 0.5,
    "autoRevealOutroStep": 0.4
};
            $scope.settings.touchEnabled = Modernizr.touch;
            settingsService.setSettings($scope.settings);
            $scope.state = {
    "showMenu": false,
    "showAlert": false,
    "showAlertClose": true,
    "alertMessage": "",
    "currentChapter": null,
    "pageTitle": "",
    "pageCount": "",
    "chapterEntryPoint": "first",
    "lockLeft": false,
    "lockRight": false,
    "complete": false,
    "isMobile": false,
    "branch": 0,
    "tilesVisited": [],
    "showHide": "",
    "nrOfTopics": "",
    "QuestionNumber": "",
    "scores": [],
    "noscore": [],
    "passStatus": [],
    "nrOfQuestions": 0,
    "currentQuestion": 0,
    "quizComplete": false,
    "accessible": false,
    "hotspotsVisited": []
};

            //Check for mobile
            var isMobile = {
              Android: function() {
                  return navigator.userAgent.match(/Android/i);
              },
              BlackBerry: function() {
                  return navigator.userAgent.match(/BlackBerry/i);
              },
              iOS: function() {
                  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
              },
              Opera: function() {
                  return navigator.userAgent.match(/Opera Mini/i);
              },
              Windows: function() {
                  return navigator.userAgent.match(/IEMobile/i);
              },
              any: function() {
                  return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
              },
              IE10: function() {
                return navigator.userAgent.match(/MSIE/i);
              },
              IE11: function() {
                return navigator.userAgent.match(/Trident/i);
              }
            };
            $scope.state.isMobile = isMobile.any();
            if (isMobile.IE10() !== null) {
              $scope.state.alertMessage = "notInIE.html";
              $scope.state.showAlertClose = false;
              $scope.state.showAlert = true;
            }
            stateService.setState($scope.state);

           /**
 * Created by bwashburn on 11/24/2015.
 */

lmsService.init();



          //Global functions//
            $scope.zoomBackground = function(){
                if($scope.state.currentChapter !== null && !$scope.state.isMobile){
                    return true;
                }
                return false;
            };

            $scope.updatePageCount = function(place, total){
                var myPlace = place.toString();
                var myTotal = total.toString();
                $scope.state.pageCount = myPlace+"-"+myTotal;
            };
            $scope.isChapterComplete = function(completion,str){
                if(completion.length === 0){
                    //console.log(false);
                    return false;
                } else{
                    var complete = true;
                    for(var i=0; i<completion.length; i++){
                        if(complete){
                            complete = completion[i];
                        }
                    }
                    //console.log(complete);

					//scope.state.tilesCompleted.push(scope.chapterScope.currentPage-1);
					if(complete) {
						   //console.log("inside go to  " + complete);
						if($scope.state.currentChapter != null && $.inArray($scope.state.currentChapter, $scope.state.tilesVisited) == -1) {
							$scope.state.tilesVisited.push($scope.state.currentChapter);
						}
						//console.log($scope.state.tilesVisited);
					}
					//console.log (" complete = " + complete);
					if(str != null) {				
                   	    return (complete && (str.indexOf('Assessment') == -1));
					}
					else {
						return complete;
					}
                }
            };
			$scope.isQuizComplete = function(str){
				return ($scope.state.quizComplete && (str.indexOf('Assessment') > -1));
			};

            $scope.updateAugmentProp = function(chapterPos, value) {
            /*  console.log('chapterPos: '+ chapterPos +' value: '+ value);
			  console.log($scope.chapters);  */
              $scope.chapters[chapterPos].augment = value;
            };
			$scope.updateAugmentPropAccess = function(chapterPos, value) {
				// hide all chapters except assignement ones
			  for(var i=0; i<6; i++) {
				  $scope.chapters[i].augment = 'hide';
			  }
             // console.log('chapterPos: '+ chapterPos +' value: '+ value);
              $scope.chapters[chapterPos].augment = value;
            };

            $scope.updateCompletion = function(page) {
                $timeout(function(){
					if($scope.state.currentChapter != null) {
                   	 	$scope.chapters[$scope.state.currentChapter].completion[page] = true;
                    	chapterService.chapters[$scope.state.currentChapter].completion[page] = true;
                    	$scope.$apply();
					}
                },400, false);
            };
            $scope.OnOrOff = function(val)
            {
                if(val)
                {
                    return "On";
                }
                else
                {
                    return "Off";
                }
            };
            $scope.toggleMenu = function()
            {
                $scope.state.showMenu = !$scope.state.showMenu;
                $timeout(function(){$(window).resize();}, 0, false);
            };
            $scope.goHome = function()
            {
                $scope.state.showMenu = false;
                $scope.state.currentChapter = null;

                $scope.state.lockLeft = false;
                $scope.state.lockRight = false;
                document.location ="#/";
                $timeout(function(){$(window).resize();}, 0, false);

            };
            $scope.goPolicy = function(){
                var win = window.open($scope.settings.policyLink, '_blank');
                win.focus();
            };

            $scope.goPreviousChapter = function()
            {
                if($scope.state.currentChapter > 0)
                {
                    $scope.state.currentChapter--;
                    document.location = $scope.chapters[$scope.state.currentChapter].link;
                }
                else {
                    $scope.settings.currentTransition = $scope.settings.defaultTransition;
                    document.location = "#/";
                    $scope.state.currentChapter = null;
                    $scope.state.lockLeft = false;
                    $scope.state.lockRight = false;
                    $timeout(function(){$(window).resize();}, 0, false);
                }
            };
            $scope.goNextChapter = function()
            {
                if($scope.state.currentChapter < $scope.chapters.length-1)
                {
                    $scope.state.currentChapter++;
                    document.location = $scope.chapters[$scope.state.currentChapter].link;
                }
                else {
                    $scope.settings.currentTransition = $scope.settings.defaultTransition;
                    document.location = "#/";
                    $scope.state.currentChapter = null;
                    $scope.state.lockLeft = false;
                    $scope.state.lockRight = false;
                    $timeout(function(){$(window).resize();}, 0, false);
                }
            };
            $scope.hideAlert = function()
            {
                $scope.state.showAlert = false;
            };
			// g + alt
            document.addEventListener('keydown', function (event) {
			  //console.log(event.target);
   /*           if (event.which === 71 && event.altKey) {
                $scope.settings.forceSequence = !$scope.settings.forceSequence;
              }  */
			  if(event.which === 9 || event.which === 13) {
				  console.log('tab + enter');
				  getFocused(event);
			  }  
              //event.preventDefault();
            });  
			 
			var focused = 0;
			function getFocused(e){
	
				var ida =  $(':focus').eq(0).prop('class');
				console.log("focused = " + ida);
				if(ida=='detect' && focused==0){
					focused = 1;
					console.log(e);
				}
			}  
			$scope.scrollToo = function(id) {
      					var old = $location.hash();
    					$location.hash(id);
						console.log(id);
    					$anchorScroll();
    					//reset to old to keep any additional routing logic from kicking in
    					$location.hash(old);
   			};
			
			$scope.scrollToTop = function(amount) {
			  if(amount == undefined) amount = 600;
			  if(ycoord >$('page').scrollTop()) {
					ycoord = $('page').scrollTop();
			  }
			  ycoord=ycoord-amount;
			  if(ycoord<0) ycoord=0;
			  $('page').animate({scrollTop: ycoord}, 'slow'); // 'fast' is for fast animation
				console.log($('page').scrollTop());	
			}; 
			var ycoord=10;
			$scope.scrollDown = function(amount) {
			  if(amount == undefined) amount = 600;	
			  if((ycoord - $('page').scrollTop()) <= amount) {	
			  	 ycoord = ycoord + amount;
			  }
			  $('page').animate({scrollTop: ycoord}, 'slow'); // 'fast' is for fast animation
			  console.log($('page').scrollTop() + "-" + ycoord);
			}; 
	
            $scope.gotoPage = function(url, index) {
				// reset quiz settings
				stateService.state.QuestionNumber="";
				stateService.state.nrOfTopics="";
				stateService.state.currentQuestion=0;
				stateService.state.scores=[];
				stateService.state.noscore= [];
				stateService.state.passStatus = [];
				console.log(" url = " + url + " index = " + index);	
				
                if ($scope.settings.forceSequence && !$scope.settings.forceSpecificSequence) {
                    var allow = true;
                    for(var i=0; i<index; i++)
                    {
                        if($scope.chapters[i].augment !== 'hide'){
                          if($scope.chapters[i].completion.length > 0){
                            for(var j=0; j< $scope.chapters[i].completion.length; j++){
                              if(!$scope.chapters[i].completion[j]){
                                allow = false;
                              }
                            }
                          } else{
                            allow = false;
                          }
                        }
                    }
                    if(allow)
                    {
                        $scope.state.currentChapter = index;
                        document.location = url;
                        $scope.state.showMenu = false;
						
						
                    }
                    else
                    {
                        $scope.state.alertMessage = "completeInOrder.html";
                        $scope.state.showAlertClose = true;
                        $scope.state.showAlert = true;
                    }
                }
                else {
                    $scope.state.currentChapter = index;
                    document.location = url;
                    $scope.state.showMenu = false;
                }
				// force in specific sequence only selected chapters
				if ($scope.settings.forceSpecificSequence && !$scope.settings.forceSequence && $scope.chapters[$scope.state.currentChapter].title.indexOf("Assessment") != -1) {
                    var allows = true;
                    for(var k=0; k<index; k++)
                    {
                        if($scope.chapters[k].augment !== 'hide'){
                          if($scope.chapters[k].completion.length > 0){
                            for(var z=0; z< $scope.chapters[k].completion.length; z++){
                              if(!$scope.chapters[k].completion[z]){
                                allows = false;
                              }
                            }
                          } else{
                            allows = false;
                          }
                        }
                    }
                    if(allows)
                    {
                        $scope.state.currentChapter = index;
                        document.location = url;
                        $scope.state.showMenu = false;
						
						
                    }
                    else
                    {
                        $scope.state.alertMessage = "completeInSpecificOrder.html";
                        $scope.state.showAlertClose = true;
                        $scope.state.showAlert = true;
						document.location = "#/";
                    }
                }
                else {
					if(!$scope.settings.forceSequence && !$scope.settings.forceSpecificSequence) {
                   	 	$scope.state.currentChapter = index;
                    	document.location = url;
                    	$scope.state.showMenu = false;
					}
					
                }
            };
			$scope.print = function (print) {
                var printContents = document.getElementById(print).innerHTML;
                var popupWin = window.open('', '_blank', 'width=300,height=300');
                popupWin.document.open();
                popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
                popupWin.document.close();
            };

			
			// stop console.log
			if($scope.settings.stopConsole) {
				 try {
					if (typeof(window.console) != "undefined") {
						window.console = {};
						window.console.log = function () {
						};
						window.console.info = function () {
						};
						window.console.warn = function () {
						};
						window.console.error = function () {
						};
					}
			
					if (typeof(alert) !== "undefined") {
						alert = function ()
						{
			
						};
					}
			
				} catch (ex) {
			
				} 
			}

      }]);
})();
(function(){
    'use strict';

    angular.module('gpmobile-directives',[])
        .directive('alert', function() {
            return {
                restrict: 'E',
                templateUrl: 'components/alert.html'
            };
        })
        .directive('menuTop', function() {
            return {
                restrict: 'E',
                templateUrl: 'components/menu.html'

            };
        })
        .directive('logo', function() {
            return {
                restrict: 'E',
                templateUrl: 'components/logo.html'

            };
        })
        .directive('check', function() {
          return {
            restrict: 'E',
            templateUrl: 'components/check.html'

          };
        })
        .directive('chapterTiles',['$location', function(location){
            return {
                restrict: 'E',
                transclude: true,
                templateUrl: 'components/chapterTiles.html',
                controller: ["$scope", function($scope){
                    $scope.chapterScope = {};
                    $scope.tiles = [];
                    $scope.inPage = false;
                    $scope.showOverlay = false;

                    if($scope.state.currentChapter === null){
                        //set scope.state.currentChapter variable of the rootScope
                        var myLink = '#'+location.url();
                        for(var i=0; i< $scope.chapters.length; i++){
                            if($scope.chapters[i].link === myLink) {
                                $scope.state.currentChapter = i;
                            }
                        }
                        if($scope.state.currentChapter === null){
                            //If currentChapter value can not be set go Home.
                            $scope.goHome();
                        }
                    }


                    //public functions
                    this.registerChapter = function(chapter){
                        $scope.chapterScope = chapter;
                        var firstTime = ($scope.chapters[$scope.state.currentChapter].completion.length === 0)? true: false;
                        for(var i=0; i<$scope.chapterScope.pages.length; i++){
                            if(firstTime){
                                $scope.tiles.push({title:$scope.chapterScope.pages[i].title, showHide:$scope.chapterScope.pages[i].showHide, complete:false});
                            } else{
                                $scope.tiles.push({title:$scope.chapterScope.pages[i].title, showHide:$scope.chapterScope.pages[i].showHide, complete:$scope.chapters[$scope.state.currentChapter].completion[i]});
                            }
                        }
                    };
                    this.swipeLeft = function(){


                    };
                    this.swipeRight = function(){
                        $scope.goBack();
                    };
                    this.completeChapterTile = function(){
                        $scope.tiles[$scope.chapterScope.currentPage-1].complete = true;
                    };
                }],
                link: function(scope, element, attrs)
                {
                    scope.title = scope.chapters[scope.state.currentChapter].title;
					scope.showHide = scope.chapters[scope.state.currentChapter].showHide;
                    scope.color = scope.chapters[scope.state.currentChapter].color;
					
                    //hide pages to start//
                    TweenMax.set(element.find('.chapter-holder'), {left:"100%"});

                    scope.goBack = function(){
                        if(scope.inPage){
                            if(!scope.tiles[scope.chapterScope.currentPage-1].complete && !scope.showOverlay){
                                scope.showOverlay = true;
                            } else{
                              scope.showOverlay = false;
                              scope.inPage = false;
                              scope.chapterScope.pages[scope.currentPage].conceal();
                              TweenMax.to(element.find('.chapter-holder'), scope.settings.slideSpeed, {left: "100%", ease: Linear.easeNone});
                              TweenMax.to(element.find('.chapter-tile-holder'), scope.settings.slideSpeed, {left: "0%", ease: Linear.easeNone});
                              element.find('.chapter-container').removeClass('inpage');
                            }
                        } else{
                            scope.goHome();
                        }
                    };

                    scope.pageComplete = function(){
                        return scope.tiles[scope.chapterScope.currentPage-1].complete;
                    };
                    scope.continueNav = function() {
                        console.log('continue');
                        scope.goBack();
                    };
                    scope.cancelNav = function() {
                      console.log('cancel');
                      scope.showOverlay = false;
                    };

                    scope.tileClick = function(tile){
						console.log("tile click");
                       	scope.inPage = true;
                        element.find('page').hide();
                        $(element.find('page')[tile]).show();
                        scope.chapterScope.currentPage = tile+1;
                        scope.chapterScope.pages[tile].reveal();
                        scope.currentPage = tile;
                        TweenMax.to(element.find('.chapter-holder'), scope.settings.slideSpeed, {left: "0%", ease: Linear.easeNone});
                        TweenMax.to(element.find('.chapter-tile-holder'), scope.settings.slideSpeed, {left: "-100%", ease: Linear.easeNone});
                        element.find('.chapter-container').addClass('inpage');
                     };
                }
            };
        }])
        .directive('chapter', ['$location', '$timeout', 'stateService', function(location, $timeout, stateService) {
            return {
                require: '?^chapterTiles',
                restrict: 'E',
                transclude: true,
                templateUrl: 'components/chapter.html',
                controller: ["$scope", function($scope){
                    $scope.pages = [];
                    $scope.currentPageComplete = false;
					$scope.showIncompleteWarning = false;
                    $scope.isChapterTileChild = false;
                    $scope.currentPage = 0;
					$scope.currentChapterComplete=false;

                    //public functions
                    this.registerPage = function(page){
                        $scope.pages.push(page);
                    };

                    this.pageComplete = function(){
                        $scope.updateCompletion($scope.currentPage-1);
                        $scope.currentPageComplete = true;
                        if($scope.isChapterTileChild){
                            $scope.completeChapterTile();
                        }
                    };
					this.currentPageComplete = function() {
						if( this.isChapterComplete())
							return true;
						else
							return $scope.currentPageComplete;
					};
					this.isChapterTileChild = function() {
						return $scope.isChapterTileChild;
					};
                    this.autoAdvance = function(){
                        $scope.swipeLeft();
                    };
					this.goBack = function() {
						$scope.goHome();
					};
					this.isChapterComplete = function() {
						 if(stateService.state.currentChapter != null) {
							 var temp;
							 for(var i = 0; i<$scope.chapters[stateService.state.currentChapter].completion.length; i++) {
								temp = $scope.chapters[stateService.state.currentChapter].completion[i];
								//console.log("temp = " + $scope.chapters[stateService.state.currentChapter].completion[i]);
							 }
							// console.log("isChapterComplete = " + temp);
							 $scope.currentChapterComplete = temp;
							 if(temp && stateService.state.pageTitle.indexOf('Assessment')==-1) {
								 
							 	stateService.state.lockLeft=false; // original false
							 }
						 	 return temp;
						 }
					};
                }],
                link: function(scope, element, attrs, chapterTilesCtrl)
                {	
				    // find out nr of questions in the assessment with multiple topics
	 				var allPages = $(element).find('.assessment');
					var allQuestions=0;
					if(allPages.length>0) {
						var locTemp;
	  					console.log("all pages = " + allPages.length);
						for(var z=0; z<	allPages.length; z++) {
							locTemp=$(allPages[z]).find('quiz-topics');
						    var pool = locTemp.attr("pool");
							allQuestions = allQuestions + parseInt(pool);	
						}
						//console.log(allQuestions);
						stateService.state.nrOfQuestions = allQuestions;
					}
                    //Check if chapterTiles is parent
                    if(chapterTilesCtrl !== null){
                        scope.isChapterTileChild = true;
                        chapterTilesCtrl.registerChapter(scope);
                    } else{
						scope.isChapterTileChild = false;
                    }

                    //If the course opens on a chapter page
                    if(scope.state.currentChapter === null){
                        console.log("opens on a chapter page");
                        //set scope.state.currentChapter variable of the rootScope
                        var myLink = '#'+location.url();
                        for(var i=0; i< scope.chapters.length; i++){
                            if(scope.chapters[i].link === myLink) {
                                scope.state.currentChapter = i;
                            }
                        }
                        if(scope.state.currentChapter === null){
                            //If currentChapter value can not be set go Home.
                            scope.goHome();
                        }
                    }

                    //Chapter has not been visited yet
                    if(scope.chapters[scope.state.currentChapter].completion.length === 0){
                        console.log("Chapter has not been visited yet ");
                        var chapterCompletion = [];
                        for(var j=0; j<element.find('page').length; j++){
							var temp = element.find('page')[j].getAttribute('show-hide');
							if(temp != null) {
								temp = (temp.split('-'));
								//console.log("temp = " + temp[stateService.state.branch] + " " + stateService.state.branch);
								// check for the pages that should be completed - exlude pages that are hidden
							/*	if(temp[stateService.state.branch] == true) {
									chapterCompletion.push(false);
								} */
								chapterCompletion.push(false);
							}
                        }
			           // console.log("pages nr = " + j + " " + chapterCompletion.length);
                        scope.chapters[scope.state.currentChapter].completion = chapterCompletion;
                    }

                    var myPages = $(element).find('page');
                    scope.totalPages = myPages.length;
                    switch(scope.state.chapterEntryPoint)
                    {
                        case "completion":
                            scope.currentPage = null;
                            for(var k=0; k<scope.chapters[scope.state.currentChapter].completion.length; k++){
                                if(!scope.chapters[scope.state.currentChapter].completion[k]){
                                    scope.currentPage = k+1;
                                    break;
                                }
                            }
                            if(scope.currentPage === null){
                                scope.currentPage = 1;
                            }
                            //scope.currentPage = Math.min(scope.chapters[scope.state.currentChapter].completion * scope.totalPages, scope.totalPages);
                            scope.currentPage = (scope.currentPage === 0)? 1: scope.currentPage;
                            break;
                        case "first":
                            scope.currentPage = 1;
                            break;
                        case "last":
                            scope.currentPage = scope.totalPages;
                            break;
                    }
                    scope.updatePageCount(scope.currentPage, scope.totalPages);

                    //If in presentationMode hide scrollbars on pages
                    if(scope.settings.presentationMode){
                        myPages.each(function(index){
                            $(this).css('overflow', 'hidden');
                        });
                    }

                    scope.previousPage = null;
                    var holder = $(element).find('.chapter-holder');
                    $(holder).css("width", (scope.totalPages) * 100 + '%');

                    $(holder).css("left", -(scope.currentPage-1) * ($(window).width()) + 'px');

                    scope.completeChapterTile = function(){
                        chapterTilesCtrl.completeChapterTile();
                    };

                    scope.swipeLeft = function() {
						console.log("swipeLeft current page complete = " + scope.currentPageComplete + " " + 
						scope.currentChapterComplete + " " + scope.state.lockLeft);
						
                        if(!scope.isChapterTileChild){
                            if((scope.currentPageComplete || scope.currentChapterComplete || !scope.state.lockLeft)) {
                                scope.state.lockRight = false;
								
                                scope.state.lockLeft = true; 
                                if ((scope.currentPage) < scope.totalPages) {
                                    scope.previousPage = scope.currentPage;
                                    scope.currentPage++;
                                    scope.updatePageCount(scope.currentPage, scope.totalPages);

                                    TweenMax.to(holder[0], scope.settings.slideSpeed, {left: (-(scope.currentPage-1) * ($(window).width()) + 'px'), ease: Linear.easeNone});
                                    //TweenMax.to(holder[0], scope.settings.slideSpeed, {left: (-(scope.currentPage-1) * 100 + 'vw'), ease: Linear.easeNone});

									scope.currentPageComplete = false;
									setTimeout(function() {	
									
										if(stateService.state.lockLeft==false) {
											scope.currentPageComplete = true;
											console.log("current page = " + scope.currentPageComplete  );
											scope.$apply();
										}
									},2);

                                    scope.pages[scope.previousPage-1].conceal(true);
                                    scope.pages[scope.currentPage-1].reveal(true);
									
                                }
                                else if (scope.currentPage == scope.totalPages) {
                                    scope.updateCompletion(1);
                                    scope.pages[scope.currentPage-1].conceal(true);
                                    if(scope.settings.chapterAutoAdvance){
                                        scope.settings.currentTransition = "slide-left";
                                        scope.state.chapterEntryPoint = "first";
                                        scope.goNextChapter();
                                    }else {
                                        scope.state.chapterEntryPoint = "completion";
                                        scope.goHome();
                                    }
                                }
                            }
                        } else{
                            chapterTilesCtrl.swipeLeft();
                        }
						if(!scope.state.lockLeft) scope.currentPageComplete =true;
						console.log("swipeLeft completion state " + scope.currentPageComplete);
						
                    };
                    scope.swipeRight = function(){
						
                        if(!scope.isChapterTileChild){
							console.log("swipeRight");
							if(!scope.currentPageComplete) {
								scope.showIncompleteWarning=true;
								scope.setOverlyDisplay();
								console.log("swipeRight " + scope.showIncompleteWarning);
								
							}
							else {
								scope.showIncompleteWarning=false;
							}
                //          if(!scope.state.lockRight && !scope.showIncompleteWarning) {
					    if(!scope.state.lockRight) {
                            scope.state.lockRight = false;  
                            scope.state.lockLeft = false;  //  changed to true
							
                            if ((scope.currentPage) > 1) {
                                scope.previousPage = scope.currentPage;
                                scope.currentPage--;
                                scope.updatePageCount(scope.currentPage, scope.totalPages);

                                TweenMax.to(holder[0], scope.settings.slideSpeed, {left: (-(scope.currentPage-1) * ($(window).width()) + 'px'), ease: Linear.easeNone});
                                // TweenMax.to(holder[0], scope.settings.slideSpeed, {left: (-(scope.currentPage-1) * 100 + 'vw'), ease: Linear.easeNone});

                                scope.currentPageComplete = true; // changed to true
								
                                scope.pages[scope.previousPage-1].conceal(false);
                                scope.pages[scope.currentPage-1].reveal(false);
                            } else if (scope.currentPage === 1) {
                                scope.pages[scope.currentPage-1].conceal(false);
                                if(scope.settings.chapterAutoAdvance) {
                                    scope.settings.currentTransition = "slide-right";
                                    scope.state.chapterEntryPoint = "completion";
                                    scope.goPreviousChapter();
                                }else {
                                    scope.state.chapterEntryPoint = "completion";
                                    scope.goHome();
                                }
                            }
                        }
                        } else{
                            if(!stateService.state.lockRight){
                                chapterTilesCtrl.swipeRight();
                            }

                        }
						console.log("swipeRight completion state " + scope.currentPageComplete);
                    };
					scope.setOverlyDisplay = function() {
						scope.$broadcast('someEvent', [1,2,3]);
					};
					scope.goBack = function() {
						chapterTilesCtrl.goBack();
					};
					scope.isChapterTileChildArrow = function() {
						 var temp = stateService.state.pageTitle.indexOf('Assessment')==-1;
						 if(temp && scope.isChapterTileChild)
						 	return false;
						 else if(temp == false)
						 	return false;
						 else if(scope.isChapterTileChild)
						 	return false;	
						 else 
						    return true;		
					 };
				
                    $(window).on('resize', function(){
                        if(!scope.isChapterTileChild){
                            $(holder).css("left", -(scope.currentPage-1) * ($(window).width()) + 'px');
                        }
                    });
                    $timeout(function(){
                        if(!scope.isChapterTileChild){
                            scope.pages[scope.currentPage-1].reveal(true);
                        }
                    },400, false);
                }
            };
        }])
        .directive('page', ['settingsService', 'stateService', 'chapterService', function(settingsService, stateService, chapterService) {
            return {
                require: '^chapter',
                restrict: 'E',
                transclude: true,
                templateUrl: 'components/page.html',
                scope: {
                    title: '@title',
					showHide: '@showHide'
                },
                controller: ["$scope", "$rootScope", function ($scope, $rootScope) {
                    $scope.autoReveals = [];
                    $scope.inAnimations = [];
                    $scope.outAnimations = [];
                    $scope.settings = null;
                    $scope.completionState = 0;
                    $scope._autoComplete = null;
					$scope.showHide = null;
                    $scope.active = false;
                    $scope.revealSignal = new signals.Signal();
                    $scope.concealSignal = new signals.Signal();
                    $scope.completionChangeSignal = new signals.Signal();
                    $scope.previouslyCompletedSignal = new signals.Signal();
					$scope.showOverlayForPage = false;
					$scope.pageTitle = "";

					
                    //public functions
                    this.registerAutoReveal = function (autoReveal) {
                        $scope.autoReveals.push(autoReveal);
                    };

                    this.getRevealSignal = function (){
                        return $scope.revealSignal;
                    };

                    this.getConcealSignal = function (){
                        return $scope.concealSignal;
                    };

                    this.getCompletionChangeSignal = function (){
                      return $scope.completionChangeSignal;
                    };

                    this.getPreviouslyCompletedSignal = function (){
                        return $scope.previouslyCompletedSignal;
                    };

                    this.completePage = function() {
						console.log("complete controller");
                        $scope.complete();
                    };

                    this.autoAdvance = function() {
                        $scope._autoAdvance();
                    };

                    this.active = function(){
                        return $scope.active;
                    };
					this.showHide = function() {
						return $scope.showHide;
					};

                    this.toggleResize = function(){
                        $scope.resize();
                    };
					$scope.$on('someEvent', function(event, mass) { 
					    
                            var temp = $scope.isChapterComplete();
						//    console.log("page complete = " + !$scope.pageComplete() + " chapter complete = " + temp);
						/*	if(!$scope.pageComplete() && !$scope.isChapterComplete()) { 
							    console.log("here");
								$scope.showOverlayForPage=true; 
								$scope.showIncompleteWarning = true;
							} */
						
					});
					
                }],
                link: function (scope, element, attrs, chapterCtrl, chapterTilesCtrl) {

                    chapterCtrl.registerPage(scope);
                    scope.autoRevealTimeline = null;
                    scope.autoConcealTimeline = null;
                    scope.settings = settingsService.settings;
					setTimeout(function() {
						if(stateService.state.pageTitle.indexOf('Assessment')>-1) { 
							console.log("showhide none " + stateService.state.pageTitle);
							$(".showhideStatus").css({"visibility":"hidden"});
						}
						else {
							console.log("showhide display");
							$(".showhideStatus").css({"visibility":"visible"});
						}
					},300);
					
					setTimeout(function() { 
						 	if(!chapterCtrl.currentPageComplete() || stateService.state.pageTitle.indexOf('Assessment')>-1) {							
								stateService.state.lockLeft = true;
								$(".showhideStatus").css("display","block");
							}
							else {
								stateService.state.lockLeft = false;
							}
							scope.$apply();
							 
					}, 500); 
					
					if(stateService.state.currentChapter != null)
						scope.color = chapterService.chapters[stateService.state.currentChapter].color; 
					else
						scope.color = "#ccc";	
                    var myComplete = parseInt(attrs.autoComplete, 10);
					var tempShowHide = [];
					// set page title
					stateService.state.pageTitle = attrs.title;
					console.log("page title = " + attrs.title);
					scope.pageTitle = attrs.title;
					
					// depending on the selected branch set
					// to either show or hide page
					if(attrs.showHide != null )
						tempShowHide = attrs.showHide.split('-');
					if(tempShowHide.length > 0 ) {
							switch(stateService.state.branch) {
								case 0: 
									scope.showHide = tempShowHide[0];
									break;
								case 1:
									scope.showHide = tempShowHide[1];
									break;
								default:
									scope.showHide = 'true';
									break;	
							}
					}
					else {
						scope.showHide = 'true';
					}
					
					// scrolling
					 var scrollObject = {};
      				 var scrollElement = document.getElementById('scroll1');
					
					//
					if(typeof attrs.showHide === "undefined"){
                        scope.showHide = true;
                    }
                    if(typeof attrs.autoComplete === "undefined"){
                        scope._autoComplete = true;
                    }
                    if(isNaN(myComplete)){
                        if (attrs.autoComplete === "false" || attrs.autoComplete === "FALSE"){
                            scope._autoComplete = false;
                        }else{
                            scope._autoComplete = true;
                        }
                    }else{
                        if(0 === myComplete){
                            scope._autoComplete = true;
                        }else{
                            scope._autoComplete = myComplete;
                        }
                    }

                    scope.autoRevealTimeline = new TimelineMax({paused:true});
                    scope.autoRevealTimeline.staggerFromTo(scope.autoReveals, scope.settings.autoRevealIntroDuration, scope.settings.autoRevealBegin, scope.settings.autoRevealShow, scope.settings.autoRevealIntroStep);
                    scope.autoConcealTimeline = new TimelineMax({paused:true});
                    var concealItems = scope.autoReveals.slice();
                    concealItems.reverse();
                    scope.autoConcealTimeline.staggerFromTo(concealItems, scope.settings.autoRevealOutroDuration, scope.settings.autoRevealShow, scope.settings.autoRevealEnd, scope.settings.autoRevealOutroStep);
                    TweenMax.set(scope.autoReveals, scope.settings.autoRevealBegin);


                    scope.complete = function(){
						console.log("COMPLETE page");
                        if(typeof scope._autoComplete === "boolean"){
                            scope._autoComplete = true;
                        }
                        if(typeof scope._autoComplete === "number"){

                            scope.completionState++;
                            scope.completionChangeSignal.dispatch();
                            if(scope._autoComplete <= scope.completionState){
                                stateService.state.lockLeft = false;  // changed from false - to hide right arrow in the quiz
								console.log(" right arrow show = " + stateService.state.lockLeft);
                                chapterCtrl.pageComplete();
                            }
							if(stateService.state.pageTitle.indexOf('Assessment')>-1) {
								
								stateService.state.lockLeft = true;
							}
                        }
                        if(scope._autoComplete === true){
                            stateService.state.lockLeft = false;
                            chapterCtrl.pageComplete();
                        }
                    };

                    scope._autoAdvance = function(){
                        chapterCtrl.autoAdvance();
                    };

                    scope.previouslyCompleted = function(){
                        scope.previouslyCompletedSignal.dispatch();
                    };
					 

                    scope.reveal = function(forward) {
                        scope.active = true;
                        //scope.completionState = 0;
                        if(!scope.settings.presentationMode && $(element).get(0).scrollWidth < $(element).innerWidth() &&  (element).innerWidth() < 1024){
                            var offset = $(element).innerWidth()-$(element).get(0).scrollWidth;
                            $('.chapter-right').css('margin-right', offset+'px');
                        }else{
                            $('.chapter-right').css('margin-right', '0');
                        }
                        scope.revealSignal.dispatch();
                        if(scope.autoReveals.length > 0) {
                            if(!forward){
                                scope.autoConcealTimeline.stop();
                                scope.autoConcealTimeline.reverse(0);
                            }else {
                                scope.autoRevealTimeline.stop();
                                scope.autoRevealTimeline.play(0);
                            }
                        }
                        if(scope._autoComplete === true){
                            chapterCtrl.pageComplete();
                            stateService.state.lockLeft = false;
                        }
                        else{
							// page has already been visited
							if(scope.pageComplete()==true)
								stateService.state.lockLeft = false;
							else
								stateService.state.lockLeft = true;								
                        }
                        stateService.state.pageTitle = attrs.title;
						stateService.state.showHide = attrs.showHide;
						console.log("page title = " + attrs.title);
						scope.pageTitle = attrs.title;
					/*	scope.$apply(); */
                        
                    };

                    scope.conceal = function(forward) {
                        scope.active = false;
                        scope.concealSignal.dispatch();
                        if(scope.autoReveals.length > 0) {
                            if(!forward){
                                scope.autoRevealTimeline.stop();
                                scope.autoRevealTimeline.reverse(0);
                            }else{
                                scope.autoConcealTimeline.stop();
                                scope.autoConcealTimeline.play(0);
                            }
                        }
                        //stateService.state.pageTitle = "";
                    };
                    scope.resize = function(){
                        if(scope.active){
                            if(!scope.settings.presentationMode && $(element).get(0).scrollWidth < $(element).innerWidth() &&  (element).innerWidth() < 1024){
                                var offset = $(element).innerWidth()-$(element).get(0).scrollWidth;
                                $('.chapter-right').css('margin-right', offset+'px');
                            }else{
                                $('.chapter-right').css('margin-right', '0');
                            }
                        }
                    };
					// used for the page header status message display
					 scope.pageComplete = function(){
						 return chapterCtrl.currentPageComplete();
 					 };
					 // used for the page header show/hide -> hide in assignement
					 scope.isChapterTileChild = function() {
						 return (false && stateService.state.pageTitle.indexOf('Assessment')==-1);
					 };
					 
					 scope.cancelNav = function() {
                      console.log('cancel');
                      scope.showOverlayForPage = false;
                    };
					scope.isChapterComplete = function() {
						 return chapterCtrl.isChapterComplete();
					};
					 scope.goBack = function() {
						chapterCtrl.goBack();
						scope.showOverlayForPage = false;
					 };
                    $(window).on('resize', scope.resize);

					
				}	
			};
		}])
        .directive('stretchPane', function() {
            return {
                restrict: 'A',
                scope: {
                    stretchPane: '='
                },
                link: function (scope, element, attrs) {

                    var rect;

                    $(document).ready(function(){
                        rect = element[0].getBoundingClientRect();
                        element.css("height", ($(window).height()-rect.top)*(scope.stretchPane/100)+'px');
                    });

                    $(window).on("resize", function(){
                        rect = element[0].getBoundingClientRect();
                        element.css("height", ($(window).height()-rect.top)*(scope.stretchPane/100)+'px');
                    });
                }
            };
        })
		.directive('arrow', ["$timeout", function ($timeout) {
			return {
				restrict: 'A',
				link: function (scope, element, attrs) {
        		element.bind("keydown keypress", function (event) {  
					if (event.which === 38) {
					  var prevNode = element[0].previousElementSibling;
					  var prev = angular.element(prevNode);
					  prev[0].focus();
					  console.log('previous');
					}
					if (event.which === 9) {
						var target = element;
						if(target != null && target != 'undefined') {
							 target[0].focus();
					//		 $(target).css("border","solid 3px green");
						}
						console.log(target[0]);
						console.log('next');
					}
        		});
				}
    		};
		}])
		.directive('scrollDirective', function() { 
			
				return {
					require: '^page',
					link: function(scope, element, attrs) {
						 var scrollElement = document.getElementById("scrolledEL");
						 var scrollElementS = document.getElementById("scrolledELS");
						 if(scrollElement != null ) {
						     scrollElement.addEventListener("scroll", myScript);
							 scrollElement.scrollTop = 1;
						 }
						 if(scrollElementS != null ) {	 
						 	scrollElementS.addEventListener("scroll", myScriptS);
							scrollElement.scrollTop = 1;
						 }
						 
	  					 function myScript() {
							 if(attrs.scrollDirective != null) {
							  var elmnt = document.getElementById("scrolledEL");
							
							  var y = elmnt.scrollTop;
							  var arg = attrs.scrollDirective;
					          if(arg != null || arg != '') {
									 //console.log("Vertically: " + y + "px" + " " +  $(window).height());
									 // amountscrolled(y);
									 // to be used in the future
									 var temp = arg.split(",");
									
								if(temp[1] && temp[1].length>0) {
										// console.log("height = " + temp[1]);
										  arg = temp[0];
										//  console.log("arg = " + arg);
										 var normalized = y/(((parseInt(temp[1]) - $(window).height())*(700/$(window).height())));
										// console.log("normalized: = " +  normalized);
										 
									 if(normalized< 0.39) {
										  $("#scroll1").addClass(arg).removeClass('white');
										  $("#scroll2, #scroll3, #scroll4, #scroll5").removeClass(arg).addClass('white');
										  
									  }
									  else if(normalized >0.391 && normalized < 0.79) {
										$("#scroll2").addClass(arg).removeClass('white');
										$("#scroll1, #scroll3, #scroll4, #scroll5").removeClass(arg).addClass('white');
										
									  }
									  else if(normalized >0.791 && normalized < 1.19) {
										$("#scroll3").addClass(arg).removeClass('white');
										$("#scroll1, #scroll2, #scroll4, #scroll5").removeClass(arg).addClass('white');
										 
										
									  }
									  else if(normalized >1.19 && normalized < 1.499) {  //   1.161
										$("#scroll4").addClass(arg).removeClass('white');
										$("#scroll1, #scroll3, #scroll2, #scroll5").removeClass(arg).addClass('white');
										
									  }
									  else if(normalized >1.5) {
										  $("#scroll1, #scroll2, #scroll3, #scroll4").removeClass(arg).addClass('white');
										  $("#scroll5").removeClass('white').addClass(arg);
										 								
									  }
									 }
									 // old way
									 else { 
								/*	  if(y< 510) {
										  $("#scroll1").addClass(arg).removeClass('white');
										  $("#scroll2, #scroll3, #scroll4, #scroll5").removeClass(arg).addClass('white');
										  
									  }
									  if(y >510 && y < 1109) {
										$("#scroll2").addClass(arg).removeClass('white');
										$("#scroll1, #scroll3, #scroll4, #scroll5").removeClass(arg).addClass('white');
										
									  }
									  if(y >1110 && y <= 1709) {
										$("#scroll3").addClass(arg).removeClass('white');
										$("#scroll1, #scroll2, #scroll4, #scroll5").removeClass(arg).addClass('white');
										// TweenMax.to("#transfer1", 1,  {x:"1000px"}); 
										
									  }
									  if(y >1710 && y <= 2309) {
										$("#scroll4").addClass(arg).removeClass('white');
										$("#scroll1, #scroll3, #scroll2, #scroll5").removeClass(arg).addClass('white');
										$("#card1").click();
									  }
									  if(y >2310) {
										  $("#scroll1, #scroll2, #scroll3, #scroll4, #scroll5").removeClass(arg).addClass('white');
										 $("#scroll5").addClass(arg).removeClass('white');								
									  } */
									 }
						
							  }
						  	}
						}
						function myScriptS() {
							 if(attrs.scrollDirective != null) {
							  var elmnt = document.getElementById("scrolledELS");
							  console.log("myScriptS");
							  var y = elmnt.scrollTop;
							  var arg = attrs.scrollDirective;
					          if(arg != null || arg != '') {
									 // console.log("Vertically: " + y + "px" + " " + arg);
									  if(y< 300) {
										  $(".scroll1s").removeClass('white').addClass(arg);
										  $(".scroll2s, .scroll3s, .scroll4s, .scroll5s").removeClass(arg).addClass('white');
										  
									  }
									  if(y >300 && y < 900) {
										$(".scroll2s").removeClass('white').addClass(arg);
										$(".scroll1s, .scroll3s, .scroll4s, .scroll5s").removeClass(arg).addClass('white');
										
									  }
									  if(y >900 && y < 1300) {
										$(".scroll3s").removeClass('white').addClass(arg);
										$(".scroll1s, .scroll2s, .scroll4s, .scroll5s").removeClass(arg).addClass('white');
										// TweenMax.to("#transfer1", 1,  {x:"1000px"}); 
										
									  }
									  if(y >1300 && y <= 1500) {
										$(".scroll4s").removeClass('white').addClass(arg);
										$(".scroll1s, .scroll3s, .scroll2s, .scroll5s").removeClass(arg).addClass('white');
										$("#card1").click();
									  }
									  if(y >1500) {
										$(".scroll5").removeClass('white').addClass(arg);
										$(".scroll1s, .scroll2s, .scroll3s, .scroll4s").removeClass(arg).addClass('white');
																		
									  }
								 
							  }
						  	}
						}
					/*	function amountscrolled(y){
    						var winheight = $(window).height();
    						var docheight = $(document).height();
    						var scrollTop = y;
    						//var trackLength = docheight - winheight
							var trackLength = docheight
							console.log("winheight = " + winheight + " docheight = " + docheight + " scrollTop = " + scrollTop + " trackLength " + trackLength);  
    						var pctScrolled = Math.floor(scrollTop/trackLength * 100) // gets percentage scrolled (ie: 80 NaN if tracklength == 0)
    						console.log(pctScrolled + '% scrolled')
						} */ 
				   }
				};
			});    
})();

(function($) {
    $.fn.hasHorizontalScrollBar = function() {
        console.log("boom");
        return this.get(0) ? this.get(0).scrollWidth > this.innerWidth() : false;
    };
})(jQuery);
(function($) {
    $.fn.hasVerticalScrollBar = function() {
        return this.get(0) ? this.get(0).scrollHeight > this.innerheight() : false;
    };
})(jQuery);

(function(){
    'use strict';

    angular.module('gpmobile-plugins',[])
        .directive('gateAdapter', ['stateService', function (stateService) {    return {        restrict: 'E',        transclude: true,        require: '^page',        templateUrl: 'gateAdapter.html',        scope:{mobile: '@'},        link: function (scope, element, attrs, pageCtrl) {            scope.complete = false;            scope.reveal = function(){            };            scope.conceal = function(){            };			scope.gateAdapter = function(){				if(!scope.complete)				{					$(element).addClass("complete");					scope.complete = true;					pageCtrl.completePage();				}			};            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };}])
.directive('splashChooseBranch', ['chapterService','stateService', 'settingsService', '$timeout', function(chapterService, stateService, settingsService, $timeout) {    return {        restrict: 'E',        templateUrl: 'splashChooseBranch.html',        link: function(scope, element, attrs){          /*Step 1: create questions to filter which chapters will be used*/		  var token = 0;          scope.questions = [            {              question:"Select role 1.",              selected:true            },            {              question:"Select role 2.",              selected:false            }          ];		  scope.path1 = true;          /* select one radio button exclusively */          scope.distractorSelected = function (question, $event) {            question.selected = !question.selected;			scope.questions[0].selected = true;			if(scope.questions[0].selected == true && token == 0) { 				token = 1;				scope.questions[0].selected=false;				scope.questions[1].selected=true;				}			else			if(scope.questions[1].selected == true && token == 1) {				token = 0;				scope.questions[0].selected=true;				scope.questions[1].selected=false;				}			else			if(scope.questions[0].selected == false && token == 1) { 				token = 0;			    scope.questions[0].selected=true;				scope.questions[1].selected=false;				}          };		  scope.beginCourseAccessibility=function(){			  stateService.state.accessible = true;			//  for(var h=0; h < 2; h++){                scope.updateAugmentProp(0,'hide');            //  }			  if(scope.path1){				  stateService.state.branch=0;				   window.open(settingsService.settings.accessPath1, '_blank');			  } 			  chapterService.setChapters(scope.chapters);//repopulate the chapterService with the current info.              scope.settings.showSplash = false;			  scope.gotoPage("#/7", 1);		  };             scope.beginPress = function(){			  var goAhead = false;	              var myChapters = chapterService.chapters;              /*Step 2: Create logic to filter chapters based on which questions were selected*/              /*Since this implementation is using an opt-in paradigm, I set every tile to hide itself except the welcome tile. This is done by adding the hide class to each tile using the augment property.                Note: The welcome tile already has an augment value of 'welcome'*/              for(var h=1; h < scope.chapters.length; h++){                scope.updateAugmentProp(h,'hide');              }              /*Iterate through the questions and if selected run the logic inside of a case within the switch statement*/              for(var i=0; i < scope.questions.length; i++) {                var selected = scope.questions[i].selected;                if(selected){				  goAhead = true;                  switch(i) {                    case 0:					  console.log('zero = ' + i);					  stateService.state.branch=0;					 //stateService.state.nrOfQuestions=3;					// $(".background").css("{background: url(images/bg.jpg)}");                      scope.updateAugmentProp(i,'');//remove hide class  Managing Complaints					  scope.updateAugmentProp(i+1,'assessment');//remove hide class  Assessment					//  scope.updateAugmentProp(i+2,'');//remove hide class  Assessment					//  scope.updateAugmentProp(i+3,'');//remove hide class  assessment Chapter 6					//  scope.updateAugmentProp(i+3,'');//remove hide class  assessment Chapter 6                      break;                    case 1:					  stateService.state.branch=1;					 // stateService.state.nrOfQuestions=8;					  $(".background").css({"background": "url(images/bg_second.jpg) no-repeat center center fixed","width":"100%;","background-size": "cover"});                      scope.updateAugmentProp(i,'');//remove hide class  chapter 1					  scope.updateAugmentProp(i+1,'');//remove hide class  chapter 2					//  scope.updateAugmentProp(i+3,'');//remove hide class chapter 4					  scope.updateAugmentProp(i+4,'');//remove hide class chapter 5					  scope.updateAugmentProp(i+5,'');//remove hide class chapter 7  Assesment role 2                      break;                    default:					  stateService.state.branch=0;					  scope.updateAugmentProp(i+1,'');//remove hide class  Chapter 1					  scope.updateAugmentProp(i+2,'');//remove hide class  Chapter 2					  scope.updateAugmentProp(i+3,'');//remove hide class  Chapter 3					  scope.updateAugmentProp(i+6,'');//remove hide class  Chapter 6 Assessment role 1					  scope.updateAugmentProp(i+8,'');//remove hide class  Chapter Attestation					break;                  }                }				else if(i==(scope.questions.length-1) &&  goAhead==false) {					alert("Please select one of the options");				}              }			  if(goAhead) {              	chapterService.setChapters(scope.chapters);//repopulate the chapterService with the current info.              	scope.settings.showSplash = false;				// 			  }            };        }    };}])
.directive('accordion', function() {    return {        require: '^page',        restrict: 'E',        transclude: true,        templateUrl: 'accordion.html',        scope:{},        link: function (scope, element, attrs, pageCtrl) {            scope.orientation = attrs.orientation;            scope.autoComplete = (attrs.autoComplete === undefined)? false : true;            scope.sequenced = (attrs.sequenced === undefined)? false : true;            scope.defaultHeight = 45;            scope.portraitBarHeight = 0.07;            scope.landscapeBarHeight = 0.06;            scope.portrait = true;            scope.barMargin = 0.005;            scope.barHeight = 0;            scope.paneCount = $(element).find('accordion-pane').length;            scope.contentWidth = 0;            scope.completedCollection = [];            if(scope.autoComplete || scope.sequenced){                $(element).find('.accordion-bar').addClass('mark_completion');            }            if(attrs.height !== undefined)//parse height attribute            {                var heightArray = attrs.height.split(',');                if(heightArray.length > 1){                    switch(scope.orientation){                        case 'vertical':                            scope.portraitContentHeight = (heightArray[0] === 'auto')? 'auto': Number(heightArray[0]);                            scope.landscapeContentHeight = (heightArray[1] === 'auto')? 'auto': Number(heightArray[1]);                            break;                        case 'horizontal':                            scope.portraitContentHeight = (heightArray[0] === 'auto')? scope.defaultHeight : Number(heightArray[0]);                            scope.landscapeContentHeight = (heightArray[1] === 'auto')? scope.defaultHeight : Number(heightArray[1]);                            break;                        case 'responsive':                            scope.portraitContentHeight = (heightArray[0] === 'auto')? 'auto': Number(heightArray[0]);                            scope.landscapeContentHeight = (heightArray[1] === 'auto')? scope.defaultHeight : Number(heightArray[1]);                            break;                    }                } else {                    switch(scope.orientation){                        case 'vertical':                            scope.portraitContentHeight = (heightArray[0] === 'auto')? 'auto': Number(heightArray[0]);                            scope.landscapeContentHeight = (heightArray[0] === 'auto')? 'auto': Number(heightArray[0]);                            break;                        case 'horizontal':                            scope.portraitContentHeight = (heightArray[0] === 'auto')? scope.defaultHeight : Number(heightArray[0]);                            scope.landscapeContentHeight = (heightArray[0] === 'auto')? scope.defaultHeight : Number(heightArray[0]);                            break;                        case 'responsive':                            scope.portraitContentHeight = (heightArray[0] === 'auto')? 'auto': Number(heightArray[0]);                            scope.landscapeContentHeight = (heightArray[0] === 'auto')? scope.defaultHeight : Number(heightArray[0]);                            break;                    }                }            } else {                scope.portraitContentHeight = (scope.orientation === 'horizontal')? scope.defaultHeight: 'auto';                scope.landscapeContentHeight = (scope.orientation === 'responsive' || scope.orientation === 'horizontal')? scope.defaultHeight: 'auto';            }            scope.closeFinished = function(){                $(this.target).css('display', 'none');                pageCtrl.toggleResize();            };            scope.openStarted = function(){                $(this.target).css('display', 'block');            };            scope.getItemPlace = function(item){                var myItems = $(element).find('.accordion-bar');                for(var i=0; i<myItems.length; i++){                    if(myItems[i] === item){                        return i;                    }                }                return 0;            };            scope.verticalInit = function(){                var myDefault = $(element).find('accordion-default');                myDefault.css('width', '100%');                $(element).find('.accordion-content-holder').css('width', '100%');                if($(element).find('.accordion-bar.selected').length > 0){//ITEM OPENED                    //////close default//////                    $(myDefault, myDefault.find('.accordion-content-holder')).css('display', 'none');                    myDefault.find('.accordion-content-holder').height(0);                    myDefault.height(0);                    //////open selected//////                    var contentHeight;                    if(scope.portrait){                        contentHeight = (scope.portraitContentHeight === 'auto')?  $(element).find('.accordion-bar.selected').parent('accordion-pane').find('.accordion-content')[0].offsetHeight : (scope.portraitContentHeight*scope.myWidth)/100;                        if(scope.portraitContentHeight !== 'auto'){                            $(element).find('.accordion-content-holder').css('overflow-y', 'auto');                        } else {                            $(element).find('.accordion-content-holder').css('overflow-y', 'hidden');                        }                    } else {                        contentHeight = (scope.landscapeContentHeight === 'auto')?  $(element).find('.accordion-bar.selected').parent('accordion-pane').find('.accordion-content')[0].offsetHeight : (scope.landscapeContentHeight*scope.myWidth)/100;                        if(scope.landscapeContentHeight !== 'auto'){                            $(element).find('.accordion-content-holder').css('overflow-y', 'auto');                        } else {                            $(element).find('.accordion-content-holder').css('overflow-y', 'hidden');                        }                    }                    $(element).find('.accordion-bar.selected').parent('accordion-pane').height(contentHeight + (scope.myWidth * (scope.barHeight+scope.barMargin)));                    $(element).find('.accordion-bar.selected').parent('accordion-pane').find('.accordion-content-holder').height(contentHeight);                } else {//items closed                    if(myDefault.length > 0){                        var defaultHeight;                        if(scope.portrait){                            defaultHeight = (scope.portraitContentHeight === 'auto')?  myDefault.find('.accordion-content')[0].offsetHeight : (scope.portraitContentHeight*scope.myWidth)/100;                            if(scope.portraitContentHeight !== 'auto'){                                $(element).find('.accordion-content-holder').css('overflow-y', 'auto');                            } else {                                $(element).find('.accordion-content-holder').css('overflow-y', 'hidden');                            }                        } else {                            defaultHeight = (scope.landscapeContentHeight === 'auto')?  myDefault.find('.accordion-content')[0].offsetHeight : (scope.landscapeContentHeight*scope.myWidth)/100;                            if(scope.landscapeContentHeight !== 'auto'){                                $(element).find('.accordion-content-holder').css('overflow-y', 'auto');                            }else {                                $(element).find('.accordion-content-holder').css('overflow-y', 'hidden');                            }                        }                        $(myDefault, myDefault.find('.accordion-content-holder')).css('display', 'block');                        myDefault.height(defaultHeight+scope.barMargin*scope.myWidth);                        myDefault.find('.accordion-content-holder').height(defaultHeight);                    }                }                $(element).find('.accordion-content').css('height', 'auto').css('width', 'auto');                $(element).find('.accordion-bar').css('width', '100%').css('margin-top', 'auto');            };            scope.horizontalInit = function(){                var contentHeight = (scope.portrait)?(scope.portraitContentHeight*scope.myHeight)/100: (scope.landscapeContentHeight*scope.myHeight)/100;                var myDefault = $(element).find('accordion-default');                myDefault.height(contentHeight);                $(element).find('.accordion-content-holder').css('overflow-y', 'hidden');                scope.contentWidth = $(element).width()-((scope.myWidth*(scope.barHeight+scope.barMargin))*scope.paneCount);                if($(element).find('.accordion-bar.selected').length > 0){                    $(myDefault, myDefault.find('.accordion-content-holder')).css('display', 'none');                    myDefault.find('.accordion-content-holder').width(0);                    myDefault.width(0);                } else {                    $(myDefault, myDefault.find('.accordion-content-holder')).css('display', 'block');                    myDefault.find('.accordion-content-holder').width(scope.contentWidth).height(contentHeight);                    myDefault.width(scope.contentWidth+scope.barMargin*scope.myWidth).height(contentHeight);                }                $(element).find('.accordion-content').css('height',  contentHeight+'px');                $(element).find('.accordion-bar').css('width', contentHeight+'px').css('margin-top', contentHeight+'px');                $(element).find('.accordion-content-holder').css('height', contentHeight+'px');                $(element).find('.accordion-content').outerWidth(scope.contentWidth);                $(element).find('.accordion-bar').not('.selected').parent('accordion-pane').outerWidth(scope.myWidth*scope.barHeight);                $(element).find('.accordion-bar.selected').parent('accordion-pane').outerWidth(scope.contentWidth+(scope.myWidth*(scope.barHeight+scope.barMargin)));                $(element).find('.accordion-bar.selected').parent('accordion-pane').find('.accordion-content-holder').width(scope.contentWidth);            };            scope.resize = function(){                scope.myWidth = $(window).innerWidth();                scope.myHeight = $(window).innerHeight();                scope.portrait = (scope.myWidth < scope.myHeight);                if(scope.orientation === 'responsive'){                    if(scope.portrait) {//portrait                        $(element).removeClass('horizontal').addClass('vertical');                        scope.barHeight = scope.portraitBarHeight;                        scope.verticalInit();                    } else {//landscape                        $(element).removeClass('vertical').addClass('horizontal');                        scope.barHeight = scope.landscapeBarHeight;                        scope.horizontalInit();                    }                }                else if(scope.orientation === 'vertical'){                    if(scope.portrait) {//portrait                        scope.barHeight = scope.portraitBarHeight;                        scope.verticalInit();                    } else {//landscape                        scope.barHeight = scope.landscapeBarHeight;                        scope.verticalInit();                    }                }                else if(scope.orientation === 'horizontal'){                    if(scope.portrait) {//portrait                        scope.barHeight = scope.portraitBarHeight;                        scope.horizontalInit();                    } else {//landscape                        scope.barHeight = scope.landscapeBarHeight;                        scope.horizontalInit();                    }                }            };            $(window).on("resize", scope.resize);            switch(scope.orientation){                case 'horizontal':                    $(element).addClass('horizontal');                    scope.resize();                    break;                case 'vertical':                    $(element).addClass('vertical');                    scope.resize();                    break;                case 'responsive':                    scope.resize();                    break;                default:                    console.log("Accordion-Plugin: Unknown orientation value.");                    break;            }            scope.verticalSelect = function(item){                //vars///////////////////                var myPane = $(item).parent('accordion-pane');                var myHolder = myPane.find('.accordion-content-holder');                var myContent = myHolder.find('.accordion-content');                var oldBar = $(item).parents('accordion').find('.accordion-bar.selected');                var myDefault = $(element).find('accordion-default');                if($(item).hasClass('selected')){//close selected                    $(item).removeClass('selected');                    TweenMax.to(myPane, 0.3, {height: scope.myWidth*scope.barHeight});                    TweenMax.to(myHolder, 0.3, {height: 0, onComplete:scope.closeFinished});                    //open default;                    if(myDefault.length > 0){                        myDefault.css('display', 'block').css('height', '0px');                        myDefault.find('.accordion-content-holder').css('display', 'block').css('height', '0px');                        var defaultHeight;                        if(scope.portrait){                            defaultHeight = (scope.portraitContentHeight === 'auto')?  myDefault.find('.accordion-content')[0].offsetHeight : (scope.portraitContentHeight*scope.myWidth)/100;                        } else {                            defaultHeight = (scope.landscapeContentHeight === 'auto')?  myDefault.find('.accordion-content')[0].offsetHeight : (scope.landscapeContentHeight*scope.myWidth)/100;                        }                        TweenMax.to(myDefault, 0.3, {height: defaultHeight+(scope.myWidth*scope.barMargin)});                        TweenMax.to(myDefault.find('.accordion-content-holder'), 0.3, {height: defaultHeight, onStart:scope.openStarted});                    }                } else {//open selected                    if(oldBar.length > 0){                        $(oldBar).removeClass('selected');                        TweenMax.to(oldBar.parent('accordion-pane'), 0.3, {height: (scope.myWidth*scope.barHeight)});                        TweenMax.to(oldBar.parent('accordion-pane').find('.accordion-content-holder'), 0.3, {height: 0, onComplete:scope.closeFinished});                    } else {                        TweenMax.to(myDefault, 0.3, {height: 0, onComplete:scope.closeFinished});                        TweenMax.to(myDefault.find('.accordion-content-holder'), 0.3, {height: 0, onComplete:scope.closeFinished});                    }                    /////////////////////////////////////////////////////////////////////                    $(item).addClass('selected');                    myHolder.css('display', 'block').css('height', '0px');                    var contentHeight;                    if(scope.portrait){                        contentHeight = (scope.portraitContentHeight === 'auto')?  $(element).find('.accordion-bar.selected').parent('accordion-pane').find('.accordion-content')[0].offsetHeight : (scope.portraitContentHeight*scope.myWidth)/100;                    } else {                        contentHeight = (scope.landscapeContentHeight === 'auto')?  $(element).find('.accordion-bar.selected').parent('accordion-pane').find('.accordion-content')[0].offsetHeight : (scope.landscapeContentHeight*scope.myWidth)/100;                    }                    TweenMax.to(myPane, 0.3, {height: contentHeight+(scope.myWidth*(scope.barHeight+scope.barMargin))});                    TweenMax.to(myHolder, 0.3, {height: contentHeight});                }            };            scope.horizontalSelect = function(item){                //vars///////////////////                var myPane = $(item).parent('accordion-pane');                var myHolder = myPane.find('.accordion-content-holder');                var oldBar = $(item).parents('accordion').find('.accordion-bar.selected');                var myDefault = $(element).find('accordion-default');                if($(item).hasClass('selected')){//close selected                    $(item).removeClass('selected');                    TweenMax.to(myPane, 0.3, {width: (scope.myWidth*scope.barHeight)});                    TweenMax.to(myHolder, 0.3, {width: 0, onComplete:scope.closeFinished});                    $(myDefault, myDefault.find('.accordion-content-holder')).css('display', 'block');                    TweenMax.to(myDefault, 0.3, {width: scope.contentWidth+(scope.myWidth*(scope.barMargin))});                    TweenMax.to(myDefault.find('.accordion-content-holder'), 0.3, {width: scope.contentWidth, onStart:scope.openStarted});                } else {//open selected                    if(oldBar.length > 0){                        $(oldBar).removeClass('selected');                        TweenMax.to(oldBar.parent('accordion-pane'), 0.3, {width: (scope.myWidth*scope.barHeight)});                        TweenMax.to(oldBar.parent('accordion-pane').find('.accordion-content-holder'), 0.3, {width: 0, onComplete:scope.closeFinished});                    } else {                        TweenMax.to(myDefault, 0.3, {width: 0, onComplete:scope.closeFinished});                        TweenMax.to(myDefault.find('.accordion-content-holder'), 0.3, {width: 0, onComplete:scope.closeFinished});                    }                    /////////////////////////////////////////////////////////////////////                    $(item).addClass('selected');                    TweenMax.to(myPane, 0.3, {width: scope.contentWidth+(scope.myWidth*(scope.barHeight+scope.barMargin))});                    TweenMax.to(myHolder, 0.3, {width: scope.contentWidth, onStart:scope.openStarted});                }            };            scope.barSelected = function(){                var proceed = false;                var myIndex = $(element).find('.accordion-bar').index(this);                if(scope.sequenced && scope.completedCollection.length >= myIndex)                {                    proceed = true;                } else if(!scope.sequenced){                    proceed = true;                }                if(proceed){                    $(this).addClass('visited');                    if(scope.completedCollection.indexOf(myIndex) < 0){                        scope.completedCollection.push(myIndex);                    }                    if(scope.completedCollection.length === scope.paneCount)                    {                        element.addClass('complete');                        pageCtrl.completePage();                    }                    switch(scope.orientation){                        case 'horizontal':                            scope.horizontalSelect(this);                            break;                        case 'vertical':                            scope.verticalSelect(this);                            break;                        case 'responsive':                            var portrait = (scope.myWidth < scope.myHeight);                            if(portrait){                                scope.verticalSelect(this);                            } else{                                scope.horizontalSelect(this);                            }                    }                }            };            $(element).find('accordion-pane').find('.accordion-content-holder').css('display', 'none');            $(element).find('.accordion-bar').on('click', scope.barSelected);        }    };}).directive('accordionPane', function() {    return {        require: '^page',        restrict: 'E',        transclude: true,        templateUrl: 'accordionPane.html',        scope:{},        link: function (scope, element, attrs) {            scope.label = attrs.label;			scope.index = attrs.ind;        }    };}).directive('accordionDefault', function () {    return {        restrict: 'E',        transclude: true,        templateUrl: 'accordionDefault.html',        scope: {}    };})
.directive('animationCustom', ['chapterService','stateService', '$timeout', function(chapterService, stateService, $timeout) {    return {        restrict: 'E',		transclude: false,        templateUrl: 'animationCustom.html',        link: function(scope, element, attrs){   }    };}])
.directive('ddrop', ['$sce', 'lmsService', 'stateService', '$timeout', function ($sce, lmsService, stateService, $timeout) {    return {    	restrict: 'E',    	transclude: true,   		require: ['?^page'],        templateUrl: 'ddrop.html',		scope: {     		 distractor: '@',			 dindicator: '@',			 className:  '@',			 order:      '@'    	},		controller: ["$scope", "$timeout", function($scope, $timeout){			$timeout(function() {				},1000); 		}],         link: function(scope, element, attrs, Ctrls) {			var argg =  attrs.dindicator;			var className = attrs.className;			var orderSequence = attrs.order;			if(orderSequence != undefined && orderSequence != null) {				var oSequence = orderSequence.split(",");				console.log("oSequence = " + oSequence[0]);			}			$timeout(function() {				switch(argg) {					case "a" :						scope.argg='';						loadScript1();						$(".ddropShowAnwsers").hide();					break; 					case "b" :						scope.argg='a';			  			$("." + scope.argg + "ddropShowAnwsers").hide();					break;					case "c" :						scope.argg='b';						$("." + scope.argg + "ddropShowAnwsers").hide();					break;					case "d" :						scope.argg='d';						$("." + scope.argg + "ddropShowAnwsers").hide();					break; 					case "e" :						scope.argg='e';						$("." + scope.argg + "edropShowAnwsers").hide();					break;					case "f" :						scope.argg='f';						$("." + scope.argg + "gdropShowAnwsers").hide();					break;  					case "g" :						scope.argg='g';						$("." + scope.argg + "gdropShowAnwsers").hide();					break; 					case "h" :						scope.argg='h';						$("." + scope.argg + "hdropShowAnwsers").hide();					break;					case "i" :						scope.argg='i';						$("." + scope.argg + "idropShowAnwsers").hide();					break;					case "j" :						scope.argg='j';						$("." + scope.argg + "jdropShowAnwsers").hide();					break;					case "k" :						scope.argg='k';						$("." + scope.argg + "kdropShowAnwsers").hide();					break;					case "l" :						scope.argg='l';						$("." + scope.argg + "ldropShowAnwsers").hide();					break;					case "m" :						scope.argg='m';						$("." + scope.argg + "mdropShowAnwsers").hide();					break;				}			},1000);			var content = $(element).find('.content');     		var question = {};			question.showFeedback = false;      		question.questionCorrect = false;      		scope.slide1 = question;			var pageCtrl = Ctrls[0];			question.instructions = $sce.trustAsHtml($(content[0]).find('instructions').html());      		question.stem = $sce.trustAsHtml($(content[0]).find('stem').html());			question.correct = $sce.trustAsHtml($(content[0]).find('feedback>correct').html());      		question.incorrect = $sce.trustAsHtml($(content[0]).find('feedback>incorrect').html());      		question.showFeedback = false;      		question.questionCorrect = false;			scope.draggableItems = $(element).find('.content draggableItem');		//    scope.draggableItems = $sce.trustAsHtml($(element).find('.content draggableItem').html());      		scope.droppableItems = $(element).find('.content droppableItem');			scope.hints = $(element).find('.content hint');			scope.acceptValues = [];			scope.acceptPvalues = [];			scope.droppableValues = [];			scope.gethints = [];			scope.showWarning = true;			console.log('start');			scope.path = "1";			console.log(element);			//DraggableItems      		var draggablebleItems = $(element).find('.content draggableItem');			var hints = $(element).find('.content hint');			var droppableItems = $(element).find('.content droppableItem');			console.log("droppableItems = " + droppableItems.length);			for (var i = 0; i < draggablebleItems.length; i++) {				var temp = $sce.trustAsHtml($(draggablebleItems[i]).html());				if( temp == "" || temp == "undefined") { temp=i; }				else {					scope.acceptPvalues[i]  = temp;				}			}      		for (var k = 0; k < droppableItems.length; k++) {				// console.log(droppableItems[k].attributes['accept'].value);				scope.acceptValues.push(droppableItems[k].attributes.accept.value);				var tempL = $sce.trustAsHtml($(droppableItems[k]).html());				if(tempL != null || tempL != "undefined") {					scope.droppableValues[k] = tempL;				}				else					scope.droppableValues[k] = ""; 	 			}			for (var j=0; j<hints.length; j++) {				scope.gethints[j] = $(hints[j]).text();			}			// Hide all content elements once you have extracted all info from them			element.find('.content').html("");			$timeout(function() {				var opointer;				$(".hint1,.hint2,.hint3,.hint4,.hint5,.hint6,.hint7").click(function() {				    var temp = $(this).attr('class');					opointer = temp;					closeIt();					$(".show"+temp).show();				});				$(".closeIt").click(function() {					$(".showhint1,.showhint2,.showhint3,.showhint4,.showhint5,.showhint6,.showhint7").hide();				});			},500);			// show / hide hint element;			/* function closeIt() {					console.log('close it');					$(".showhint1,.showhint2,.showhint3,.showhint4,.showhint5,.showhint6,.showhint7").hide();			} */			function setDroppable(itemSp,acceptValue) {				var droppableItem = "#droppableItem" + itemSp;				var snapItem = "#droppableItem" + itemSp;				var acceptItem = "#draggableItem" + acceptValue;				console.log("see = " + droppableItem + " " + snapItem + " " +acceptItem);				$( droppableItem).droppable({					accept: acceptItem,			 		drop: function( event, ui ) {			  		$(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: snapItem});			  		// center			 		var $this = $(this);			  		ui.draggable.position({				  		my: "center",				  		at: "center",				  		of: $this,				  		using: function(pos) {							$(this).animate(pos, 100, "linear");				  		}			  		});			  		$( this )						.addClass( "dropped" )						.find( "p" )				  		.html( "Dropped!" );						 d9=1; 				 		checkCorrect();			 		},			 		over: function(event, ui) {						// console.log(ui.draggableItem[0]);						// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable9"});			 		}          		 });			}			scope.reveal = function () {				$timeout(function () {				  stateService.state.lockRight = false;				  console.log("element complete ddrop " + element.hasClass('complete'));				  if(element.hasClass('complete')) {					scope.currentPageComplete=true; 										stateService.state.lockLeft = false;				  }				  else						stateService.state.lockLeft = true; 				  scope.$apply();				}, 0, false);				scope.reset();				setTimeout(function() {					console.log('reveal' + scope.argg);					if(scope.argg == 'j') scope.loadScriptPaint('j');					if(scope.argg == 'f') scope.loadScriptPaint('f');					if(scope.argg == 'g') scope.loadScript('g');					if(scope.argg == 'h') scope.loadScript('h');					if(scope.argg == 'i') scope.loadScript('i');				},1000);			};			scope.conceal = function () {				setTimeout(function() {					console.log('reveal' + scope.argg);					if(scope.argg == 'j') {						$("#jdraggableItem1 p").removeClass("ui-draggable-handle");						$("#jdraggableItem1").draggable( "destroy" );						$("#jdraggableItem2 p").removeClass("ui-draggable-handle");						$("#jdraggableItem2").draggable( "destroy" );					}				},1);			};			scope.showAnswers = function() {				var tSubmit=testSubmit();				if(tSubmit) {					//$("." + className + " .ddropShowAnwsers").removeClass("hide").addClass("show");					//$("." + scope.argg + "ddropShowAnwsers").show();				}			};			scope.submitAnswer = function() {				console.log("submit= " + argg);				var tSubmit=testSubmit(argg);				if(tSubmit) {					// $(".showhint1").hide().text("");					var correct = true;					var getStatus = checkCorrect();					 var answerSubmitted = false;						correct = true;						if (getStatus) {						  scope.slide1.questionCorrect = correct;						  scope.slide1.showFeedback = true;						  element.addClass('complete');						  pageCtrl.completePage();						}						else {						  correct = false;						  scope.slide1.questionCorrect = correct;						  scope.slide1.showFeedback = true;						  element.addClass('complete');						  pageCtrl.completePage();						}				}				else {				//	$(".showhint1").show().text("Please complete the drag & drop activity");				}				//closeIt();			};			scope.reset = function () {        		scope.quizComplete = false;			/*	for(var j=0; j<scope.slide1.distractors.length; j++){				  scope.slide1.distractors[j].selected = false;				} */				$timeout(function () {				  scope.$apply();				});			};			if (pageCtrl !== null) {        		pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);        		pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);      		}		/******** generic SCRIPT for  Sorting sequence     *********/		/* used for several d&drop activities:  A,B,C,D,E,G,H,I,K,L */		var a1,a2,a3,a4,a5,a6,a7=0;		scope.dropped=[];        scope.loadScript = function(arg) {			console.log("arg = " + arg);		  if((arg == 'a' || arg == 'b' || arg == 'c' || arg == 'd' || arg=='e' || arg=='g' || arg=='h' || arg=='i' || arg=='k' || arg=='l' || arg =='')&& $("#"+arg+"draggableItem1 p").attr('class') != "ui-draggable-handle") {						console.log("load script 2");			// set indicators to hide			//$("." + className + " .ddropShowAnwsers").removeClass("show").addClass("hide");		  $("." + scope.argg + "ddropShowAnwsers").hide();		  $( "#"+arg+"draggableItem1" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#"+arg+"draggableItem2" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#"+arg+"draggableItem3" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#"+arg+"draggableItem4" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#"+arg+"draggableItem5" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#"+arg+"draggableItem6" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#"+arg+"draggableItem7" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });           $( "#"+arg+"droppableItem1" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#"+scope.argg+"droppableItem1"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				  a1=$(ui.draggable[0]).attr('id');			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable", cursor: "move",  grid: [ 100, 10 ]});			 }          });		   $( "#"+arg+"droppableItem2" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#"+scope.argg+"droppableItem2"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			   // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				  a2=$(ui.draggable[0]).attr('id');			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable", cursor: "move",  grid: [ 100, 10 ]});			 }          });		  $( "#"+arg+"droppableItem3" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#"+scope.argg+"droppableItem3"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				  a3=$(ui.draggable[0]).attr('id');			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable3"});			 }          });		  $( "#"+arg+"droppableItem4" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#"+scope.argg+"droppableItem4"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				  a4=$(ui.draggable[0]).attr('id');			 },			 over: function(event, ui) {				 //console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable4"});			 }          });		  $( "#"+arg+"droppableItem5" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#"+scope.argg+"droppableItem5"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				  a5=$(ui.draggable[0]).attr('id');			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				//$(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable5"});			 }          });		  $( "#"+arg+"droppableItem6" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#"+scope.argg+"droppableItem6"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				 scope.dropped.push($(this).attr('id'));				 a6=$(ui.draggable[0]).attr('id');			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable6"});			 }          });		  $( "#"+arg+"droppableItem7" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#"+scope.argg+"droppableItem7"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				  a7=$(ui.draggable[0]).attr('id');			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable7"});			 }          });  		  }		}; 		/******   SCRIPT for paint drag & drop type   *****************/		/* used for F, J and M type activites  */		scope.loadScriptPaint = function(arg) {			console.log("arg = " + arg);		  if((arg=='f' || arg=='j' || arg=='m')&& $("#"+arg+"draggableItem1 p").attr('class') != "ui-draggable-handle") {						console.log("load script Paint");			// set indicators to hide			//$("." + className + " .ddropShowAnwsers").removeClass("show").addClass("hide");		  $("." + scope.argg + "dropShowAnwsers").hide();		  $( "#"+arg+"draggableItem1" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#"+arg+"draggableItem2" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });          $( "#"+arg+"droppableItem1" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: true, cursor: "move", snap: "#droppableItem1"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  a1=$(ui.draggable[0]).attr('id');			  if(a1== (scope.argg+"draggableItem1")) {				  console.log($(this));			 	 $( this ).removeClass("droppedBlack").addClass( "dropped" );			  }			  else if(a1== (scope.argg+"draggableItem2")) {				  console.log($(this));			 	 $( this ).removeClass("dropped").addClass( "droppedBlack" );			  } 				  scope.dropped.push($(this).attr('id'));			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable", cursor: "move",  grid: [ 100, 10 ]});			 }          });		   $( "#"+arg+"droppableItem2" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: true, cursor: "move", snap: "#droppableItem2"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			   // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });		  	  a2=$(ui.draggable[0]).attr('id');			  if(a2== (scope.argg+"draggableItem1")) {			 	 $( this ).removeClass("droppedBlack").addClass( "dropped" );			  }			  else if(a2== (scope.argg+"draggableItem2")) {			 	 $( this ).removeClass("dropped").addClass( "droppedBlack" );			  } 			  scope.dropped.push($(this).attr('id'));			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable", cursor: "move",  grid: [ 100, 10 ]});			 }          });		  $( "#"+arg+"droppableItem3" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: true, cursor: "move", snap: "#droppableItem3"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });  			  a3=$(ui.draggable[0]).attr('id');			  if(a3== (scope.argg+"draggableItem1")) {			 	 $( this ).removeClass("droppedBlack").addClass( "dropped" );			  }			  else if(a3== (scope.argg+"draggableItem2")) {			 	 $( this ).removeClass("dropped").addClass( "droppedBlack" );			  } 			   scope.dropped.push($(this).attr('id'));			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable3"});			 }          });		  $( "#"+arg+"droppableItem4" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: true, cursor: "move", snap: "#droppableItem4"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  a4=$(ui.draggable[0]).attr('id');			  if(a4== (scope.argg+"draggableItem1")) {			 	 $( this ).removeClass("droppedBlack").addClass( "dropped" );			  }			  else if(a4== (scope.argg+"draggableItem2")) {			 	 $( this ).removeClass("dropped").addClass( "droppedBlack" );			  }  				  scope.dropped.push($(this).attr('id'));			 },			 over: function(event, ui) {				 //console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable4"});			 }          });		  $( "#"+arg+"droppableItem5" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: true, cursor: "move", snap: "#droppableItem5"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });  			  a5=$(ui.draggable[0]).attr('id');			  if(a5== (scope.argg+"draggableItem1")) {			 	 $( this ).removeClass("droppedBlack").addClass( "dropped" );			  }			  else if(a5== (scope.argg+"draggableItem2")) {			 	 $( this ).removeClass("dropped").addClass( "droppedBlack" );			  } 				  scope.dropped.push($(this).attr('id'));			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				//$(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable5"});			 }          });		  $( "#"+arg+"droppableItem6" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: true, cursor: "move", snap: "#droppableItem6"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });  			  a6=$(ui.draggable[0]).attr('id');			  if(a6== (scope.argg+"draggableItem1")) {			 	 $( this ).removeClass("droppedBlack").addClass( "dropped" );			  }			  else if(a6== (scope.argg+"draggableItem2")) {			 	 $( this ).removeClass("dropped").addClass( "droppedBlack" );			  } 				 scope.dropped.push($(this).attr('id'));			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable6"});			 }          });		  $( "#"+arg+"droppableItem7" ).droppable({			 accept: "#"+ scope.argg+"draggableItem1,#"+scope.argg+"draggableItem2,#"+scope.argg+"draggableItem3,#"+scope.argg+"draggableItem4,#"+scope.argg+"draggableItem5,#"+scope.argg+"draggableItem6,#"+scope.argg+"draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: true, cursor: "move", snap: "#droppableItem7"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {					$(this).animate(pos, 100, "linear");				  }			  });			  a7=$(ui.draggable[0]).attr('id');			  if(a7== (scope.argg+"draggableItem1")) {			 	 $( this ).removeClass("droppedBlack").addClass( "dropped" );			  }			  else if(a7== (scope.argg+"draggableItem2")) {			 	 $( this ).removeClass("dropped").addClass( "droppedBlack" );			  } 			  scope.dropped.push($(this).attr('id'));			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable7"});			 }          });  		  }		}; 		/******   SCRIPT for random order drop -> first drag and drop in chapter 1     ********/		  var p1,p2,p3,p4,p5,p6,p7,p8,p9 = 0;         function loadScript1() {	/*	  $(function(){			$('div[onload]').trigger('onload');		  }); */		  console.log("resize");          $( "#draggableItem1" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#draggableItem2" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#draggableItem3" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#draggableItem4" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#draggableItem5" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#draggableItem6" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });		  $( "#draggableItem7" ).draggable({ revert: true, cursor: "move", cursorAt: { top: 20, left: 20 }, handle: "p" });           $( "#droppableItem1" ).droppable({			 accept: "#draggableItem1,#draggableItem2,#draggableItem3,#draggableItem4,#draggableItem5,#draggableItem6,#draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", containment: "#droppableItem1", cursor: "move", snap: "#droppableItem1"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {				/*	$(this).animate({width:'-=10px',height:'-=10px'},10); */					$(this).animate(pos, 20, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				  p1=$(ui.draggable[0]).attr('id');				/*  setTimeout(function() {					  $(ui.draggable[0]).css({"left":"345px","border":"solid 2px black"});				  },200); */				//  checkCorrect();			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable", cursor: "move",  grid: [ 100, 10 ]});			 }          });		   $( "#droppableItem2" ).droppable({			 accept: "#draggableItem1,#draggableItem2,#draggableItem3,#draggableItem4,#draggableItem5,#draggableItem6,#draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#droppableItem2"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			   // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {			/*		$(this).animate({width:'-=10px',height:'-=10px'},10); */					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				 scope.dropped.push($(this).attr('id'));				 p2=$(ui.draggable[0]).attr('id');				// checkCorrect();			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable", cursor: "move",  grid: [ 100, 10 ]});			 }          });		  $( "#droppableItem3" ).droppable({			 accept: "#draggableItem1,#draggableItem2,#draggableItem3,#draggableItem4,#draggableItem5,#draggableItem6,#draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#droppableItem3"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {			/*		$(this).animate({width:'-=10px',height:'-=10px'},10); */					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				 scope.dropped.push($(this).attr('id'));				 p3=$(ui.draggable[0]).attr('id');				// checkCorrect(); 			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable3"});			 }          });		  $( "#droppableItem4" ).droppable({			 accept: "#draggableItem1,#draggableItem2,#draggableItem3,#draggableItem4,#draggableItem5,#draggableItem6,#draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#droppableItem4"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {			/*		$(this).animate({width:'-=10px',height:'-=10px'},10); */					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				 p4=$(ui.draggable[0]).attr('id'); 				// checkCorrect();			 },			 over: function(event, ui) {				 //console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable4"});			 }          });		   $( "#droppableItem5" ).droppable({			 accept: "#draggableItem1,#draggableItem2,#draggableItem3,#draggableItem4,#draggableItem5,#draggableItem6,#draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#droppableItem5"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {				/*	$(this).animate({width:'-=10px',height:'-=10px'},10); */					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				  scope.dropped.push($(this).attr('id'));				 p5=$(ui.draggable[0]).attr('id');				// checkCorrect(); 			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				//$(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable5"});			 }          });		   $( "#droppableItem6" ).droppable({			 accept: "#draggableItem1,#draggableItem2,#draggableItem3,#draggableItem4,#draggableItem5,#draggableItem6,#draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#droppableItem6"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {				/*	$(this).animate({width:'-=10px',height:'-=10px'},10); */					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );			    scope.dropped.push($(this).attr('id'));				p6=$(ui.draggable[0]).attr('id');				//checkCorrect(); 			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable6"});			 }          });		   $( "#droppableItem7" ).droppable({			 accept: "#draggableItem1,#draggableItem2,#draggableItem3,#draggableItem4,#draggableItem5,#draggableItem6,#draggableItem7",			 drop: function( event, ui ) {			  $(ui.draggable[0]).draggable({revert: "invalid", cursor: "move", snap: "#droppableItem7"});			  console.log($(ui.draggable[0]).attr('id') + " " + $(this).attr('id'));			  // center			  var $this = $(this);			  ui.draggable.position({				  my: "center",				  at: "center",				  of: $this,				  using: function(pos) {				/*	$(this).animate({width:'-=10px',height:'-=10px'},10);  */					$(this).animate(pos, 100, "linear");				  }			  });			  $( this )				.addClass( "dropped" )				.find( "p" );				 scope.dropped.push($(this).attr('id'));				 p7=$(ui.draggable[0]).attr('id');  				// checkCorrect();			 },			 over: function(event, ui) {				// console.log(ui.draggableItem[0]);				// $(ui.draggableItem[0]).draggableItem({revert: "invalid", containment: "#droppable7"});			 }          });       } 	function testSubmit(arg) {		/* console.log("droppableItems = " + scope.droppableItems.length);		  for (var z = 0; z < scope.droppableItems.length; z++) {			  console.log("dropped = " + scope.dropped[z]);			  } */			 var tempLoc = true;			 for (var y = 0; y < scope.droppableItems.length; y++) {				  if(scope.dropped[y] == "undefined" || scope.dropped[y] == null) {					  tempLoc=false;					  $(".warningMsg").removeClass("hide").addClass("show");				  }				 }			 if(tempLoc) {				 $(".warningMsg").removeClass("show").addClass("hide");			 }			 return tempLoc; 	}	/* Select a specific validation function based on the drag&drop type -> argg ) */	function checkCorrect() {		var tempReturn = false;		switch(scope.argg) {			case '':			  tempReturn = checkCorrectSpace();			break;			case 'a' :				tempReturn = checkCorrectSort(5);			break;			case 'b' :				tempReturn = checkCorrectSort(4);			break;			case 'c' :			break;			case 'd' :				tempReturn = checkCorrectD();			break;			case 'e' :				tempReturn = checkCorrectE();			break;			case 'f' :				tempReturn = checkCorrectF();			break;			case 'g' :				tempReturn = checkCorrectG();			break;			case 'h' :				tempReturn = checkCorrectH();			break;			case 'i' :				tempReturn = checkCorrectI();			break;			case 'j' :				tempReturn = checkCorrectJ();			break;			case 'k' :				tempReturn = checkCorrectK();			break;			case 'l' :				tempReturn = checkCorrectL();			break;			case 'm' :				tempReturn = checkCorrectM();			break;		}		return tempReturn;	  }/****************************************************************/	  	  /*  Validation functions for specific case of drag & drop */	  /*  They have to be modified on case by case base */	  /* first d&drop */	  function checkCorrectSpace() {		  // placement sequence - first drag&drop		if(scope.argg =='') {		  // placement sequence		  if(p1=="draggableItem1" && p2=="draggableItem2" && p3=="draggableItem3" && p4=="draggableItem4" && p5=="draggableItem5" && p6=="draggableItem6")          {		  	return true;		  }		  else {		  	return false;		  }		}	  }	  /* second and third d&drops */	  function checkCorrectSort(argloc) {		  console.log("o1= " + (scope.argg+"draggableItem"+oSequence[0]) + " o2= " + (scope.argg+"draggableItem"+oSequence[1]) + " o3= " + (scope.argg+"draggableItem"+oSequence[2]) + " o4= " + (scope.argg+"draggableItem"+oSequence[3]) + " o5= " + (scope.argg+"draggableItem"+oSequence[4]) + " o6= " + (scope.argg+"draggableItem"+oSequence[5]) + " o7= " + (scope.argg+"draggableItem"+oSequence[6]));		console.log("a1= " + a1 + " a2= " + a2 + " a3= " +a3 + " a4= " + a4 + " a5= " + a5 + " a6= " + a6 + " a7= " + a7); 				console.log("ARG = " + scope.argg + "argloc = " + argloc);		 // sorting sequence -> second and third drag and drop			 switch(argloc) {			 case 5 :  		  if(oSequence.length>=5) {		   if(a1==(scope.argg+"draggableItem"+oSequence[0]) && 		   	  a2==(scope.argg+"draggableItem"+oSequence[1]) && 			  a3==(scope.argg+"draggableItem"+oSequence[2]) && 			  a4==(scope.argg+"draggableItem"+oSequence[3]) && 			  a5==(scope.argg+"draggableItem"+oSequence[4])) {				return true;		   }		  }		  break;		  case 4 :		   if(oSequence.length>=4) {			console.log("four");			   if(a1==(scope.argg+"draggableItem"+oSequence[0]) && 		   	  a2==(scope.argg+"draggableItem"+oSequence[2]) && 			  a3==(scope.argg+"draggableItem"+oSequence[1]) && 			  a4==(scope.argg+"draggableItem"+oSequence[3])) {				return true;		   }		  }		  break;		 }	  } 	  /* d&drop argg: d */	  function checkCorrectD() {		  if(scope.argg=='d') {			  if(a1==(scope.argg+"draggableItem"+oSequence[0]) && 		   	  	 a2==(scope.argg+"draggableItem"+oSequence[1]) && 			  	 a3==(scope.argg+"draggableItem"+oSequence[2]) &&				 a4==(scope.argg+"draggableItem"+oSequence[3])) {				 return true;	 		      } 		   }	  }	  /* d&drop argg: e */	  function checkCorrectE() {		  if(scope.argg=='e') {			   console.log("a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 + " a5= " + a5);			   console.log("oseq 1 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[1]));			   if((a1==(scope.argg+"draggableItem"+oSequence[0])) && 		   	  	  ((a2==(scope.argg+"draggableItem"+oSequence[2])) || (a2==(scope.argg+"draggableItem"+oSequence[1])) || (a2==(scope.argg+"draggableItem"+oSequence[3])) || (a2==(scope.argg+"draggableItem"+oSequence[4]))) &&				  ((a3==(scope.argg+"draggableItem"+oSequence[2])) || (a3==(scope.argg+"draggableItem"+oSequence[1])) || (a3==(scope.argg+"draggableItem"+oSequence[3])) || (a3==(scope.argg+"draggableItem"+oSequence[4]))) &&				  ((a4==(scope.argg+"draggableItem"+oSequence[2])) || (a4==(scope.argg+"draggableItem"+oSequence[1])) || (a4==(scope.argg+"draggableItem"+oSequence[3])) || (a4==(scope.argg+"draggableItem"+oSequence[4]))) &&			      ((a5==(scope.argg+"draggableItem"+oSequence[2])) || (a5==(scope.argg+"draggableItem"+oSequence[1])) || (a5==(scope.argg+"draggableItem"+oSequence[3])) || (a5==(scope.argg+"draggableItem"+oSequence[4])))) {				  return true;			   } 		   } 	  }	  /* d&drop argg: f  Paint type */	  function checkCorrectF() {		  console.log("check correct");		  if(scope.argg=='f') {			 console.log("ARG F a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 + " a5= " + a5);			 console.log("oseq 1 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[1]));  			 if(a1==(scope.argg+"draggableItem"+oSequence[0]) && 		   	  a2==(scope.argg+"draggableItem"+oSequence[0]) && 			  a3==(scope.argg+"draggableItem"+oSequence[0]) && 			  a4==(scope.argg+"draggableItem"+oSequence[1]) && 			  a5==(scope.argg+"draggableItem"+oSequence[1]) && 			  a6==(scope.argg+"draggableItem"+oSequence[1])) {				return true;		   	  }		   }		   else				return false; 		  }	  /* d&drop argg: g */	  function checkCorrectG() {		  console.log("check correct G");		  if(scope.argg=='g') {			 console.log("ARG G a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 );			 console.log("oseq 1 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[1]));  			 if(a1==(scope.argg+"draggableItem"+oSequence[1]) && 		   	  a2==(scope.argg+"draggableItem"+oSequence[0]) && 			  a3==(scope.argg+"draggableItem"+oSequence[4]) && 			  a4==(scope.argg+"draggableItem"+oSequence[2]) &&			  a5==(scope.argg+"draggableItem"+oSequence[3])) {				return true;		   	  }		   }		   else				return false; 		   }	   /* d&drop argg: h */	   function checkCorrectH() {		  console.log("check correct H");		  if(scope.argg=='h') {			 console.log("ARG H a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 );			 console.log("oseq 0 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 1" + (scope.argg+"draggableItem"+oSequence[1]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[2])  + " oseq 3" + (scope.argg+"draggableItem"+oSequence[3]) + " oseq 4" + (scope.argg+"draggableItem"+oSequence[4]));  			 if(a1==(scope.argg+"draggableItem"+oSequence[3]) && 		   	  a2==(scope.argg+"draggableItem"+oSequence[0]) && 			  a3==(scope.argg+"draggableItem"+oSequence[1]) && 			  a4==(scope.argg+"draggableItem"+oSequence[2]) &&			  a5==(scope.argg+"draggableItem"+oSequence[4])) {				return true;		   	  }		   }		   else				return false; 		  }	  /* d&drop argg: I */	  function checkCorrectI() {		  console.log("check correct I");		  if(scope.argg=='i') {			 console.log("ARG I a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 + " a5 " + a5);			 console.log("oseq 0 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 1 " + (scope.argg+"draggableItem"+oSequence[1]) + " oseq 2 " + (scope.argg+"draggableItem"+oSequence[2])  + " oseq 3 " + (scope.argg+"draggableItem"+oSequence[3]) + " oseq 4 " + (scope.argg+"draggableItem"+oSequence[4])+ " oseq 4 " + (scope.argg+"draggableItem"+oSequence[4]));  			 if(((a1==(scope.argg+"draggableItem"+oSequence[0])) || (a1==(scope.argg+"draggableItem"+oSequence[1]))) && 		   	  	  ((a2==(scope.argg+"draggableItem"+oSequence[2])) || (a2==(scope.argg+"draggableItem"+oSequence[3])) || (a2==(scope.argg+"draggableItem"+oSequence[4]))) &&				  ((a3==(scope.argg+"draggableItem"+oSequence[2])) || (a3==(scope.argg+"draggableItem"+oSequence[3])) || (a3==(scope.argg+"draggableItem"+oSequence[4]))) &&				  ((a4==(scope.argg+"draggableItem"+oSequence[2])) || (a4==(scope.argg+"draggableItem"+oSequence[3])) || (a4==(scope.argg+"draggableItem"+oSequence[4]))) &&			      ((a5==(scope.argg+"draggableItem"+oSequence[1])) || (a5==(scope.argg+"draggableItem"+oSequence[0])))) {				  return true;			   } 		   }		   else				return false; 		  }	  /* d&drop argg: J Paint type */	  function checkCorrectJ() {		  console.log("check correct J");		  if(scope.argg=='j') {			 console.log("ARG F a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 + " a5= " + a5);			 console.log("oseq 1 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[1]));  			 if(a1==(scope.argg+"draggableItem"+oSequence[0]) && 		   	  a2==(scope.argg+"draggableItem"+oSequence[0]) && 			  a3==(scope.argg+"draggableItem"+oSequence[0]) && 			  a4==(scope.argg+"draggableItem"+oSequence[1]) && 			  a5==(scope.argg+"draggableItem"+oSequence[1]) && 			  a6==(scope.argg+"draggableItem"+oSequence[1])) {				return true;		   	  }		   }		   else				return false; 		   }	   /* d&drop argg: k */	   function checkCorrectK() {		  console.log("check correct K");		  if(scope.argg=='k') {			 console.log("ARG K a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 + " a5= " + a5);			 console.log("oseq 1 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[1]));  			 if(((a1==(scope.argg+"draggableItem"+oSequence[0])) || (a1==(scope.argg+"draggableItem"+oSequence[1]))) && 		   	  	  ((a2==(scope.argg+"draggableItem"+oSequence[2])) || (a2==(scope.argg+"draggableItem"+oSequence[3])) || (a2==(scope.argg+"draggableItem"+oSequence[4]))) &&				  ((a3==(scope.argg+"draggableItem"+oSequence[2])) || (a3==(scope.argg+"draggableItem"+oSequence[3])) || (a3==(scope.argg+"draggableItem"+oSequence[4]))) &&				  ((a4==(scope.argg+"draggableItem"+oSequence[2])) || (a4==(scope.argg+"draggableItem"+oSequence[3])) || (a4==(scope.argg+"draggableItem"+oSequence[4]))) &&			      ((a5==(scope.argg+"draggableItem"+oSequence[1])) || (a5==(scope.argg+"draggableItem"+oSequence[0])))) {				  return true;			   } 		   }		   else				return false; 		   }	   /* d&drop argg: L */	   function checkCorrectL() {		  console.log("check correct L");		  if(scope.argg=='l') {			 console.log("ARG L a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4 + " a5= " + a5);			 console.log("oseq 1 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[1]) + " oseq 3" + (scope.argg+"draggableItem"+oSequence[2]) + " oseq 4" + (scope.argg+"draggableItem"+oSequence[3]) + " oseq 5" + (scope.argg+"draggableItem"+oSequence[4])); 			 if(((a1==(scope.argg+"draggableItem"+oSequence[0])) || (a1==(scope.argg+"draggableItem"+oSequence[1])) || (a1==(scope.argg+"draggableItem"+oSequence[2])) || (a1==(scope.argg+"draggableItem"+oSequence[3]))) && 		   	    ((a2==(scope.argg+"draggableItem"+oSequence[0])) || (a2==(scope.argg+"draggableItem"+oSequence[1])) || (a2==(scope.argg+"draggableItem"+oSequence[2])) || (a2==(scope.argg+"draggableItem"+oSequence[3]))) &&				((a3==(scope.argg+"draggableItem"+oSequence[4])) || (a3==(scope.argg+"draggableItem"+oSequence[5]))) &&				((a4==(scope.argg+"draggableItem"+oSequence[0])) || (a4==(scope.argg+"draggableItem"+oSequence[1])) || (a4==(scope.argg+"draggableItem"+oSequence[2])) || (a4==(scope.argg+"draggableItem"+oSequence[3]))) &&			    ((a5==(scope.argg+"draggableItem"+oSequence[0])) || (a5==(scope.argg+"draggableItem"+oSequence[1])) || (a5==(scope.argg+"draggableItem"+oSequence[2])) || (a5==(scope.argg+"draggableItem"+oSequence[3])))  &&				((a6==(scope.argg+"draggableItem"+oSequence[4])) || (a6==(scope.argg+"draggableItem"+oSequence[5])))) {				  return true;			   } 		   }		   else				return false; 		  	  }		  /* d&drop argg: M */		  function checkCorrectM() {			  console.log("check correct M");			  if(scope.argg=='m') {				 console.log("ARG M a1= " + a1 + " a2= " + a2 + " a3= " + a3 + " a4= " + a4);				 console.log("oseq 1 = " + (scope.argg+"draggableItem"+oSequence[0]) + " oseq 2" + (scope.argg+"draggableItem"+oSequence[1]));  				 if(a1==(scope.argg+"draggableItem"+oSequence[1]) && 				  a2==(scope.argg+"draggableItem"+oSequence[1]) && 				  a3==(scope.argg+"draggableItem"+oSequence[0]) && 				  a4==(scope.argg+"draggableItem"+oSequence[0])) {					return true;				  }			   }			   else					return false; 			  }    	}    };}])
.directive('flipCard', ["$timeout", function($timeout) {    return {        restrict: 'E',        transclude: true,        require: '^page',        templateUrl: 'flipCard.html',        scope:{            extra: '@'        },        link: function (scope, element, attrs, pageCtrl) {            scope.complete = false;            if(scope.extra !== undefined){                $(scope.extra).hide();            }            scope.reveal = function(){            };            scope.conceal = function(){                element.removeClass('active');                if(scope.extra !== undefined){                    $(scope.extra).hide();                }            };            var observer = new MutationObserver(function(mutations) {                if (element.hasClass('active')) {                    if(!scope.complete){                        scope.complete = true;                        element.addClass('complete');                        pageCtrl.completePage();                    }                    $timeout(function(){                        if(scope.extra !== undefined){                            $(scope.extra).fadeIn(300);                        }                    }, 1000);                }            });            element.on("click", function(){                //element.addClass("active");				element.toggleClass("active");            });            var observerConfig = {                attributes: true,                childList: false,                characterData: false            };            observer.observe(element[0], observerConfig);            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };}])
.directive('mobileSwitch', ['$sce', 'stateService', function ($sce, stateService) {    return {        restrict: 'E',        transclude: true,        templateUrl: 'mobileSwitch.html',        scope:{},        link: function (scope, element, attrs, Ctrls) {            var _default = $sce.trustAsHtml($(element).find('.content default').html());            var _mobile = $sce.trustAsHtml($(element).find('.content mobile').html());            if(stateService.state.isMobile){                scope.link = _mobile;            } else{                scope.link = _default;            }            $(element).find('.content').remove();        }    };}])
.directive('clickComplete', function() {    return {        restrict: 'A',        require: '^page',        scope: {},        link: function (scope, element, attrs, pageCtrl) {            scope.complete = false;            scope.reveal = function(){            };            scope.conceal = function(){            };            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);            element.on("click", function(){                if(!scope.complete){                    scope.complete = true;                    element.addClass('complete');                    pageCtrl.completePage();                }            });        }    };})
.directive('inlineViewportPolyfill', function(){    return {        restrict: 'A',        link: function (scope, element, attrs){            scope.viewPortElements  = [];            scope.resizeViewPortUnits = function(){                //console.log("resize");                for(var i=0; i<scope.viewPortElements.length; i++){                    var myObj = scope.viewPortElements[i];                    if(myObj.unit === "vw"){                        $(myObj.element).css(myObj.prop, (myObj.val/100)*$(window).width()+'px');                    }else if(myObj.unit === "vh"){                        $(myObj.element).css(myObj.prop, (myObj.val/100)*$(window).height()+'px');                    }                }            };            if(Modernizr.cssvhunit === false || Modernizr.cssvwunit === false){                var styledElements = $(element).find('*[style]');                for(var i=0; i< styledElements.length; i++){                    var myStyles = styledElements[i].getAttribute("style").split(";");                    for(var j=0; j<myStyles.length;j++){                        var valuePair = myStyles[j].split(":");                        var myStyleObj = {};                        myStyleObj.element = styledElements[i];                        myStyleObj.prop = valuePair[0];                        if(valuePair[1]){                            if(valuePair[1].indexOf("vw")> -1){                                myStyleObj.val = Number(valuePair[1].substr(0, valuePair[1].indexOf("vw")));                                myStyleObj.unit = "vw";                                scope.viewPortElements.push(myStyleObj);                            }else if(valuePair[1].indexOf("vh")> -1){                                myStyleObj.val = Number(valuePair[1].substr(0, valuePair[1].indexOf("vh")));                                myStyleObj.unit = "vh";                                scope.viewPortElements.push(myStyleObj);                            }                        }                    }                }                $(window).on('resize', scope.resizeViewPortUnits);                scope.resizeViewPortUnits();            }            scope.$on("$destroy",function(){            });        }    };})
.directive('popOver',[ 'stateService','$timeout', function(stateService, $timeout) {    return {        restrict: 'E',        transclude: true,        require: '^page',        templateUrl: 'popOver.html',        scope:{},        link: function (scope, element, attrs, pageCtrl) {            scope.complete = false;            scope.showClose = true;            scope.nocomplete=false;            element.hide();            if (attrs.hasOwnProperty('close')) {                if ( attrs.close === 'false') {                  scope.showClose = false;                }            }            if (attrs.hasOwnProperty('nocomplete')) {                scope.nocomplete=true;            }            scope.reveal = function(){				$timeout(function () {          			stateService.state.lockRight = false;		  			console.log("element complete " + element.hasClass('complete'));					if(element.hasClass('complete')) {						 stateService.state.lockLeft = false;						 scope.currentPageComplete = true; 					 }					 else {						 stateService.state.lockLeft = true; 						 scope.currentPageComplete = false;					 }          			 scope.$apply();    			}, 0, false);            };            scope.conceal = function(){                element.hide();				$("#correctMsg, #incorrectMsg").removeClass("displayIt");				stateService.state.hotspotsVisited.length=0;				stateService.state.hotspotsVisited=[];            };            scope.closePopover = function(){                element.fadeOut(300);            };            var observer = new MutationObserver(function(mutations) {                if (element.is(':visible') && !scope.complete) {                    scope.complete = true;                    element.addClass('complete');					// additional feature for the hotspot					if($(element).data("item") != undefined) {						stateService.state.hotspotsVisited.push($(element).data("item"));						if(stateService.state.hotspotsVisited.length==4) {							console.log(stateService.state.hotspotsVisited);							if(stateService.state.hotspotsVisited[0]=="4" &&							stateService.state.hotspotsVisited[1]=="1" &&							stateService.state.hotspotsVisited[2]=="3" &&							stateService.state.hotspotsVisited[3]=="2") {								$("#correctMsg").addClass("complete").css("display","block");							}							else {								$("#incorrectMsg").addClass("complete").css("display","block");							}						}					}					if(!scope.nocomplete){                        pageCtrl.completePage();                    }                }            });            var observerConfig = {                attributes: true,                childList: false,                characterData: false            };            observer.observe(element[0], observerConfig);            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };}])
.directive('popOverTrigger', ["$timeout", function($timeout) {    return {        restrict: 'A',        require: '^page',        scope:{          popOverTrigger: '@'        },        link: function (scope, element, attrs, pageCtrl) {            element[0].addEventListener('click', function () {                $('pop-over').fadeOut(300);                $(scope.popOverTrigger).fadeIn(300);				//console.log("id = " + $(element).attr("class"));                element.addClass('complete');            });            scope.reveal = function(){            };            scope.conceal = function(){            };            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };}])
.directive('clickReveal', ["$timeout", function($timeout) {    return {        restrict: 'A',        require: '^page',        scope:{          clickReveal: '@'        },        link: function (scope, element, attrs, pageCtrl) {          scope.complete = false;            $(scope.clickReveal).hide();          element[0].addEventListener('click', function () {            if(!scope.complete) {              $(scope.clickReveal).fadeIn(300);              element.addClass('complete');              pageCtrl.completePage();            }          });            scope.reveal = function(){            };            scope.conceal = function(){            };            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };}])
.directive('direction', ['stateService', '$timeout', function (stateService, $timeout) {    return {        restrict: 'E',        transclude: true,        require: '^page',        templateUrl: 'direction.html',        scope:{},        link: function (scope, element, attrs, pageCtrl) {            scope.complete = false;            scope.reveal = function(){				$timeout(function () {					 var temp = element.find(">:first-child");					// console.log(temp);					 if(temp.hasClass('active')) {						stateService.state.lockLeft = false;						scope.currentPageComplete = true; 					 }					 else {						stateService.state.lockLeft = true; 						scope.currentPageComplete = false;					}					scope.$apply();				}, 0, false);            };            scope.conceal = function(){            };            scope.completionChange = function(){              if(attrs.hasOwnProperty('watch')){                  var watchElements = attrs.watch.split(',');                  var watchComplete = true;                  for(var i=0; i<watchElements.length; i++){                    var myElement = watchElements[i];                    if($(myElement).hasClass('complete')){                    } else{                      watchComplete = false;                      break;                    }                  }                  if(watchComplete){                     element.find('.icon-holder').addClass('active');                  }              }            };            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);            pageCtrl.getCompletionChangeSignal().add(scope.completionChange, scope, 2);            scope.completionChange();        }    };}])
.directive('quizTopics', ['$sce', 'lmsService', 'stateService', 'settingsService', 'chapterService', '$timeout', '$rootScope', function ($sce, lmsService, stateService, settingsService, chapterService, $timeout, $rootScope) {  return {    restrict: 'E',    transclude: true,    require: ['?^page'],    templateUrl: 'quizTopics.html',    scope: {      lms: '@',  		// passing lms parameter, one way binding      question: '@',  	// passing question parameter      distractor: '@', 	// passing distractor parameter      pass: '@',   		// passing pass parameter      buttons: '@', 	// passing buttons parameter	  pool: '@' 		// passing pool parameter    },    link: function (scope, element, attrs, Ctrls) {      scope.slides = [];      scope.slide1 = {};      scope.slide2 = {};      scope.active = "slide1";      scope.position = 0;      scope.summaryObj = {};      scope.finalFeedback = "";      scope.score = 0;       // topic score -> local	  scope.scores = [];     // array of scores to be evaluated for the overal score	  scope.passes = [];     // array of passes per topic	  scope.noscore = [];	  scope.totalScore = 0;  // overal score	  scope.showFinal = false;   // if 1 show final results      scope.quizFail = false;      scope.quizComplete = false;      scope.alwaysComplete = true; // question is always complete, despite incorrect anwser      scope.hideNext = false;      scope.highlight = false;	  scope.TopicNr = 0;          // position of the current topic	  scope.NrOfNoScoreTopic = 0; // nr of no score topics	  scope.NrOfQuestions = 0;	  scope.currentQuestion = 1;	  scope.currentTitle = [];	  scope.currentTitle[0]="Creditor Insurance";      scope.currentTitle[1]="";	  scope.currentTitle[2]="";	  scope.totalQuiz1Pass = settingsService.settings.totalQuiz1Pass;	  scope.totalQuiz2Pass = settingsService.settings.totalQuiz2Pass;	  scope.branch = stateService.state.branch;	  scope.forceSpecificSequence = settingsService.settings.forceSpecificSequence;	  scope.forceSequence = settingsService.settings.forceSequence;	  scope.notSubmitted =false;      var pageCtrl = Ctrls[0];      var pretestCtrl = Ctrls[1];	  // added	  scope.poolActive = 0;	  scope.optional = 0;  // affirmation added	  if(typeof attrs.pool === "undefined"){         scope.poolActive = 0;      }      ////////////////////Parse Quiz///////////////////////	   if ("pool" in attrs && "id" in attrs) {		  if(attrs.id=="quiz1") {		  	scope.poolActive =  parseInt(attrs.pool);		  	//console.log("poolActive1 = " + scope.poolActive);		  }	  }	  else {		  scope.poolActive = 0;	  }	 // randomize questions based on pool size if quiz1	    var questions;		if( attrs.id=="quiz1") {		  //Determine nr of questions	  	 stateService.state.nrOfTopics++;			 //console.log("Nr of questions = " + stateService.state.nrOfTopics); 		 // start alghorithm		 var questionsAll = $(element).find('.content question');		 if(scope.poolActive < questionsAll.length) {			questions = questionsAll.slice(0);		 	var i = questionsAll.length, minLoc = i - scope.poolActive, temp, index;			while (i-- > minLoc) {				index = Math.floor((i + 1) * Math.random());				temp = questions[index];				questions[index] = questions[i];				questions[i] = temp;			}		   	questions = questions.slice(minLoc);		 }		 else {			  questions = questionsAll;		 }		}		else {			questions = $(element).find('.content question');		} 		//console.log("QUIZ " + questions.length); 	 // ****************************************************	  	scope.NrOfQuestions = stateService.state.nrOfQuestions;	//	scope.NrOfQuestions = settingsService.settings.quiz1NrOfQuestions;	  	// console.log("total nr of questions = " + scope.NrOfQuestions + " " + scope.currentQuestion);		// console.log("see it"); 		stateService.state.tilesVisited.sort();		// console.log(stateService.state.tilesVisited);      for (var k = 0; k < questions.length; k++) {        var question = {};        question.type = "question";        question.instructions = $sce.trustAsHtml($(questions[k]).find('instructions').html());        question.stem = $sce.trustAsHtml($(questions[k]).find('stem').html());        question.description = $(questions[k]).find('stem').html();        question.distractors = [];        var myDistractors = $(questions[k]).find('distractor');        var numCorrect = 0;        for (var l = 0; l < myDistractors.length; l++) {          var myDistractor = {};          myDistractor.text = $(myDistractors[l]).html();          myDistractor.correct = myDistractors[l].hasAttribute("correct");          if (myDistractor.correct) {            numCorrect++;          }          myDistractor.selected = false;          question.distractors.push(myDistractor);        }        question.multi = (numCorrect > 1);        question.correct = $sce.trustAsHtml($(questions[k]).find('feedback>correct').html());        question.incorrect = $sce.trustAsHtml($(questions[k]).find('feedback>incorrect').html());        question.showFeedback = false;        question.questionCorrect = false;		question.TopicNr = 1;        scope.slides.push(question);      }      if (questions.length === 1) {        $(element).find('.question-count').hide();      }      //Summary      scope.summaryObj.pass = element.find('summary>pass').html();      scope.summaryObj.fail = element.find('summary>fail').html();      element.find('.content').html("");      scope.question = scope.question.toLowerCase();      scope.lms = scope.lms.toLowerCase();      if ("summary" in attrs) {        scope.showSummary = (attrs.summary.toLowerCase()!=='false');      } else {        scope.showSummary = true;      }      scope.distractor = scope.distractor.toLowerCase();      var buttonVars = scope.buttons.toLowerCase();      if (buttonVars.indexOf('next') > -1) {        scope.nextbtn = true;      } else {        scope.nextbtn = false;      }      if (buttonVars.indexOf('retry') > -1) {        	scope.retrybtn = true;      } else {        	scope.retrybtn = false;      }      if (buttonVars.indexOf('close') > -1) {        scope.closebtn = true;      } else {        scope.closebtn = false;      }      var passVars = scope.pass.split(' ');      if (passVars.length > 1) {        for (var p = 0; p < passVars.length; p++) {          var myPassVar = passVars[p];          if (myPassVar.indexOf('always') > -1) {            scope.alwaysComplete = true;          } else {            scope.passScore = parseInt(myPassVar);          }        }      } else {        scope.passScore = parseInt(scope.pass);      }      if (scope.distractor.indexOf('highlight') != -1) {        scope.highlight = true;      }      stateService.state.lockLeft = true;      /////////////////////////////////////////////////////////////////////////////////////////      scope.shuffle = function (o) {        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) ;        return o;      };      scope.reveal = function () {		console.log("reveal"); 		stateService.state.QuestionNumber++;	    scope.TopicNr = stateService.state.QuestionNumber;//		console.log("QUESTION NR = " + scope.TopicNr);		if (scope.lms.indexOf('affirmation') != -1) {			scope.optional = 1;		}        $timeout(function () {          stateService.state.lockRight = true;          stateService.state.lockLeft = true;		  $('.bar').find('a.skip-main').css("display","none");          scope.$apply();        }, 0, false);        scope.reset();      };      scope.conceal = function () {      };      scope.distractorSelected = function (distractor, event) {		console.log("distractor selected");		var testIt = $(event.target);		if($(event.target).attr("aria-checked")=='false') {			testIt.find("#dot").attr("aria-checked","true");			testIt.find("#check").attr("aria-checked","true");			// reset all to false then set one to true if radio button			if(!scope[scope.active].multi) { $(".distractor").attr("aria-checked","false"); }			$(event.target).attr("aria-checked","true");		}		else if($(event.target).attr("aria-checked")=='true') {			testIt.find("#dot").attr("aria-checked","false");			testIt.find("#check").attr("aria-checked","false");			if(!scope[scope.active].multi) { $(".distractor").attr("aria-checked","false"); }			$(event.target).attr("aria-checked","false");		}		//console.log(event.target.querySelector("cirle").getAttribute("aria-label")); 		scope.notSubmitted=false;        if (!scope[scope.active].showFeedback) {          distractor.selected = !distractor.selected;          if (scope[scope.active].multi) {          } else {            for (var i = 0; i < scope[scope.active].distractors.length; i++) {              var myDistractor = scope[scope.active].distractors[i];              if (myDistractor !== distractor) {                myDistractor.selected = false;              }            }          }        }      };      scope.submitAnswer = function () {        var answerSubmitted = false;        var correct = true;        var correctAnswer = [];        var submitAnswers = [];		/* setTimeout(function() {		 $(".next").focus();}, 500); */        for (var i = 0; i < scope[scope.active].distractors.length; i++) {          var myDistractor = scope[scope.active].distractors[i];          if (myDistractor.selected) {            answerSubmitted = true;            submitAnswers.push(i);          }          if (myDistractor.correct)            correctAnswer.push(i);          if (myDistractor.correct !== myDistractor.selected) {            correct = false;          }        }        if (answerSubmitted) {          scope[scope.active].questionCorrect = correct;          scope[scope.active].showFeedback = true;		  scope.notSubmitted = false;        }		else {			scope.notSubmitted = true;			console.log("question not submitted");		}        if (scope.lms.indexOf('interactions') > -1) {          lmsService.interactions(scope.position, correct, scope[scope.active].description, 'choice', correctAnswer, submitAnswers);        }        if (scope.position === scope.slides.length - 1){          if(!scope.showSummary) {            scope.hideNext = true;          }          var myScore = 0;          for (var n = 0; n < scope.slides.length; n++) {            var myQuestion = scope.slides[n];            if (myQuestion.questionCorrect) {              myScore++;            }          }          scope.score = Math.round((myScore / scope.slides.length) * 100);		  // remove optional topic from the overall nr of questions		  if (scope.lms.indexOf('noscore') != -1) {				stateService.state.nrOfTopics = stateService.state.nrOfTopics-1;				scope.NrOfNoScoreTopic=scope.NrOfNoScoreTopic+1;		  }		  // only add to the total score if topic is mandatory		  if(scope.lms.indexOf('score') > -1 && scope.lms.indexOf('affirmation') == -1 && scope.lms.indexOf('noscore') == -1 ) {			    //console.log("nr of no score = " + scope.NrOfNoScoreTopic);				stateService.state.scores[scope.TopicNr-1] = scope.score;				stateService.state.noscore[scope.TopicNr-1] = -1;		  }		  else if(scope.lms.indexOf('noscore') > -1 ) {			    stateService.state.noscore[scope.TopicNr-1] = scope.score;		  }		  //console.log("optional = " + stateService.state.scores);		  //console.log("check = "  + stateService.state.nrOfTopics);		  // CALCULATE TOTAL SCORE		  if((stateService.state.scores.length) == stateService.state.nrOfTopics) {				for(var j =0; j< stateService.state.scores.length; j++) {					scope.totalScore = scope.totalScore + stateService.state.scores[j];				}				scope.totalScore = scope.totalScore / stateService.state.scores.length;				scope.totalScore = Math.round(scope.totalScore);		  }		  scope.scores = stateService.state.scores;		  scope.passes = stateService.state.passStatus;		  scope.noscore = stateService.state.noscore;		 // console.log("total score = " + scope.totalScore);		 // console.log("check = " + scope.TopicNr + " = " + stateService.state.nrOfTopics);		  console.log("check = " +stateService.state.scores.length + " " + stateService.state.nrOfTopics); 		  // if nr of all mandatory topics equals overall nr of topics		  if (stateService.state.scores.length == stateService.state.nrOfTopics) {			  // show final REPORT              scope.showFinal = true;			  $(".focusReport").focus();			  // set LMS complete for branch -> single topics 3 questions			  // console.log("branch = " + scope.branch + " tscore = " + scope.totalScore + " 1a = " + scope.totalQuiz1Pass + " 2a = " + scope.totalQuiz2Pass);			  if((scope.branch==0 || scope.branch==2) && scope.totalScore >= scope.totalQuiz1Pass) {				//console.log("lms complete 0" + scope.branch);				if (pageCtrl !== null) {				  	element.addClass('complete');					scope.quizComplete = true;					stateService.state.quizComplete = true;					lmsService.score(scope.totalScore);					lmsService.complete(true);				    pageCtrl.completePage();					scope.quizFail=false;				}			  }			  else			  // set LMS complete for branch 1  multiple topics -> 8 questions			  if((scope.branch==1 || scope.branch==3) && scope.totalScore >= scope.totalQuiz2Pass) {				  //console.log("lms complete 1" + scope.branch);				  if (pageCtrl !== null) {				  	element.addClass('complete');					scope.quizComplete = true;					stateService.state.quizComplete = true;					lmsService.score(scope.totalScore);					lmsService.complete(true);				    pageCtrl.completePage();					scope.quizFail=false;				  }			  }			  else {				  // LMS incomplete				 // console.log("lms complete 1" + scope.branch);				  scope.quizFail = true;				  scope.quizComplete = false;				  stateService.state.quizComplete = false;				  lmsService.score(scope.totalScore);				  lmsService.complete(false);			  }		  }		  if (scope.score >= scope.passScore) {			    stateService.state.passStatus[scope.TopicNr-1] = "passed";  // save current topic pass status				scope.finalFeedback = $sce.trustAsHtml(scope.summaryObj.pass);				console.log("Passed + SCORE");				if (pageCtrl !== null) {  		          element.addClass('complete');				  pageCtrl.completePage();				}				lmsService.score(scope.totalScore);				stateService.state.lockLeft = true;		   } else { 			    stateService.state.passStatus[scope.TopicNr-1] = "failed";   // save current topic pass status				scope.finalFeedback = $sce.trustAsHtml(scope.summaryObj.fail);			//	scope.quizFail = true;			//	if (scope.alwaysComplete) {					element.addClass('complete');					pageCtrl.completePage();		  }		  // set complete if final report is part of the affirmation.          if (scope.lms.indexOf('affirmation') != -1) {            lmsService.complete(true);            if (pageCtrl !== null) {              pageCtrl.completePage();            }            $(".final-score").hide();			$(".final-score-affirmation").show();			scope.quizComplete = true;			stateService.state.quizComplete = true;          }        }		/* setTimeout(function() {		$(".next").blur();}, 60); */		 console.log("scope.quizFail = " + scope.quizFail);      };      scope.nextSelected = function () { 	    //console.log("scope length = " + (scope.slides.length - 1) + " nrofTopics =  " + stateService.state.nrOfTopics + " nr = " + (scope.TopicNr-scope.NrOfNoScoreTopic));		//console.log("nr of no score = " + scope.NrOfNoScoreTopic); 	    // go to either to topic slide type or to affirmation slide type		console.log("0000 NEXT Selected");        if (scope.active === "slide1" && (scope.lms.indexOf('affirmation') != -1)) {          scope.active = "slide2"; // slide2        } else {          scope.active = "slide1";        }		stateService.state.nrOfTopics=settingsService.settings.nrOfTopics; // set it manually here - it is only for the keyboard accessiblity		//console.log("summary " + scope.position + " " + (scope.slides.length - 1) + " " + stateService.state.nrOfTopics + " " + (scope.TopicNr-scope.NrOfNoScoreTopic));		if (scope.position < scope.slides.length - 1) {          scope.position++;          scope.setSlide();        } 		else		if (scope.position == scope.slides.length - 1 && (stateService.state.nrOfTopics==(scope.TopicNr-scope.NrOfNoScoreTopic))) {		  //console.log("summary " + scope.position + " " + stateService.state.nrOfTopics);		  $(".quizHeader").hide();          var mySummary = {};          mySummary.type = "summary";          scope[scope.active] = mySummary;		  stateService.state.lockLeft = true;  // show right hand side arrow.        /*  if (scope.lms.indexOf('affirmation') != -1) {            window.open(settingsService.settings.mtmSurvey, 'targetWindow', 'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes,resizable=yes, width=800, height=600');          } */        }		else {			scope.nextPage();		}        if (scope.active === "slide1") {          TweenMax.set(element.find('.slide1'), {left: "100%"});          TweenMax.set(element.find('.slide2'), {left: "0%"});          TweenMax.to(element.find('.slide1'), 0.3, {left: "0%", ease: Linear.easeNone});          TweenMax.to(element.find('.slide2'), 0.3, {left: "-100%", ease: Linear.easeNone});        } else {          TweenMax.set(element.find('.slide1'), {left: "0%"});          TweenMax.set(element.find('.slide2'), {left: "100%"});          TweenMax.to(element.find('.slide1'), 0.3, {left: "-100%", ease: Linear.easeNone});          TweenMax.to(element.find('.slide2'), 0.3, {left: "0%", ease: Linear.easeNone});        }      };      scope.retry = function () {        scope.reset();      };      scope.nextPage = function () {        stateService.state.lockLeft = false; // original: false        if (pageCtrl !== null) {			console.log("advance");          pageCtrl.autoAdvance();        }      };      scope.closeQuiz = function () {        scope.settings.showPreTest = false;      };      scope.reset = function () {		console.log(scope.totalQuiz1Pass);        console.log("reset");        scope.position = 0;		scope.active = "slide1";        scope.score = 0;        scope.quizFail = false;        scope.quizComplete = false;		stateService.state.quizComplete = false;        scope.hideNext = false;        if (scope.question === "random") {          scope.slides = scope.shuffle(scope.slides);        }        for (var i = 0; i < scope.slides.length; i++) {          for (var j = 0; j < scope.slides[i].distractors.length; j++) {            scope.slides[i].distractors[j].selected = false;          }        }        scope.setSlide();		TweenMax.set(element.find('.slide1'), {left: "0%"});		TweenMax.set(element.find('.slide2'), {left: "100%"});        $timeout(function () {          scope.$apply();        });      };      scope.setSlide = function () {		  stateService.state.currentQuestion = stateService.state.currentQuestion+1;		  scope.currentQuestion = stateService.state.currentQuestion; 		  scope.NrOfQuestions = stateService.state.nrOfQuestions;		  console.log("set slide "); 			scope[scope.active] = scope.slides[scope.position];			console.log("scope active = " + scope[scope.active].type);			if (scope[scope.active].type === "question") {			  scope[scope.active].showFeedback = false;			  scope[scope.active].questionCorrect = false;	         // console.log(scope[scope.active]);			  if (scope.distractor.indexOf('random') != -1) {				scope[scope.active].distractors = scope.shuffle(scope[scope.active].distractors);			  }			}			setTimeout(function() {				//if(scope.showFinal) { console.log("quizComplete");  $(".focusReport").focus(); } 				$(".focusThere").focus();			},500);        };	  // go to the specific topics based on the topic failed in the quiz	  // or opent pdf document for accessible course take.	  scope.goToSpecificTopic = function(index) { 		 // stateService.state.currentChapter = index;		  //console.log("before = " + stateService.state.tilesVisited);		  //console.log(chapterService.chapters);		  $('.bar').find('a.skip-main').css("display","block");		  // reset quiz part		  var url="";		  stateService.state.QuestionNumber="";		  stateService.state.nrOfTopics="";		  stateService.state.currentQuestion=0;		  stateService.state.scores=[];		  stateService.state.noscore= [];		  stateService.state.passStatus = [];		  // pdf document was selected		  if(stateService.state.accessible == true) {			  console.log("accessible " + stateService.state.branch);			  switch(stateService.state.branch) {				  case 0:				 	 window.open(settingsService.settings.accessPath1, '_blank');					 stateService.state.currentChapter = 7;				  break;				  case 1:				     window.open(settingsService.settings.accessPath2, '_blank');					 stateService.state.currentChapter = 7;				  break;				  case 2:				  	 window.open(settingsService.settings.accessPath3, '_blank');					 stateService.state.currentChapter = 7;				  				  break;				  case 3:				  	 window.open(settingsService.settings.accessPath4, '_blank');					 stateService.state.currentChapter = 7;				  				  break;			  }			  url = "#/";			  document.location = url;			  stateService.state.showMenu = false;			  stateService.state.lockRight = true;  		  }		  else {			  // one chapter and assignment			  console.log("before going " + chapterService.chapters.length);			  if(chapterService.chapters.length==2) {					document.location = "#/4";				    stateService.state.currentChapter = 0;					stateService.state.showMenu = false;					stateService.state.lockRight = false;			}			else			// multiple chapters			if(chapterService.chapters.length>2) {				console.log("select link");				for(i=0; i<chapterService.chapters.length; i++) {				 // console.log("index = " + index + " " + chapterService.chapters[i].title + " " + chapterService.chapters[i].link);					if(chapterService.chapters[i].completion.length>0) {					//  if(i==index) {							url = chapterService.chapters[index-1].link;							stateService.state.currentChapter = index-1;					//  }					}				}			 // console.log("before url = " + url);				if(url=="") {					url = chapterService.chapters[1].link;					stateService.state.currentChapter = 1;				}			 // console.log("location = " + url); 					document.location = url;					stateService.state.showMenu = false;					stateService.state.lockRight = false;			} 		  }	  };       if (pageCtrl !== null) {        pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);        pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);      }    }  };}])
.directive('quizGame', ['$sce', 'lmsService', 'stateService', '$timeout', function ($sce, lmsService, stateService, $timeout) {    return {        restrict: 'E',        transclude: true,        require: ['?^page', '?^preTest'],        templateUrl: 'quizGame.html',        scope: {            lms: '@',            question: '@',            distractor: '@',            pass: '@',            buttons: '@'        },        link: function (scope, element, attrs, Ctrls) {            scope.slides = [];            scope.slide1 = {};            scope.slide2 = {};            scope.active = "slide1";            scope.position = 0;            scope.summary = {};            scope.finalFeedback = "";            scope.score = 0;            scope.quizFail = false;            scope.quizComplete = false;          scope.alwaysComplete = false;            var pageCtrl = Ctrls[0];            ////////////////////Parse Quiz///////////////////////            //Questions            var questions = $(element).find('.content question');            for (var k = 0; k < questions.length; k++) {                var question = {};                question.type = "question";                question.instructions = $sce.trustAsHtml($(questions[k]).find('instructions').html());                question.stem = $sce.trustAsHtml($(questions[k]).find('stem').html());                question.distractors = [];                var myDistractors = $(questions[k]).find('distractor');                var numCorrect = 0;                for (var l = 0; l < myDistractors.length; l++) {                    var myDistractor = {};                    myDistractor.text = $(myDistractors[l]).html();                    myDistractor.correct = myDistractors[l].hasAttribute("correct");                    if (myDistractor.correct) {                        numCorrect++;                    }                    myDistractor.selected = false;                    question.distractors.push(myDistractor);                }                question.multi = (numCorrect > 1);                question.correct = $sce.trustAsHtml($(questions[k]).find('feedback>correct').html());                question.incorrect = $sce.trustAsHtml($(questions[k]).find('feedback>incorrect').html());                question.showFeedback = false;                question.questionCorrect = false;                scope.slides.push(question);            }            //Summary            scope.summary.pass = element.find('summary>pass').html();            scope.summary.fail = element.find('summary>fail').html();            element.find('.content').html("");            scope.question = scope.question.toLowerCase();            scope.lms = scope.lms.toLowerCase();            scope.distractor = scope.distractor.toLowerCase();            var buttonVars = scope.buttons.toLowerCase();            if (buttonVars.indexOf('next') > -1) {                scope.nextbtn = true;            } else {                scope.nextbtn = false;            }            if (buttonVars.indexOf('retry') > -1) {                scope.retrybtn = true;            } else {                scope.retrybtn = false;            }            if (buttonVars.indexOf('close') > -1) {                scope.closebtn = true;            } else {                scope.closebtn = false;            }          var passVars = scope.pass.split(' ');          if (passVars.length > 1) {            for (var p = 0; p < passVars.length; p++) {              var myPassVar = passVars[p];              if (myPassVar.indexOf('always') > -1) {                scope.alwaysComplete = true;              } else {                scope.passScore = parseInt(myPassVar);              }            }          } else {            scope.passScore = parseInt(scope.pass);          }            stateService.state.lockLeft = true;            /////////////////////////////////////////////////////////////////////////////////////////            scope.shuffle = function (o) {                for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);                return o;            };            scope.reveal = function () {                $timeout(function () {                    stateService.state.lockRight = false;                    stateService.state.lockLeft = true;                    scope.$apply();                }, 0, false);                scope.reset();            };            scope.conceal = function () {            };            scope.distractorSelected = function (distractor, event) {                if (!scope[scope.active].showFeedback) {                    distractor.selected = !distractor.selected;                    if (scope[scope.active].multi) {                    } else {                        for (var i = 0; i < scope[scope.active].distractors.length; i++) {                            var myDistractor = scope[scope.active].distractors[i];                            if (myDistractor !== distractor) {                                myDistractor.selected = false;                            }                        }                    }					scope.submitAnswer();                }            };            scope.submitAnswer = function () {                var answerSubmitted = false;                var correct = true;                for (var i = 0; i < scope[scope.active].distractors.length; i++) {                    var myDistractor = scope[scope.active].distractors[i];                    if (myDistractor.selected) {                        answerSubmitted = true;                    }                    if (myDistractor.correct !== myDistractor.selected) {                        correct = false;                    }                }                if (answerSubmitted) {                    if(correct) {                      $(element).find('.imageCell').append('<img src="images/redFlagGuy.png"/>');                    }					              scope[scope.active].questionCorrect = correct;                        scope[scope.active].showFeedback = true;                }            };            scope.nextSelected = function () {                if (scope.position < scope.slides.length - 1) {                    scope.position++;                    if (scope.active === "slide1") {                        scope.active = "slide2";                    } else {                        scope.active = "slide1";                    }                    scope.setSlide();                    if (scope.active === "slide1") {                        TweenMax.set(element.find('.slide1'), {left: "100%"});                        TweenMax.set(element.find('.slide2'), {left: "0%"});                        TweenMax.to(element.find('.slide1'), 0.3, {left: "0%", ease: Linear.easeNone});                        TweenMax.to(element.find('.slide2'), 0.3, {left: "-100%", ease: Linear.easeNone});                    } else {                        TweenMax.set(element.find('.slide1'), {left: "0%"});                        TweenMax.set(element.find('.slide2'), {left: "100%"});                        TweenMax.to(element.find('.slide1'), 0.3, {left: "-100%", ease: Linear.easeNone});                        TweenMax.to(element.find('.slide2'), 0.3, {left: "0%", ease: Linear.easeNone});                    }                } else {                    var mySummary = {};                    mySummary.type = "summary";                    scope[scope.active] = mySummary;                    var myScore = 0;                    for (var i = 0; i < scope.slides.length; i++) {                        var myQuestion = scope.slides[i];                        if (myQuestion.questionCorrect) {                            myScore++;                        }                    }                    scope.score = Math.ceil((myScore / scope.slides.length) * 100);                    if (scope.lms.indexOf('score') > -1) {                        lmsService.score(scope.score);                    }                    if (scope.score >= scope.passScore) {                        scope.finalFeedback = $sce.trustAsHtml(scope.summary.pass);                        scope.quizFail = false;                        if (pageCtrl !== null) {                            element.addClass('complete');                            pageCtrl.completePage();                        }                        stateService.state.lockLeft = true;                    } else {                        scope.finalFeedback = $sce.trustAsHtml(scope.summary.fail);                        scope.quizFail = true;                        if (scope.alwaysComplete) {                            element.addClass('complete');                            pageCtrl.completePage();                        }                    }                    if(scope.lms.indexOf('affirmation')!==-1)                    {                        //lmsService.complete(true);                        $(".final-score").hide();                    }                    scope.quizComplete = true;                }            };            scope.retry = function () {                scope.reset();            };            scope.nextPage = function () {                stateService.state.lockLeft = false;                if (pageCtrl !== null) {                    pageCtrl.autoAdvance();                }            };            scope.closeQuiz = function () {                scope.settings.showPreTest = false;            };            scope.reset = function () {                scope.position = 0;                scope.active = "slide1";                scope.score = 0;                scope.quizFail = false;                scope.quizComplete = false;				$(element).find('.imageCell').html('');                if (scope.question === "random") {                    scope.slides = scope.shuffle(scope.slides);                }                for(var i=0; i<scope.slides.length; i++){                    for(var j=0; j<scope.slides[i].distractors.length; j++){                        scope.slides[i].distractors[j].selected = false;                    }                }                scope.setSlide();                TweenMax.set(element.find('.slide1'), {left: "0%"});                TweenMax.set(element.find('.slide2'), {left: "100%"});                $timeout(function () {                    scope.$apply();                });            };            scope.setSlide = function () {                console.log("setSlide");                scope[scope.active] = scope.slides[scope.position];                if (scope[scope.active].type === "question") {                    scope[scope.active].showFeedback = false;                    scope[scope.active].questionCorrect = false;                    if (scope.distractor === "random") {                        scope[scope.active].distractors = scope.shuffle(scope[scope.active].distractors);                    }                }            };            if (pageCtrl !== null) {                pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);                pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);            }        }    };}])
.directive('knowledgeCheck', ['$sce', 'lmsService', 'stateService', '$timeout', function ($sce, lmsService, stateService, $timeout) {  return {    restrict: 'E',    transclude: true,    require: ['?^page'],    templateUrl: 'knowledgeCheck.html',    scope: {      distractor: '@',    },    link: function (scope, element, attrs, Ctrls) {      scope.slide1 = {};      scope.finalFeedback = "";      scope.quizFail = false;      scope.quizComplete = false;      scope.highlight = false;      var pageCtrl = Ctrls[0];      ////////////////////Parse Quiz///////////////////////      //Questions      var content = $(element).find('.content');      var question = {};      question.instructions = $sce.trustAsHtml($(content[0]).find('instructions').html());      question.stem = $sce.trustAsHtml($(content[0]).find('stem').html());      question.distractors = [];      var myDistractors = $(content[0]).find('distractor');      var numCorrect = 0;      for (var l = 0; l < myDistractors.length; l++) {        var myDistractor = {};        myDistractor.text = $(myDistractors[l]).html();        myDistractor.correct = myDistractors[l].hasAttribute("correct");        if (myDistractor.correct) {          numCorrect++;        }        myDistractor.selected = false;        question.distractors.push(myDistractor);      }      question.multi = (numCorrect > 1);      question.correct = $sce.trustAsHtml($(content[0]).find('feedback>correct').html());      question.incorrect = $sce.trustAsHtml($(content[0]).find('feedback>incorrect').html());      question.showFeedback = false;      question.questionCorrect = false;      scope.slide1 = question;      if (scope.distractor.indexOf('highlight') != -1) {        scope.highlight = true;      }      element.find('.content').html("");      //parse attributes      scope.distractor = scope.distractor.toLowerCase();      stateService.state.lockLeft = true;      /////////////////////////////////////////////////////////////////////////////////////////      scope.shuffle = function (o) {        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);        return o;      };      scope.reveal = function () {        $timeout(function () {          stateService.state.lockRight = false;		  console.log("element complete " + element.hasClass('complete'));		  if(element.hasClass('complete')) {			 stateService.state.lockLeft = false;			 scope.currentPageComplete = true; 		  }		  else {			 stateService.state.lockLeft = true; 			 scope.currentPageComplete = false;		  }          scope.$apply();        }, 0, false);        scope.reset();      };      scope.conceal = function () {      };      scope.distractorSelected = function (distractor, event) {        if (!scope.slide1.showFeedback) {          distractor.selected = !distractor.selected;          if (scope.slide1.multi) {          } else {            for (var i = 0; i < scope.slide1.distractors.length; i++) {              var myDistractor = scope.slide1.distractors[i];              if (myDistractor !== distractor) {                myDistractor.selected = false;              }            }          }        }      };      scope.submitAnswer = function () {        var answerSubmitted = false;        var correct = true;        var correctAnswer=[];        var submitAnswers=[];        for (var i = 0; i < scope.slide1.distractors.length; i++) {          var myDistractor = scope.slide1.distractors[i];          if (myDistractor.selected) {            answerSubmitted = true;            submitAnswers.push(i);          }          if(myDistractor.correct)            correctAnswer.push(i);          if (myDistractor.correct !== myDistractor.selected) {            correct = false;          }        }		if(submitAnswers.length == 0) {			$(".warningMsg").removeClass("hide").addClass("show");		}		else {			$(".warningMsg").removeClass("show").addClass("hide");		}        if (answerSubmitted) {          scope.slide1.questionCorrect = correct;          scope.slide1.showFeedback = true;          element.addClass('complete');          pageCtrl.completePage();        }      };      scope.reset = function () {        scope.quizComplete = false;       /* for(var j=0; j<scope.slide1.distractors.length; j++){          scope.slide1.distractors[j].selected = false;        } */        $timeout(function () {          scope.$apply();        });      };      if (pageCtrl !== null) {        pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);        pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);      }    }  };}])
.directive('interactiveWatch', function() {    return {        restrict: 'A',        require: '^page',        scope: {},        link: function (scope, element, attrs, pageCtrl) {            element.hide();            scope.reveal = function(){            };            scope.conceal = function(){            };          scope.completionChange = function(){              console.log(attrs);            var watchElements = attrs.interactiveWatch.split(',');            var watchComplete = true;            for(var i=0; i<watchElements.length; i++){              var myElement = watchElements[i];              if($(myElement).hasClass('complete')){              } else{                watchComplete = false;                break;              }            }            if(watchComplete){              element.fadeIn(300);            }          };            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);            pageCtrl.getCompletionChangeSignal().add(scope.completionChange, scope, 2);        }    };})
.directive('audioScenario', ['$sce', 'audioService', 'stateService', '$timeout', function($sce, audioService, stateService, $timeout) {    return {        restrict: 'E',        transclude: true,        require: '^page',        templateUrl: 'audioScenario.html',        scope:{},        link: function (scope, element, attrs, pageCtrl) {            scope.slides = [];            scope.slide1 = {};            scope.slide2 = {};            scope.active = "slide1";            scope.position = 0;            scope.showNext = true;            scope.showPrevious = true;            scope.showAudioControls = false;            scope.isComplete = false;            //Audio vars            scope.title = attrs.title;            scope.localState = {};            scope.localState.src = "";            scope.localState.position = 0;            scope.localState.action = "pause";            scope.localState.global = false;            scope.complete = false;            scope.progress = element.find('.progress');            scope.thumb = element.find('.thumb');            ////////////////////Parse Quiz///////////////////////            var myContent = element.find('.content scene');            for(var i=0; i<myContent.length; i++){                //Stories                var stories = $(myContent[i]).find('story');                for(var j=0; j<stories.length; j++){                    var story = {};                    story.type = "story";                    story.story = $sce.trustAsHtml($(stories[j]).html());                    if(stories[j].hasAttribute("audio"))                    {                        story.audio = stories[j].getAttribute('audio');                        story.autoPlay = stories[j].hasAttribute('auto-play');                        story.autoAdvance = stories[j].hasAttribute('auto-advance');                    }                    scope.slides.push(story);                }                //Questions                var questions = $(myContent[i]).find('question');                for(var k=0; k<questions.length; k++){                    var question = {};                    question.type = "question";                    question.instructions = $sce.trustAsHtml($(questions[k]).find('instructions').html());                    question.stem = $sce.trustAsHtml($(questions[k]).find('stem').html());                    question.distractors = [];                    var myDistractors = $(questions[k]).find('distractor');                    var numCorrect = 0;                    for(var l=0; l<myDistractors.length; l++){                        var myDistractor = {};                        myDistractor.text = $(myDistractors[l]).html();                        myDistractor.correct = myDistractors[l].hasAttribute("correct");                        if(myDistractor.correct){                            numCorrect++;                        }                        myDistractor.selected = false;                        question.distractors.push(myDistractor);                    }                    question.multi = (numCorrect > 1);                    question.correct = $sce.trustAsHtml($(questions[k]).find('feedback>correct').html());                    question.incorrect = $sce.trustAsHtml($(questions[k]).find('feedback>incorrect').html());                    question.showFeedback = false;                    question.questionCorrect = false;                    if(questions[k].hasAttribute("audio"))                    {                        question.audio = questions[k].getAttribute('audio');                        question.autoPlay = questions[k].hasAttribute('auto-play');                        question.autoAdvance = questions[k].hasAttribute('auto-advance');                    }                    scope.slides.push(question);                }                //Summary                var summaries = $(myContent[i]).find('summary');                for(var m=0; m<summaries.length; m++){                    var summary = {};                    summary.type = "summary";                    summary.summary = $sce.trustAsHtml($(summaries[m]).html());                    if(summaries[m].hasAttribute("audio"))                    {                        summary.audio = summaries[m].getAttribute('audio');                        summary.autoPlay = summaries[m].hasAttribute('auto-play');                        summary.autoAdvance = summaries[m].hasAttribute('auto-advance');                    }                    scope.slides.push(summary);                }            }            element.find('.content').html("");            /////////////////////////////////////////////////////////////////////////////////////////            scope.reveal = function(){                this.complete = false;                scope.init();                $timeout(function(){                    stateService.state.lockRight = false;                    stateService.state.lockLeft = true;                    scope.$apply();                },0, false);                scope.reset();            };            scope.conceal = function(){                audioService.pause();            };            scope.distractorSelected = function(distractor, event){                if(!scope[scope.active].showFeedback){                    distractor.selected = !distractor.selected;                    if(scope[scope.active].multi){                    } else{                        for(var i=0; i < scope[scope.active].distractors.length; i++){                            var myDistractor = scope[scope.active].distractors[i];                            if(myDistractor !== distractor){                                myDistractor.selected = false;                            }                        }                    }                }            };            scope.submitAnswer = function(){                var answerSubmitted = false;                var correct = true;                for(var i=0; i < scope[scope.active].distractors.length; i++){                    var myDistractor = scope[scope.active].distractors[i];                    if(myDistractor.selected){                        answerSubmitted = true;                    }                    if(myDistractor.correct !== myDistractor.selected){                        correct = false;                    }                }                if(answerSubmitted){                    scope[scope.active].questionCorrect = correct;                    scope[scope.active].showFeedback = true;                    if(scope.position < scope.slides.length-1){                        scope.showNext = true;                    }                }            };            scope.nextSelected = function(){               if(scope.position < scope.slides.length-1){                   scope.position++;                   if(scope.active === "slide1"){                       scope.active = "slide2";                   } else{                       scope.active = "slide1";                   }                   audioService.pause();                   audioService.position(0);                   scope.setSlide();                   if(scope[scope.active].type === "question"){                       var answerSelected = false;                       for(var i=0; i < scope[scope.active].distractors.length; i++){                           var myDistractor = scope[scope.active].distractors[i];                           if(myDistractor.selected){                               answerSelected = true;                           }                       }                       if(answerSelected){                           scope.showNext = true;                       }else{                           scope.showNext = false;                       }                   }                   if(scope.position === scope.slides.length-1){                       scope.showNext = false;                       if(!scope.isComplete){                           scope.isComplete = true;                           element.addClass('complete');                           pageCtrl.completePage();                       }                   }                   scope.showPrevious = true;                   if(scope.active === "slide1"){                       TweenMax.set(element.find('.slide1'), {left: "100%"});                       TweenMax.set(element.find('.slide2'), {left: "0%"});                       TweenMax.to(element.find('.slide1'), 0.3, {left: "0%", ease: Linear.easeNone});                       TweenMax.to(element.find('.slide2'), 0.3, {left: "-100%", ease: Linear.easeNone});                   }else{                       TweenMax.set(element.find('.slide1'), {left: "0%"});                       TweenMax.set(element.find('.slide2'), {left: "100%"});                       TweenMax.to(element.find('.slide1'), 0.3, {left: "-100%", ease: Linear.easeNone});                       TweenMax.to(element.find('.slide2'), 0.3, {left: "0%", ease: Linear.easeNone});                   }               }            };            scope.previousSelected = function(){                if(scope.position > 0){                    scope.position--;                    if(scope.active === "slide1"){                        scope.active = "slide2";                    } else{                        scope.active = "slide1";                    }                    audioService.pause();                    audioService.position(0);                    scope.setSlide();                    scope.showNext = true;                    if(scope.position === 0){                        scope.showPrevious = false;                    }                    audioService.pause();                    audioService.position(0);                    if(scope.active === "slide1"){                        TweenMax.set(element.find('.slide1'), {left: "-100%"});                        TweenMax.set(element.find('.slide2'), {left: "0%"});                        TweenMax.to(element.find('.slide1'), 0.3, {left: "0%", ease: Linear.easeNone});                        TweenMax.to(element.find('.slide2'), 0.3, {left: "100%", ease: Linear.easeNone});                    }else{                        TweenMax.set(element.find('.slide1'), {left: "0%"});                        TweenMax.set(element.find('.slide2'), {left: "-100%"});                        TweenMax.to(element.find('.slide1'), 0.3, {left: "100%", ease: Linear.easeNone});                        TweenMax.to(element.find('.slide2'), 0.3, {left: "0%", ease: Linear.easeNone});                    }                }            };            scope.reset = function(){                scope.position = 0;                scope.active = "slide2";                scope.showNext = true;                scope.showPrevious = true;                scope.setSlide();                TweenMax.set(element.find('.slide2'), {left: "0%"});                TweenMax.set(element.find('.slide1'), {left: "100%"});                $timeout(function() {                    scope.$apply();                });            };            scope.setSlide = function(){                scope[scope.active] = scope.slides[scope.position];                scope.init();                if(scope[scope.active].hasOwnProperty('audio'))                {                    scope.localState.src = scope[scope.active].audio;                    scope.showAudioControls = true;                    if(scope[scope.active].autoPlay){                        scope.localState.action = "pause";                        audioService.play(scope.localState.src, 0, false);                        element.find("#replay").hide();                        element.find("#pause").show();                        element.find("#play").hide();                    }                } else{                    scope.localState.src = "";                        scope.showAudioControls = false;                }                if(scope[scope.active].type === "question"){                    scope[scope.active].showFeedback = false;                    scope[scope.active].questionCorrect = false;                }            };            //Audio functions            scope.init = function(){                element.find('#loader').hide();                element.find("#replay").hide();                element.find("#pause").hide();                element.find("#play").show();                scope.localState.position = 0;                scope.progress.css({'width': 0+'px'});                scope.thumb.css({'left': 0+'px'});            };            scope.pausePlay = function(){                switch(scope.localState.action)                {                    case "play":                        scope.localState.action = "pause";                        audioService.pause();                        element.find("#replay").hide();                        element.find("#pause").hide();                        element.find("#play").show();                        break;                    case "pause":                        scope.localState.action = "play";                        audioService.play(scope.localState.src, scope.localState.position, false);                        element.find("#replay").hide();                        element.find("#pause").show();                        element.find("#play").hide();                        break;                    case "replay":                        scope.localState.action = "play";                        audioService.play(scope.localState.src, 0, false);                        element.find("#replay").hide();                        element.find("#pause").show();                        element.find("#play").hide();                        break;                }            };            scope.dragStart = function(e){                scope.dragState = scope.localState.action;                audioService.pause();                scope.offsetX = parseFloat(scope.progress.css('width').replace("px", ""));                stateService.state.lockLeft = true;                stateService.state.lockRight = true;                e.preventDefault();                e.stopPropagation();            };            scope.dragging = function(e){                var thumbDistance = element.find('.track').width() - element.find('.thumb').width();                var pos = Math.max(0, Math.min(thumbDistance, (scope.offsetX+e.deltaX)));                scope.progress.css({'width': pos+'px'});                scope.thumb.css({'left': pos+'px'});                scope.localState.position = pos/thumbDistance;                e.preventDefault();                e.stopPropagation();            };            scope.dragStop = function(e){                switch(scope.dragState){                    case "play":                        audioService.play(scope.localState.src, scope.localState.position, false);                        break;                    case "pause":                        break;                    case "replay":                        audioService.play(scope.localState.src, 0, false);                        break;                }                e.preventDefault();                stateService.state.lockLeft = false;                stateService.state.lockRight = false;                e.stopPropagation();            };            scope.stop = function(){                audioService.pause();            };            scope.onPositionChange = function(state){                if(state.src === scope.localState.src){                    scope.localState = state;                    element.find('.progress').css('width', (scope.localState.position*100)+'%');                    var thumbDistance = element.find('.track').width() - element.find('.thumb').width();                    element.find('.thumb').css('left', (scope.localState.position*thumbDistance)+'px');                }            };            scope.onStateChange = function(state) {                if (state.src === scope.localState.src) {                    scope.localState = state;                    switch (scope.localState.action) {                        case "play":                            element.find("#replay").hide();                            element.find("#pause").show();                            element.find("#play").hide();                            break;                        case "pause":                            element.find("#replay").hide();                            element.find("#pause").hide();                            element.find("#play").show();                            break;                        case "replay":                            element.find("#replay").show();                            element.find("#pause").hide();                            element.find("#play").hide();                            if(scope[scope.active].autoAdvance){                                scope.nextSelected();                            }                            break;                    }                }            };            scope.$on("$destroy",function(){                audioService.pause();            });            audioService.onStateChange.add(scope.onStateChange, scope, 2);            audioService.onPosition.add(scope.onPositionChange, scope, 2);            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };}])
.directive('branchingScenario', ['$compile', 'stateService', '$timeout', function($compile, stateService, $timeout) {    return {        restrict: 'E',        transclude: true,        require: '^page',        templateUrl: 'branchingScenario.html',        scope:{},        controller: ["$scope", function($scope){        //public functions        this.goto = function(key){          $scope.goto(key);        };      }],        link: function (scope, element, attrs, pageCtrl) {            scope.slides = {};            scope.slide1 = {};            scope.slide2 = {};            scope.active = "slide1";            scope.position = '';            scope.isComplete = false;            scope.firstKey = '';            ////////////////////Parse Quiz///////////////////////          //scope.slides = {};          var slides = element.find('.content slide');            //var slides = $(myContent[i]).find('slide');            for(var j=0; j<slides.length; j++){                var slide = {};                if($(slides[j])[0].hasAttribute('complete')){                    slide.complete = true;                } else{                    slide.complete = false;                }                slide.content = $(slides[j]).html();                var key = $(slides[j]).attr('key');                if(j === 0) {                  scope.firstKey = key;                }                scope.slides[key] = slide;            }            console.log(scope.slides);            element.find('.content').html("");            /////////////////////////////////////////////////////////////////////////////////////////            scope.reveal = function(){                $timeout(function(){                    stateService.state.lockRight = false;                    stateService.state.lockLeft = true;                    scope.$apply();                },0, false);                scope.reset();            };            scope.conceal = function(){            };            scope.goto = function(key){                scope.position = key;                if(scope.active === "slide1"){                    scope.active = "slide2";                } else{                    scope.active = "slide1";                }                scope.setSlide();                if(scope.slides[scope.position].complete){                    if(!scope.isComplete){                        scope.isComplete = true;                        element.addClass('complete');                        pageCtrl.completePage();                    }                }                if(scope.active === "slide1"){                    TweenMax.set(element.find('.slide1'), {left: "100%"});                    TweenMax.set(element.find('.slide2'), {left: "0%"});                    TweenMax.to(element.find('.slide1'), 0.3, {left: "0%", ease: Linear.easeNone});                    TweenMax.to(element.find('.slide2'), 0.3, {left: "-100%", ease: Linear.easeNone});                } else{                    TweenMax.set(element.find('.slide1'), {left: "0%"});                    TweenMax.set(element.find('.slide2'), {left: "100%"});                    TweenMax.to(element.find('.slide1'), 0.3, {left: "-100%", ease: Linear.easeNone});                    TweenMax.to(element.find('.slide2'), 0.3, {left: "0%", ease: Linear.easeNone});                }            };            scope.reset = function(){                scope.position = scope.firstKey;                scope.active = "slide2";                scope.setSlide();                TweenMax.set(element.find('.slide2'), {left: "0%"});                TweenMax.set(element.find('.slide1'), {left: "100%"});                $timeout(function() {                    scope.$apply();                });            };            scope.setSlide = function(){              var myElement = element.find('.'+scope.active +' .slide');              myElement.html(scope.slides[scope.position].content);              $compile(myElement)(scope);            };            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };}])
.directive('video', function() {    return {        require: '^page',        restrict: 'E',        scope:{},        link: function (scope, element, attrs, pageCtrl) {            scope.conceal = function(){                console.log("pause video");                element[0].pause();            };            scope.reveal = function(){            };            pageCtrl.getRevealSignal().add(scope.reveal, scope, 2);            pageCtrl.getConcealSignal().add(scope.conceal, scope, 2);        }    };})
.directive('autoReveal', function() {    return {        require: '^page',        restrict: 'A',        link: function (scope, element, attrs, pageCtrl) {            var listItems;            switch(element[0].nodeName){                case "UL":                    listItems = element.find('li');                    angular.forEach(listItems, function(item){                        pageCtrl.registerAutoReveal(item);                    });                    break;                case "OL":                    listItems = element.find('li');                    angular.forEach(listItems, function(item){                        pageCtrl.registerAutoReveal(item);                    });                    break;                case "TABLE":                    listItems = element.find('th, td');                    angular.forEach(listItems, function(item){                        pageCtrl.registerAutoReveal(item);                    });                    break;                default:                    pageCtrl.registerAutoReveal(element[0]);            }        }    };})
.directive('soundControl', ['audioService', '$timeout', function(audioService, $timeout) {    return {        restrict: 'E',        require: '^page',        templateUrl: 'soundControl.html',        scope:{},        link: function (scope, element, attrs, pageCtrl) {            scope.title = attrs.title;            scope.localState = {};            scope.localState.src = attrs.src;            scope.localState.position = 0;            scope.localState.action = "pause";            scope.localState.global = false;            scope.complete = false;            scope.loadLength = element.find('#loader')[0].getTotalLength();            scope.strokeLength = scope.loadLength;            scope.strokeOffset = scope.loadLength;            scope.init = function(){                scope.strokeOffset = scope.loadLength;                scope.strokeOffset = scope.loadLength;                scope.localState.position = 0;                scope.localState.action = "pause";                element.find('#loader').hide();                element.find("#replay").hide();                element.find("#pause").hide();                element.find("#play").show();            };            scope.onEnd = function(){                if(!scope.complete && $(element)[0].hasAttribute("auto-complete")){                    scope.complete = true;                    pageCtrl.completePage();                }                //scope.localState.action = "replay";                element.find('#loader').hide();            };            scope.pausePlay = function(){                switch(scope.localState.action)                {                    case "play":                        scope.localState.action = "pause";                        audioService.pause();                        element.find("#replay").hide();                        element.find("#pause").hide();                        element.find("#play").show();                        break;                    case "pause":                        scope.localState.action = "play";                        audioService.play(scope.localState.src, scope.localState.position, false);                        element.find("#replay").hide();                        element.find("#pause").show();                        element.find("#play").hide();                        break;                    case "replay":                        scope.localState.action = "play";                        audioService.play(scope.localState.src, 0, false);                        element.find("#replay").hide();                        element.find("#pause").show();                        element.find("#play").hide();                        break;                }            };            scope.start = function(){                this.complete = false;                scope.init();                $timeout(function(){audioService.onEnd.add(scope.onEnd, scope, 2);}, 0, false);            };            scope.stop = function(){                audioService.pause();                audioService.onEnd.remove(scope.onEnd, scope);            };            pageCtrl.getRevealSignal().add(scope.start, scope, 2);            pageCtrl.getConcealSignal().add(scope.stop, scope, 2);            scope.onPositionChange = function(state){                if(state.src === scope.localState.src){                    scope.localState = state;                    if(scope.localState.position === 0 || scope.localState.position === 1){                        element.find('#loader').hide();                    } else{                        element.find('#loader').show();                    }                    scope.strokeOffset = scope.loadLength-(scope.localState.position*scope.loadLength);                }            };            /*scope.onEnd = function(params){                scope.currentState = "replay";            };*/            scope.onStateChange = function(state) {                if (state.src === scope.localState.src) {                    scope.localState = state;                    switch (scope.localState.action) {                        case "play":                            element.find("#replay").hide();                            element.find("#pause").show();                            element.find("#play").hide();                            break;                        case "pause":                            element.find("#replay").hide();                            element.find("#pause").hide();                            element.find("#play").show();                            break;                        case "replay":                            element.find("#replay").show();                            element.find("#pause").hide();                            element.find("#play").hide();                            break;                    }                }            };            audioService.onStateChange.add(scope.onStateChange, scope, 2);            audioService.onPosition.add(scope.onPositionChange, scope, 2);            scope.$on("$destroy",function(){                audioService.pause();            });            console.log("SOUND CONTROL");        }    };}])
.controller('bookmark', ['$scope', 'stateService', 'chapterService','settingsService', function($scope, stateService, chapterService, settingService) {    $scope.pressYes = function(){        console.log("yes");        stateService.state.chapterEntryPoint = "completion";        console.log(stateService.state.currentChapter);        console.log(chapterService.chapters[stateService.state.currentChapter]);        console.log(chapterService.chapters[stateService.state.currentChapter].link);        document.location = chapterService.chapters[stateService.state.currentChapter].link;        stateService.state.showAlert = false;    };    $scope.pressNo = function(){        console.log("no");        document.location ="#/";		settingService.settings.showSplash = true;        stateService.state.showAlert = false;    };	// access to the setting service	// show splash to true}])
.directive('menuTile', function() {    return {        restrict: 'E',        templateUrl: 'plugins/menuTile.html',		link: function(scope, element, attr) {			scope.test = function(str,clor) {				//$(".chTitle").text(str);			/*	$(".contentTxt p").html("<span style='font-weight:500'>" + str + "</span><br/>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. " + str + " Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero.  Proin pharetra nonummy pede. ____________________________&#9736;"); */			};		}    };}).directive('titleBar', ['chapterService', function(chapterService) {    return {        restrict: 'E',        templateUrl: 'homePage/tileGrid/plugins/titleBar.html',        link: function(scope, element, attr){            scope.myChapters = chapterService.chapters;        }    };}]);
})();

var vwListPortrait = [
  {
    "selector": ".splash .welcome-text",
    "prop": "margin-top",
    "val": "10"
  },
  {
    "selector": ".splash .welcome-text p",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": ".splash .choose-text",
    "prop": "font-size",
    "val": "3.2"
  },
  {
    "selector": ".splash .choose-text",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": ".splash .choose-text .distractor table td",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": ".splash .choose-text .distractor table td",
    "prop": "padding",
    "val": "0.5"
  },
  {
    "selector": ".splash .choose-text .distractor table td:first-child",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": ".splash .button-holder .begin-btn",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": ".splash .button-holder .begin-btn",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": ".splash .button-holder .begin-btn",
    "prop": "line-height",
    "val": "10"
  },
  {
    "selector": "alert > .alert-pane",
    "prop": "top",
    "val": "15"
  },
  {
    "selector": "alert > .alert-pane",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "alert > .alert-pane",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "alert .alert-close",
    "prop": "top",
    "val": "35"
  },
  {
    "selector": "alert .alert-close",
    "prop": "width",
    "val": "15"
  },
  {
    "selector": "alert .alert-close",
    "prop": "height",
    "val": "7.0"
  },
  {
    "selector": "alert .alert-background-standard",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "alert .alert-content-standard",
    "prop": "font-size",
    "val": "3.8"
  },
  {
    "selector": "alert .alert-content-standard",
    "prop": "margin-top",
    "val": "4"
  },
  {
    "selector": "alert .alert-content-standard",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "alert .alert-content-standard p",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "alert .alert-content-standard p",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "margin",
    "val": "0 0 0 0.4"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "width",
    "val": "39.4"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "height",
    "val": "8"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "line-height",
    "val": "5.5"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": "accordion.vertical .accordion-bar",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "accordion.vertical .accordion-bar",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "accordion.vertical .accordion-bar",
    "prop": "margin-bottom",
    "val": "0.5"
  },
  {
    "selector": "accordion.vertical .accordion-bar .completion-check",
    "prop": "padding-top",
    "val": ".5"
  },
  {
    "selector": "accordion.vertical .accordion-bar .completion-check",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "accordion.vertical .accordion-bar .completion-check",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": "accordion.vertical .accordion-bar .open-icon",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "accordion.vertical .accordion-bar .open-icon",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "accordion.vertical .accordion-bar .open-icon",
    "prop": "padding",
    "val": "0 1"
  },
  {
    "selector": "accordion.vertical .accordion-content-holder",
    "prop": "border-radius",
    "val": "1"
  },
  {
    "selector": "accordion.vertical .accordion-content-holder",
    "prop": "margin-bottom",
    "val": "0.5"
  },
  {
    "selector": "accordion.vertical .accordion-content",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-default .accordion-content-holder",
    "prop": "border-radius",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-default .accordion-content",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": "accordion.horizontal accordion-pane",
    "prop": "width",
    "val": "7"
  },
  {
    "selector": "accordion.horizontal accordion-pane",
    "prop": "margin-right",
    "val": ".25"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar",
    "prop": "font-size",
    "val": "5"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .completion-check",
    "prop": "padding-left",
    "val": ".5"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .completion-check",
    "prop": "width",
    "val": "4.5"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .completion-check",
    "prop": "height",
    "val": "4.5"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .open-icon",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .open-icon",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .open-icon",
    "prop": "padding",
    "val": "0 1"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-content-holder",
    "prop": "left",
    "val": "7.25"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-content-holder",
    "prop": "border-radius",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-content",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": "ddrop .question .stem",
    "prop": "font-size",
    "val": "1.7"
  },
  {
    "selector": "ddrop .question .stem",
    "prop": "line-height",
    "val": "2"
  },
  {
    "selector": "ddrop .question .stem",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": "ddrop .question .stem P",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "ddrop .question .stem P",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "ddrop .question .distractor table td",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "ddrop .question .distractor table td",
    "prop": "padding",
    "val": "0.5"
  },
  {
    "selector": "ddrop .question .distractor table td:first-child",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "ddrop .submit",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "ddrop .submit",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "ddrop .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "ddrop .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "ddrop .submit:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": ".panel",
    "prop": "padding",
    "val": "5"
  },
  {
    "selector": "ol.orange-numbers li",
    "prop": "margin-bottom",
    "val": "1.6"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "left",
    "val": "-5"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "top",
    "val": "-0.5"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": ".direction::before",
    "prop": "width",
    "val": "6"
  },
  {
    "selector": ".direction::before",
    "prop": "height",
    "val": "6"
  },
  {
    "selector": ".direction::before",
    "prop": "margin-left",
    "val": "-7"
  },
  {
    "selector": ".direction::before",
    "prop": "margin-top",
    "val": "-1.5"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "right",
    "val": "1"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "top",
    "val": "1"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": ".popover-content-holder",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": ".chapter-left",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": ".chapter-right",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "top",
    "val": "calc( 50vh - 5"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "width",
    "val": "5"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "top",
    "val": "calc( 50vh - 5"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "width",
    "val": "5"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "margin-left",
    "val": "-2"
  },
  {
    "selector": "page",
    "prop": "width",
    "val": "100"
  },
  {
    "selector": "page",
    "prop": "padding",
    "val": "8"
  },
  {
    "selector": "page h1",
    "prop": "font-size",
    "val": "5"
  },
  {
    "selector": "page h1",
    "prop": "line-height",
    "val": "5"
  },
  {
    "selector": "page h1",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": "page h2",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "page h2",
    "prop": "line-height",
    "val": "5"
  },
  {
    "selector": "page h2",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": "page p",
    "prop": "font-size",
    "val": "3.2"
  },
  {
    "selector": "page p",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "page p",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": "page .page-gap",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "page li",
    "prop": "font-size",
    "val": "3.2"
  },
  {
    "selector": "page li",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "page li",
    "prop": "margin-left",
    "val": "6"
  },
  {
    "selector": "page li",
    "prop": "margin-bottom",
    "val": "1"
  },
  {
    "selector": "page table th",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "page table th",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "page table th",
    "prop": "line-height",
    "val": "5"
  },
  {
    "selector": "page table td",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "page table td",
    "prop": "font-size",
    "val": "3.2"
  },
  {
    "selector": "page table td",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "width",
    "val": "40"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "left",
    "val": "20"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "height",
    "val": "15"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50vh - 10"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "page .warning-overlay .warning-pane .cancel",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "page .warning-overlay .warning-pane .cancel",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "page .warning-overlay .warning-pane .cancel",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": "page .warning-overlay .warning-pane .cancel",
    "prop": "width",
    "val": "18"
  },
  {
    "selector": "page .warning-overlay .warning-pane .continue",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "page .warning-overlay .warning-pane .continue",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "page .warning-overlay .warning-pane .continue",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": "page .warning-overlay .warning-pane .continue",
    "prop": "width",
    "val": "18"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "direction",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": ".icon-holder",
    "prop": "width",
    "val": "6"
  },
  {
    "selector": ".icon-holder",
    "prop": "height",
    "val": "6"
  },
  {
    "selector": ".icon-holder",
    "prop": "min-width",
    "val": "6"
  },
  {
    "selector": ".icon-holder",
    "prop": "min-height",
    "val": "6"
  },
  {
    "selector": ".icon-holder",
    "prop": "max-width",
    "val": "6"
  },
  {
    "selector": ".icon-holder",
    "prop": "max-height",
    "val": "6"
  },
  {
    "selector": ".instruction-holder",
    "prop": "font-size",
    "val": "3.2"
  },
  {
    "selector": "quiz-topics .radioBTN",
    "prop": "width",
    "val": "2.5"
  },
  {
    "selector": "quiz-topics .radioBTN svg",
    "prop": "height",
    "val": "2.5"
  },
  {
    "selector": "quiz-topics .question-count",
    "prop": "top",
    "val": "1"
  },
  {
    "selector": "quiz-topics .question-count",
    "prop": "right",
    "val": "6"
  },
  {
    "selector": "quiz-topics .summary",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-topics .summary .returnBtn:before",
    "prop": "padding-right",
    "val": "0.5"
  },
  {
    "selector": "quiz-topics .question",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-topics .question .stem",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "quiz-topics .question .stem",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-topics .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "quiz-topics .question .stem P",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "quiz-topics .question .stem P",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-topics .question .distractor",
    "prop": "margin-bottom",
    "val": "0.75"
  },
  {
    "selector": "quiz-topics .question .distractor td",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-topics .question .distractor td",
    "prop": "padding",
    "val": "0.5"
  },
  {
    "selector": "quiz-topics .question .distractor td:first-child",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "quiz-topics .question .feedbackholder",
    "prop": "margin",
    "val": "2"
  },
  {
    "selector": "quiz-topics .question .feedbackholder .correct",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "quiz-topics .question .feedbackholder .incorrect",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-topics .submit:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "quiz-topics .next:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "quiz-topics .retry:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": ".chapter1_page11 .panel2 .padding-bottom30 accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": "quiz-game .radioBTN",
    "prop": "width",
    "val": "2.5"
  },
  {
    "selector": "quiz-game .radioBTN svg",
    "prop": "height",
    "val": "2.5"
  },
  {
    "selector": "quiz-game .question-count",
    "prop": "right",
    "val": "6"
  },
  {
    "selector": "quiz-game .summary",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-game .question",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-game .question .stem",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "quiz-game .question .stem",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-game .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "quiz-game .question .stem P",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "quiz-game .question .stem P",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-game .next",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "quiz-game .next",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-game .next",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-game .next",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-game .submit:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "quiz-game .next:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "quiz-game .retry:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "knowledge-check .radioBTN",
    "prop": "width",
    "val": "2.5"
  },
  {
    "selector": "knowledge-check .radioBTN svg",
    "prop": "height",
    "val": "2.5"
  },
  {
    "selector": "knowledge-check .question .stem",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "knowledge-check .question .stem",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "knowledge-check .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "knowledge-check .question .stem P",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "knowledge-check .question .stem P",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "knowledge-check .question .distractor table td",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "knowledge-check .question .distractor table td",
    "prop": "padding",
    "val": "0.5"
  },
  {
    "selector": "knowledge-check .question .distractor table td:first-child",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "knowledge-check .question .feedbackholder .correct",
    "prop": "padding",
    "val": "2.5"
  },
  {
    "selector": "knowledge-check .question .feedbackholder .incorrect",
    "prop": "padding",
    "val": "2.5"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "knowledge-check .submit:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "audio-scenario",
    "prop": "height",
    "val": "calc( 100vh - 14"
  },
  {
    "selector": "audio-scenario .radioBTN",
    "prop": "width",
    "val": "2.5"
  },
  {
    "selector": "audio-scenario .radioBTN svg",
    "prop": "height",
    "val": "2.5"
  },
  {
    "selector": "audio-scenario .scenario-bar",
    "prop": "height",
    "val": "7"
  },
  {
    "selector": "audio-scenario .scenario-bar",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "audio-scenario .scenario-bar .nextBTN",
    "prop": "width",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar .nextBTN",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar .previousBTN",
    "prop": "width",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar .previousBTN",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar .nextBTN",
    "prop": "padding-right",
    "val": "0.4"
  },
  {
    "selector": "audio-scenario .scenario-bar .previousBTN",
    "prop": "padding-left",
    "val": "0.4"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder",
    "prop": "margin-left",
    "val": "15"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .icon",
    "prop": "width",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .icon",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .icon",
    "prop": "margin-left",
    "val": "-6.5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .track",
    "prop": "top",
    "val": "2"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .track",
    "prop": "height",
    "val": "1"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .progress",
    "prop": "height",
    "val": "1"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "top",
    "val": "1"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "width",
    "val": "1.5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "border-radius",
    "val": "1"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "top",
    "val": "-2"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "left",
    "val": "-6"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "width",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": "audio-scenario .slide1",
    "prop": "height",
    "val": "calc( 100vh - 21"
  },
  {
    "selector": "audio-scenario .slide2",
    "prop": "height",
    "val": "calc( 100vh - 21"
  },
  {
    "selector": "audio-scenario .question",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "audio-scenario .question .stack1",
    "prop": "padding-bottom",
    "val": "2"
  },
  {
    "selector": "audio-scenario .question .stem",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "audio-scenario .question .stem",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "audio-scenario .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "audio-scenario .question .stem P",
    "prop": "font-size",
    "val": "3.7"
  },
  {
    "selector": "audio-scenario .question .stem P",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "audio-scenario .question .distractor td",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "audio-scenario .question .distractor td",
    "prop": "padding",
    "val": "0.5"
  },
  {
    "selector": "audio-scenario .question .distractor td:first-child",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "audio-scenario .question .submit:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "audio-scenario .question .feedbackholder",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "audio-scenario .question .feedbackholder .correct",
    "prop": "padding",
    "val": "5"
  },
  {
    "selector": "audio-scenario .question .feedbackholder .incorrect",
    "prop": "padding",
    "val": "5"
  },
  {
    "selector": "branching-scenario",
    "prop": "height",
    "val": "calc( 100vh - 14"
  },
  {
    "selector": "branching-scenario .slide1",
    "prop": "height",
    "val": "calc( 100vh - 14"
  },
  {
    "selector": "branching-scenario .slide2",
    "prop": "height",
    "val": "calc( 100vh - 14"
  },
  {
    "selector": "branching-scenario .slide .btn",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "branching-scenario .slide .btn",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "sound-control .icon",
    "prop": "width",
    "val": "8"
  },
  {
    "selector": "sound-control .icon",
    "prop": "height",
    "val": "8"
  },
  {
    "selector": "sound-control h2",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "sound-control h2",
    "prop": "line-height",
    "val": "8"
  },
  {
    "selector": "sound-control h2",
    "prop": "left",
    "val": "9"
  },
  {
    "selector": "sound-control h2",
    "prop": "width",
    "val": "85"
  },
  {
    "selector": ".btn-container",
    "prop": "bottom",
    "val": "0.4"
  },
  {
    "selector": ".btn-container",
    "prop": "width",
    "val": "80"
  },
  {
    "selector": ".btn-container",
    "prop": "height",
    "val": "30"
  },
  {
    "selector": ".btn-container .yes-btn",
    "prop": "width",
    "val": "15"
  },
  {
    "selector": ".btn-container .yes-btn",
    "prop": "height",
    "val": "15"
  },
  {
    "selector": ".btn-container .yes-btn",
    "prop": "margin",
    "val": "0 9"
  },
  {
    "selector": ".btn-container .no-btn",
    "prop": "width",
    "val": "15"
  },
  {
    "selector": ".btn-container .no-btn",
    "prop": "height",
    "val": "15"
  },
  {
    "selector": ".btn-container .no-btn",
    "prop": "margin",
    "val": "0 9"
  },
  {
    "selector": ".chapter1_page8 .panel2 .padding-bottom30 accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": "#menu-tile-list",
    "prop": "margin",
    "val": "10"
  },
  {
    "selector": "menu-tile .tile-content",
    "prop": "height",
    "val": "40"
  },
  {
    "selector": "menu-tile .tile-content > h2",
    "prop": "width",
    "val": "calc( 100% - 4"
  },
  {
    "selector": "menu-tile .tile-content > h2",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "31.5"
  },
  {
    "selector": "menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "9"
  },
  {
    "selector": "menu-tile > .tile-background",
    "prop": "height",
    "val": "40"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "width",
    "val": "24"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "height",
    "val": "24"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "bottom",
    "val": "7"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "right",
    "val": "calc( 50% - 12"
  },
  {
    "selector": ".welcome",
    "prop": "margin-right",
    "val": "50"
  },
  {
    "selector": ".welcome menu-tile .tile-content",
    "prop": "height",
    "val": "20"
  },
  {
    "selector": ".welcome menu-tile .tile-content > h2",
    "prop": "width",
    "val": "calc( 100% - 4"
  },
  {
    "selector": ".welcome menu-tile .tile-content > h2",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": ".welcome menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "31.5"
  },
  {
    "selector": ".welcome menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "9"
  },
  {
    "selector": ".welcome menu-tile .tile-content:after",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": ".welcome menu-tile .tile-content:after",
    "prop": "left",
    "val": "43"
  },
  {
    "selector": ".welcome menu-tile .tile-content:after",
    "prop": "top",
    "val": "10"
  },
  {
    "selector": ".welcome menu-tile > .tile-background",
    "prop": "height",
    "val": "20"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "width",
    "val": "16"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "height",
    "val": "16"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "left",
    "val": "4"
  },
  {
    "selector": ".completion menu-tile .tile-content",
    "prop": "height",
    "val": "20"
  },
  {
    "selector": ".completion menu-tile .tile-content > h2",
    "prop": "width",
    "val": "calc( 75% - 4"
  },
  {
    "selector": ".completion menu-tile .tile-content > h2",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": ".completion menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "31.5"
  },
  {
    "selector": ".completion menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "9"
  },
  {
    "selector": ".completion menu-tile > .tile-background",
    "prop": "height",
    "val": "20"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "width",
    "val": "16"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "height",
    "val": "16"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "right",
    "val": "1"
  },
  {
    "selector": ".chapter2_page1 .panel1 textarea",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": ".chapter2_page11 .panel2 .padding-bottom30 accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": ".chapter2_page13 .panel2 .padding-bottom30 accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": ".chapter2_page3 .panel3 flip-card",
    "prop": "height",
    "val": "29"
  },
  {
    "selector": ".chapter2_page5 .panel2 .padding-bottom30 accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": ".chapter2_page6 .panel",
    "prop": "padding-left",
    "val": "2.5"
  },
  {
    "selector": ".chapter2_page9 .panel2 .padding-bottom30 accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": ".chapter3_page10 .popover1",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover2",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover3",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover4",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover5",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 accordion .accordion-bar .completion-check",
    "prop": "margin-left",
    "val": "1"
  },
  {
    "selector": ".chapter4_page3 .panel1 .responsive-100-50",
    "prop": "padding",
    "val": "2.5"
  },
  {
    "selector": ".chapter4_page7 .panel1 .responsive-100-50",
    "prop": "padding",
    "val": "2.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "height",
    "val": "6"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "line-height",
    "val": "6"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "top",
    "val": "8"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "padding",
    "val": "0 2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display",
    "prop": "right",
    "val": "6"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "margin-top",
    "val": "-1.6"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "height",
    "val": "calc( 100vh - 12"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "padding",
    "val": "16"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile",
    "prop": "width",
    "val": "46"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile",
    "prop": "height",
    "val": "40"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile",
    "prop": "margin-right",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile h2",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile h2",
    "prop": "line-height",
    "val": "4.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container page",
    "prop": "margin-top",
    "val": "13.8"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container page",
    "prop": "height",
    "val": "calc( 100vh - 13.8"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "width",
    "val": "60"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "left",
    "val": "20"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "height",
    "val": "30"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50vh - 20"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "width",
    "val": "18"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "width",
    "val": "18"
  },
  {
    "selector": ".bar",
    "prop": "width",
    "val": "100"
  },
  {
    "selector": ".bar",
    "prop": "height",
    "val": "7"
  },
  {
    "selector": ".bar",
    "prop": "padding-top",
    "val": "1"
  },
  {
    "selector": ".logo",
    "prop": "left",
    "val": "2.5"
  },
  {
    "selector": ".logo",
    "prop": "top",
    "val": "2.5"
  },
  {
    "selector": ".logo",
    "prop": "width",
    "val": "15"
  },
  {
    "selector": ".logo",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": ".menu-title",
    "prop": "left",
    "val": "18.5"
  },
  {
    "selector": ".menu-title",
    "prop": "top",
    "val": "2.2"
  },
  {
    "selector": ".menu-title",
    "prop": "width",
    "val": "57"
  },
  {
    "selector": ".menu-title",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": ".menu-title",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": ".exit-btn",
    "prop": "top",
    "val": "2.2"
  },
  {
    "selector": ".exit-btn",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": ".exit-btn",
    "prop": "line-height",
    "val": "2.5"
  },
  {
    "selector": ".exit-btn",
    "prop": "padding",
    "val": "0.2"
  },
  {
    "selector": ".exit-btn-switch",
    "prop": "top",
    "val": "1.4"
  },
  {
    "selector": ".exit-btn-switch",
    "prop": "font-size",
    "val": "1.2"
  },
  {
    "selector": ".exit-btn-switch",
    "prop": "line-height",
    "val": "1.5"
  },
  {
    "selector": ".exit-btn-switch",
    "prop": "padding",
    "val": "0.2"
  },
  {
    "selector": ".menu-btn",
    "prop": "border-radius",
    "val": "0.5"
  },
  {
    "selector": ".menu-btn",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": ".menu-btn",
    "prop": "padding-top",
    "val": ".4"
  },
  {
    "selector": ".menu-btn > svg",
    "prop": "height",
    "val": "6"
  },
  {
    "selector": ".menu-btn > p",
    "prop": "font-size",
    "val": "2.8"
  },
  {
    "selector": ".menu-btn > p",
    "prop": "margin-bottom",
    "val": "0.4"
  },
  {
    "selector": ".menu-btn > p",
    "prop": "margin-top",
    "val": "-0.4"
  },
  {
    "selector": ".menu-list-background",
    "prop": "top",
    "val": "7"
  },
  {
    "selector": ".menu-list",
    "prop": "padding-top",
    "val": "8"
  },
  {
    "selector": ".menu-list > .menu-list-content .menu-home-btn",
    "prop": "font-size",
    "val": "5"
  },
  {
    "selector": ".menu-list > .menu-list-content .menu-home-btn",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": ".menu-list > .menu-list-content .menu-home-btn",
    "prop": "line-height",
    "val": "10"
  },
  {
    "selector": ".menu-list > .menu-list-content .menu-home-btn:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li",
    "prop": "line-height",
    "val": "10"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li > h2",
    "prop": "font-size",
    "val": "5"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li .completion-holder",
    "prop": "right",
    "val": "2"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li .completion-holder",
    "prop": "top",
    "val": "3.5"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li .completion-holder",
    "prop": "width",
    "val": "6"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li .completion-holder",
    "prop": "height",
    "val": "2"
  },
  {
    "selector": ".menu-list > .menu-list-content > ul > li .completion-holder",
    "prop": "border-radius",
    "val": "2"
  },
  {
    "selector": ".menu-list > .menu-list-content .policy-btn",
    "prop": "font-size",
    "val": "5"
  },
  {
    "selector": ".menu-list > .menu-list-content .policy-btn",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": ".menu-list > .menu-list-content .policy-btn",
    "prop": "line-height",
    "val": "10"
  },
  {
    "selector": ".menu-list > .menu-list-content .policy-btn:after",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "settings-bar .settings-nav-btn",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "settings-bar ul",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": "settings-bar ul li",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": "settings-bar ul li > p",
    "prop": "bottom",
    "val": "2.5"
  },
  {
    "selector": "settings-bar ul li > p",
    "prop": "font-size",
    "val": "4.0"
  },
  {
    "selector": ".quiz-category-sort .slide1",
    "prop": "border-radius",
    "val": "2"
  },
  {
    "selector": ".quiz-category-sort .slide1",
    "prop": "margin",
    "val": "0 5"
  },
  {
    "selector": ".quiz-category-sort .slide2",
    "prop": "border-radius",
    "val": "2"
  },
  {
    "selector": ".quiz-category-sort .slide2",
    "prop": "margin",
    "val": "0 5"
  },
  {
    "selector": ".quiz-category-sort .question-count",
    "prop": "right",
    "val": "36"
  },
  {
    "selector": ".quiz-category-sort .question-count",
    "prop": "top",
    "val": "2"
  },
  {
    "selector": ".quiz-category-sort .distractor",
    "prop": "height",
    "val": "11"
  },
  {
    "selector": ".quiz-category-sort .distractor",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": ".quiz-category-sort .next",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": ".padding",
    "prop": "padding",
    "val": "5"
  },
  {
    "selector": ".padding-fullLength",
    "prop": "padding",
    "val": "2.5"
  },
  {
    "selector": ".padding-small",
    "prop": "padding",
    "val": "2.5"
  },
  {
    "selector": ".padding-small-top",
    "prop": "padding-top",
    "val": "2.5"
  },
  {
    "selector": ".padding-small-bottom",
    "prop": "padding-bottom",
    "val": "2.5"
  },
  {
    "selector": ".padding-horz",
    "prop": "padding-left",
    "val": "6"
  },
  {
    "selector": ".padding-horz",
    "prop": "padding-right",
    "val": "6"
  },
  {
    "selector": ".padding-top",
    "prop": "padding-top",
    "val": "5"
  },
  {
    "selector": ".padding-bottom",
    "prop": "padding-bottom",
    "val": "5"
  },
  {
    "selector": ".padding-rightText",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".padding-rightText",
    "prop": "padding-left",
    "val": "2.5"
  },
  {
    "selector": ".padding-rightText",
    "prop": "padding-top",
    "val": "2.5"
  },
  {
    "selector": ".padding-rightText",
    "prop": "padding-bottom",
    "val": "2.5"
  }
];
var vhListPortrait = [
  {
    "selector": ".chapter-left > svg",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": "page",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "page .warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": "audio-scenario",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "audio-scenario .slide1",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "audio-scenario .slide2",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario .slide1",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario .slide2",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container page",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": ".background",
    "prop": "height",
    "val": "100"
  }
];
var vwListLandscape = [
  {
    "selector": ".splash .welcome-text",
    "prop": "margin-top",
    "val": "15"
  },
  {
    "selector": ".splash .welcome-text p",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": ".splash .choose-text",
    "prop": "font-size",
    "val": "2.3"
  },
  {
    "selector": ".splash .choose-text",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": ".splash .choose-text .distractor td",
    "prop": "line-height",
    "val": "2"
  },
  {
    "selector": ".splash .choose-text .distractor td",
    "prop": "padding",
    "val": "0.3"
  },
  {
    "selector": ".splash .choose-text .distractor td:first-child",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": ".splash .button-holder .begin-btn",
    "prop": "height",
    "val": "8"
  },
  {
    "selector": ".splash .button-holder .begin-btn",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": ".splash .button-holder .begin-btn",
    "prop": "line-height",
    "val": "8"
  },
  {
    "selector": "alert > .alert-pane",
    "prop": "top",
    "val": "10"
  },
  {
    "selector": "alert .alert-close",
    "prop": "top",
    "val": "29"
  },
  {
    "selector": "alert .alert-close",
    "prop": "width",
    "val": "6.0"
  },
  {
    "selector": "alert .alert-close",
    "prop": "height",
    "val": "6.0"
  },
  {
    "selector": "alert .alert-close",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "alert .alert-content-standard",
    "prop": "margin-top",
    "val": "4"
  },
  {
    "selector": "alert .alert-content-standard",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "alert .alert-content-standard p",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "alert .alert-content-standard p",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "margin",
    "val": "0 0 0 0.4"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "height",
    "val": "6.5"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "line-height",
    "val": "4.5"
  },
  {
    "selector": "alert .alert-btn-standard",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "alert > .alert-pane",
    "prop": "left",
    "val": "calc( 50"
  },
  {
    "selector": "alert .alert-close",
    "prop": "right",
    "val": "calc( 50"
  },
  {
    "selector": "accordion.vertical .accordion-bar",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "accordion.vertical .accordion-bar",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "accordion.vertical .accordion-bar",
    "prop": "margin-bottom",
    "val": "0.5"
  },
  {
    "selector": "accordion.vertical .accordion-bar .completion-check",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "accordion.vertical .accordion-bar .completion-check",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "accordion.vertical .accordion-bar .open-icon",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "accordion.vertical .accordion-bar .open-icon",
    "prop": "height",
    "val": "2.5"
  },
  {
    "selector": "accordion.vertical .accordion-bar .open-icon",
    "prop": "padding",
    "val": "0 1"
  },
  {
    "selector": "accordion.vertical .accordion-content-holder",
    "prop": "border-radius",
    "val": "1"
  },
  {
    "selector": "accordion.vertical .accordion-content",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-default .accordion-content-holder",
    "prop": "border-radius",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-default .accordion-content",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": "accordion.horizontal accordion-pane",
    "prop": "width",
    "val": "6"
  },
  {
    "selector": "accordion.horizontal accordion-pane",
    "prop": "margin-right",
    "val": ".25"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .completion-check",
    "prop": "padding-left",
    "val": ".5"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .completion-check",
    "prop": "width",
    "val": "3.5"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .completion-check",
    "prop": "height",
    "val": "3.5"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .open-icon",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .open-icon",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-bar .open-icon",
    "prop": "padding",
    "val": "0 1"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-content-holder",
    "prop": "border-radius",
    "val": "1"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-content-holder",
    "prop": "left",
    "val": "6.25"
  },
  {
    "selector": "accordion.horizontal accordion-pane .accordion-content",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": ".panel",
    "prop": "padding",
    "val": "5"
  },
  {
    "selector": "ol.orange-numbers li",
    "prop": "margin-bottom",
    "val": "2"
  },
  {
    "selector": "ol.orange-numbers li",
    "prop": "margin-left",
    "val": "5"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "left",
    "val": "-5"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "top",
    "val": "-0.5"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "ol.orange-numbers > li:before",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": ".direction::before",
    "prop": "width",
    "val": "4.5"
  },
  {
    "selector": ".direction::before",
    "prop": "height",
    "val": "4.5"
  },
  {
    "selector": ".direction::before",
    "prop": "margin-left",
    "val": "-5"
  },
  {
    "selector": ".direction::before",
    "prop": "margin-top",
    "val": "-1"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "flip-card.complete::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "flip-card.complete.light::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "right",
    "val": "1"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "top",
    "val": "1"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": ".popover-close-btn",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": ".popover-content-holder",
    "prop": "padding",
    "val": "3"
  },
  {
    "selector": ".chapter-left",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": ".chapter-right",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "top",
    "val": "calc( 50vh - 4"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "height",
    "val": "8"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "top",
    "val": "calc( 50vh - 4"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "height",
    "val": "8"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "margin-left",
    "val": "-1"
  },
  {
    "selector": "page",
    "prop": "width",
    "val": "100"
  },
  {
    "selector": "page",
    "prop": "padding",
    "val": "6"
  },
  {
    "selector": "page h1",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": "page h1",
    "prop": "line-height",
    "val": "5"
  },
  {
    "selector": "page h1",
    "prop": "margin-bottom",
    "val": "1.5"
  },
  {
    "selector": "page h2",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "page h2",
    "prop": "line-height",
    "val": "3.2"
  },
  {
    "selector": "page h2",
    "prop": "margin-bottom",
    "val": "1.5"
  },
  {
    "selector": "page p",
    "prop": "font-size",
    "val": "2.3"
  },
  {
    "selector": "page p",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "page p",
    "prop": "margin-bottom",
    "val": "1.5"
  },
  {
    "selector": "page .page-gap",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "page li",
    "prop": "font-size",
    "val": "2.3"
  },
  {
    "selector": "page li",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "page li",
    "prop": "margin-left",
    "val": "3"
  },
  {
    "selector": "page li",
    "prop": "margin-bottom",
    "val": "0.8"
  },
  {
    "selector": "page table th",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "page table th",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "page table th",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "page table td",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "page table td",
    "prop": "font-size",
    "val": "2.3"
  },
  {
    "selector": "page table td",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "width",
    "val": "50"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "left",
    "val": "25"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "height",
    "val": "20"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50vh - 10"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "line-height",
    "val": "2.8"
  },
  {
    "selector": ".warning-overlay .warning-pane .cancel",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": ".warning-overlay .warning-pane .cancel",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": ".warning-overlay .warning-pane .cancel",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": ".warning-overlay .warning-pane .cancel",
    "prop": "width",
    "val": "12"
  },
  {
    "selector": ".warning-overlay .warning-pane .continue",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": ".warning-overlay .warning-pane .continue",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": ".warning-overlay .warning-pane .continue",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": ".warning-overlay .warning-pane .continue",
    "prop": "width",
    "val": "12"
  },
  {
    "selector": "page",
    "prop": "margin-left",
    "val": "calc( (100"
  },
  {
    "selector": "page",
    "prop": "margin-right",
    "val": "calc( (100"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[pop-over-trigger].complete::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[pop-over-trigger].complete.light::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": "[click-reveal].complete.light::after",
    "prop": "right",
    "val": "0.5"
  },
  {
    "selector": "direction",
    "prop": "margin-bottom",
    "val": "1.5"
  },
  {
    "selector": ".icon-holder",
    "prop": "width",
    "val": "4.5"
  },
  {
    "selector": ".icon-holder",
    "prop": "height",
    "val": "4.5"
  },
  {
    "selector": ".icon-holder",
    "prop": "min-width",
    "val": "4.5"
  },
  {
    "selector": ".icon-holder",
    "prop": "min-height",
    "val": "4.5"
  },
  {
    "selector": ".icon-holder",
    "prop": "max-width",
    "val": "4.5"
  },
  {
    "selector": ".icon-holder",
    "prop": "max-height",
    "val": "4.5"
  },
  {
    "selector": ".instruction-holder",
    "prop": "font-size",
    "val": "2.3"
  },
  {
    "selector": "quiz-topics .radioBTN",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "quiz-topics .radioBTN svg",
    "prop": "height",
    "val": "2"
  },
  {
    "selector": "quiz-topics .question-count",
    "prop": "right",
    "val": "6"
  },
  {
    "selector": "quiz-topics .summary",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-topics .question",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-topics .question .distractor",
    "prop": "margin-bottom",
    "val": "1"
  },
  {
    "selector": "quiz-topics .question .distractor td",
    "prop": "line-height",
    "val": "2"
  },
  {
    "selector": "quiz-topics .question .distractor td",
    "prop": "padding",
    "val": "0.3"
  },
  {
    "selector": "quiz-topics .question .distractor td:first-child",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "quiz-topics .question .stem",
    "prop": "font-size",
    "val": "2.75"
  },
  {
    "selector": "quiz-topics .question .stem",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-topics .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "quiz-topics .question .stem P",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "quiz-topics .question .stem P",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-topics .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-topics .next",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-topics .retry",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-topics .submit:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": "quiz-topics .next:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": "quiz-topics .retry:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": "quiz-game .radioBTN",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "quiz-game .radioBTN svg",
    "prop": "height",
    "val": "2"
  },
  {
    "selector": "quiz-game .question-count",
    "prop": "right",
    "val": "6"
  },
  {
    "selector": "quiz-game .summary",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-game .question",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "quiz-game .question .stem",
    "prop": "font-size",
    "val": "2.75"
  },
  {
    "selector": "quiz-game .question .stem",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-game .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "quiz-game .question .stem P",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "quiz-game .question .stem P",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-game .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-game .next",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "quiz-game .next",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-game .next",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-game .next",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "quiz-game .retry",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "quiz-game .submit:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": "quiz-game .next:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": "quiz-game .retry:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": ".chapter1_page12 .popover1",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 popover2",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover3",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover4",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover5",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover1",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover2",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover3",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover4",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter1_page12 .popover5",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": "knowledge-check .radioBTN",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "knowledge-check .radioBTN svg",
    "prop": "height",
    "val": "2"
  },
  {
    "selector": "knowledge-check .summary",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "knowledge-check .question .distractor td",
    "prop": "line-height",
    "val": "2"
  },
  {
    "selector": "knowledge-check .question .distractor td",
    "prop": "padding",
    "val": "0.3"
  },
  {
    "selector": "knowledge-check .question .distractor td:first-child",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "knowledge-check .question .stem",
    "prop": "font-size",
    "val": "2.75"
  },
  {
    "selector": "knowledge-check .question .stem",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "knowledge-check .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "knowledge-check .question .stem P",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "knowledge-check .question .stem P",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "knowledge-check .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "knowledge-check .submit:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": "audio-scenario",
    "prop": "height",
    "val": "calc( 100vh - 10"
  },
  {
    "selector": "audio-scenario .radioBTN",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "audio-scenario .radioBTN svg",
    "prop": "height",
    "val": "2"
  },
  {
    "selector": "audio-scenario .scenario-bar",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": "audio-scenario .scenario-bar",
    "prop": "padding",
    "val": "0.5"
  },
  {
    "selector": "audio-scenario .scenario-bar .nextBTN",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "audio-scenario .scenario-bar .nextBTN",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": "audio-scenario .scenario-bar .previousBTN",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "audio-scenario .scenario-bar .previousBTN",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder",
    "prop": "margin-left",
    "val": "12"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .icon",
    "prop": "width",
    "val": "4"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .icon",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .icon",
    "prop": "margin-left",
    "val": "-5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .track",
    "prop": "top",
    "val": "1.75"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .track",
    "prop": "height",
    "val": "0.75"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .progress",
    "prop": "height",
    "val": "0.75"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "top",
    "val": "1.2"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "width",
    "val": "1"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "height",
    "val": "2"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .thumb",
    "prop": "border-radius",
    "val": "3.5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "top",
    "val": "-1.6"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "left",
    "val": "-5.5"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "audio-scenario .scenario-bar .audio-holder .play-pause",
    "prop": "height",
    "val": "3"
  },
  {
    "selector": "audio-scenario .slide1",
    "prop": "height",
    "val": "calc( 100vh - 15"
  },
  {
    "selector": "audio-scenario .slide2",
    "prop": "height",
    "val": "calc( 100vh - 15"
  },
  {
    "selector": "audio-scenario .question",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "audio-scenario .question .distractor td",
    "prop": "line-height",
    "val": "2"
  },
  {
    "selector": "audio-scenario .question .distractor td",
    "prop": "padding",
    "val": "0.3"
  },
  {
    "selector": "audio-scenario .question .distractor td:first-child",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "audio-scenario .question .stem",
    "prop": "font-size",
    "val": "2.75"
  },
  {
    "selector": "audio-scenario .question .stem",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "audio-scenario .question .stem",
    "prop": "margin-bottom",
    "val": "6"
  },
  {
    "selector": "audio-scenario .question .stem P",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "audio-scenario .question .stem P",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "line-height",
    "val": "3"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "padding",
    "val": "1"
  },
  {
    "selector": "audio-scenario .question .submit",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": "audio-scenario .question .submit:after",
    "prop": "padding-left",
    "val": "0.7"
  },
  {
    "selector": "branching-scenario",
    "prop": "height",
    "val": "calc( 100vh - 10"
  },
  {
    "selector": "branching-scenario .slide1",
    "prop": "height",
    "val": "calc( 100vh - 10"
  },
  {
    "selector": "branching-scenario .slide2",
    "prop": "height",
    "val": "calc( 100vh - 10"
  },
  {
    "selector": "sound-control .icon",
    "prop": "width",
    "val": "6"
  },
  {
    "selector": "sound-control .icon",
    "prop": "height",
    "val": "6"
  },
  {
    "selector": "sound-control h2",
    "prop": "font-size",
    "val": "3"
  },
  {
    "selector": "sound-control h2",
    "prop": "line-height",
    "val": "6"
  },
  {
    "selector": "sound-control h2",
    "prop": "left",
    "val": "7"
  },
  {
    "selector": "sound-control h2",
    "prop": "width",
    "val": "85"
  },
  {
    "selector": "#menu-tile-list",
    "prop": "margin",
    "val": "9"
  },
  {
    "selector": "menu-tile .tile-content",
    "prop": "height",
    "val": "23"
  },
  {
    "selector": "menu-tile .tile-content > h2",
    "prop": "width",
    "val": "calc( 100% - 2"
  },
  {
    "selector": "menu-tile .tile-content > h2",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "16.4"
  },
  {
    "selector": "menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "6"
  },
  {
    "selector": "menu-tile > .tile-background",
    "prop": "height",
    "val": "23"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "width",
    "val": "14"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "height",
    "val": "14"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "bottom",
    "val": "3"
  },
  {
    "selector": "menu-tile .menu-icon",
    "prop": "right",
    "val": "calc( 50% - 7"
  },
  {
    "selector": ".welcome",
    "prop": "margin-right",
    "val": "70"
  },
  {
    "selector": ".welcome menu-tile .tile-content",
    "prop": "height",
    "val": "11.5"
  },
  {
    "selector": ".welcome menu-tile .tile-content > h2",
    "prop": "width",
    "val": "calc( 100% - 2"
  },
  {
    "selector": ".welcome menu-tile .tile-content > h2",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": ".welcome menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "31.5"
  },
  {
    "selector": ".welcome menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "9"
  },
  {
    "selector": ".welcome menu-tile .tile-content:after",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": ".welcome menu-tile .tile-content:after",
    "prop": "left",
    "val": "20.75"
  },
  {
    "selector": ".welcome menu-tile .tile-content:after",
    "prop": "top",
    "val": "5"
  },
  {
    "selector": ".welcome menu-tile > .tile-background",
    "prop": "height",
    "val": "11.5"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "width",
    "val": "9"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "height",
    "val": "9"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "bottom",
    "val": "1"
  },
  {
    "selector": ".welcome menu-tile .menu-icon",
    "prop": "left",
    "val": "2"
  },
  {
    "selector": ".completion menu-tile .tile-content",
    "prop": "height",
    "val": "11.5"
  },
  {
    "selector": ".completion menu-tile .tile-content > h2",
    "prop": "width",
    "val": "calc( 75% - 2"
  },
  {
    "selector": ".completion menu-tile .tile-content > h2",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": ".completion menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "31.5"
  },
  {
    "selector": ".completion menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "9"
  },
  {
    "selector": ".completion menu-tile > .tile-background",
    "prop": "height",
    "val": "11.5"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "width",
    "val": "9"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "height",
    "val": "9"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "bottom",
    "val": "1"
  },
  {
    "selector": ".completion menu-tile .menu-icon",
    "prop": "right",
    "val": "1"
  },
  {
    "selector": ".front-page",
    "prop": "margin-left",
    "val": "calc( (100"
  },
  {
    "selector": ".welcome",
    "prop": "margin-right",
    "val": "70"
  },
  {
    "selector": ".welcome menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "31.5"
  },
  {
    "selector": ".welcome menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "9"
  },
  {
    "selector": ".completion menu-tile .tile-content > .sequence-count",
    "prop": "top",
    "val": "31.5"
  },
  {
    "selector": ".completion menu-tile .tile-content > .sequence-count",
    "prop": "font-size",
    "val": "9"
  },
  {
    "selector": ".chapter2_page1 .panel",
    "prop": "padding-top",
    "val": "2.5"
  },
  {
    "selector": ".chapter2_page1 .panel",
    "prop": "padding-bottom",
    "val": "2.5"
  },
  {
    "selector": ".chapter2_page1 .panel",
    "prop": "padding-left",
    "val": "2.5"
  },
  {
    "selector": ".chapter2_page1 .panel1 .stack1",
    "prop": "padding-left",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover1",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 popover2",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover3",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover4",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover5",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover1",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover2",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover3",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover4",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page1 .popover5",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover1",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 popover2",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover3",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover4",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover5",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover1",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover2",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover3",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover4",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": ".chapter3_page10 .popover5",
    "prop": "padding-right",
    "val": "2.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "width",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "line-height",
    "val": "4"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "top",
    "val": "6"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "padding",
    "val": "0 2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "height",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "width",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "padding-left",
    "val": "1"
  },
  {
    "selector": "chapter-tiles .chapter-tile-header .completion-display check",
    "prop": "margin-top",
    "val": "-1.2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "margin-top",
    "val": "10"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "height",
    "val": "calc( 100vh - 14"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "padding",
    "val": "4"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile",
    "prop": "height",
    "val": "22"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile",
    "prop": "margin-right",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile h2",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder .chapter-tile h2",
    "prop": "line-height",
    "val": "2.7"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container page",
    "prop": "margin-top",
    "val": "10"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container page",
    "prop": "height",
    "val": "calc( 100vh - 10"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "width",
    "val": "50"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "left",
    "val": "25"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "height",
    "val": "20"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50vh - 10"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "font-size",
    "val": "2.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "line-height",
    "val": "2.8"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .cancel",
    "prop": "width",
    "val": "12"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "padding",
    "val": "1.5"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "bottom",
    "val": "2"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane .continue",
    "prop": "width",
    "val": "12"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "margin-left",
    "val": "calc( (100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-pane",
    "prop": "left",
    "val": "calc( 50"
  },
  {
    "selector": ".bar",
    "prop": "width",
    "val": "100"
  },
  {
    "selector": ".bar",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": ".bar",
    "prop": "padding-top",
    "val": "1"
  },
  {
    "selector": ".bar",
    "prop": "box-shadow",
    "val": "0 .2"
  },
  {
    "selector": ".logo",
    "prop": "left",
    "val": "2.5"
  },
  {
    "selector": ".logo",
    "prop": "top",
    "val": "2"
  },
  {
    "selector": ".logo",
    "prop": "width",
    "val": "12"
  },
  {
    "selector": ".logo",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": ".menu-title",
    "prop": "left",
    "val": "15.5"
  },
  {
    "selector": ".menu-title",
    "prop": "top",
    "val": "1.75"
  },
  {
    "selector": ".menu-title",
    "prop": "width",
    "val": "67"
  },
  {
    "selector": ".menu-title",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": ".menu-title",
    "prop": "font-size",
    "val": "2.7"
  },
  {
    "selector": ".exit-btn",
    "prop": "top",
    "val": "1.8"
  },
  {
    "selector": ".exit-btn",
    "prop": "font-size",
    "val": "1.3"
  },
  {
    "selector": ".exit-btn",
    "prop": "line-height",
    "val": "1.8"
  },
  {
    "selector": ".exit-btn",
    "prop": "padding",
    "val": "0.25"
  },
  {
    "selector": ".menu-btn",
    "prop": "top",
    "val": "0.5"
  },
  {
    "selector": ".menu-btn",
    "prop": "padding-top",
    "val": ".3"
  },
  {
    "selector": ".menu-btn",
    "prop": "width",
    "val": "4.5"
  },
  {
    "selector": ".menu-btn",
    "prop": "right",
    "val": "1"
  },
  {
    "selector": ".menu-btn > svg",
    "prop": "height",
    "val": "4.5"
  },
  {
    "selector": ".menu-btn > p",
    "prop": "font-size",
    "val": "2"
  },
  {
    "selector": ".menu-btn > p",
    "prop": "margin-bottom",
    "val": "0.4"
  },
  {
    "selector": ".menu-btn > p",
    "prop": "margin-top",
    "val": "-0.4"
  },
  {
    "selector": ".menu-list-background",
    "prop": "top",
    "val": "6"
  },
  {
    "selector": ".menu-list",
    "prop": "padding-top",
    "val": "6.0"
  },
  {
    "selector": ".menu-list .bar",
    "prop": "width",
    "val": "100"
  },
  {
    "selector": ".menu-list .bar",
    "prop": "height",
    "val": "5"
  },
  {
    "selector": ".menu-list .bar",
    "prop": "padding-top",
    "val": "1"
  },
  {
    "selector": ".menu-list .bar h1",
    "prop": "font-size",
    "val": "4"
  },
  {
    "selector": ".menu-list .logo",
    "prop": "left",
    "val": "1"
  },
  {
    "selector": ".menu-list .logo",
    "prop": "top",
    "val": "1"
  },
  {
    "selector": ".menu-list .logo",
    "prop": "width",
    "val": "12"
  },
  {
    "selector": ".menu-list .logo",
    "prop": "height",
    "val": "4"
  },
  {
    "selector": ".bar",
    "prop": "width",
    "val": "100"
  },
  {
    "selector": "settings-bar .settings-nav-btn",
    "prop": "width",
    "val": "3"
  },
  {
    "selector": "settings-bar ul",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": "settings-bar ul li",
    "prop": "height",
    "val": "10"
  },
  {
    "selector": "settings-bar ul li > p",
    "prop": "bottom",
    "val": "2.5"
  },
  {
    "selector": "settings-bar ul li > p",
    "prop": "font-size",
    "val": "3.5"
  },
  {
    "selector": ".quiz-category-sort .slide1",
    "prop": "border-radius",
    "val": "2"
  },
  {
    "selector": ".quiz-category-sort .slide1",
    "prop": "margin",
    "val": "0 5"
  },
  {
    "selector": ".quiz-category-sort .slide2",
    "prop": "border-radius",
    "val": "2"
  },
  {
    "selector": ".quiz-category-sort .slide2",
    "prop": "margin",
    "val": "0 5"
  },
  {
    "selector": ".quiz-category-sort .question-count",
    "prop": "right",
    "val": "40"
  },
  {
    "selector": ".quiz-category-sort .question-count",
    "prop": "top",
    "val": "2.5"
  },
  {
    "selector": ".quiz-category-sort .distractor",
    "prop": "height",
    "val": "7"
  },
  {
    "selector": ".quiz-category-sort .distractor",
    "prop": "padding",
    "val": "2"
  },
  {
    "selector": ".quiz-category-sort .next",
    "prop": "margin",
    "val": "5"
  },
  {
    "selector": ".padding",
    "prop": "padding",
    "val": "5"
  },
  {
    "selector": ".padding-small",
    "prop": "padding",
    "val": "2.5"
  },
  {
    "selector": ".padding-small-top",
    "prop": "padding-top",
    "val": "2.5"
  },
  {
    "selector": ".padding-small-bottom",
    "prop": "padding-bottom",
    "val": "2.5"
  },
  {
    "selector": ".padding-horz",
    "prop": "padding-left",
    "val": "6"
  },
  {
    "selector": ".padding-horz",
    "prop": "padding-right",
    "val": "6"
  },
  {
    "selector": ".padding-top",
    "prop": "padding-top",
    "val": "5"
  },
  {
    "selector": ".padding-bottom",
    "prop": "padding-bottom",
    "val": "5"
  }
];
var vhListLandscape = [
  {
    "selector": ".chapter-left",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": ".chapter-right",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": "page",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": ".warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": ".chapter-left",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": ".chapter-right",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": ".chapter-left > svg",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": ".chapter-right > svg",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": "page",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "audio-scenario",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "audio-scenario .slide1",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "audio-scenario .slide2",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "audio-scenario",
    "prop": "max-height",
    "val": "calc( 100"
  },
  {
    "selector": "audio-scenario .slide1",
    "prop": "max-height",
    "val": "calc( 100"
  },
  {
    "selector": "audio-scenario .slide2",
    "prop": "max-height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario .slide1",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario .slide2",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario",
    "prop": "max-height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario .slide1",
    "prop": "max-height",
    "val": "calc( 100"
  },
  {
    "selector": "branching-scenario .slide2",
    "prop": "max-height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container page",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-overlay .warning-pane",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": "chapter-tiles",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-tile-holder",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container",
    "prop": "height",
    "val": "100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .chapter-container page",
    "prop": "height",
    "val": "calc( 100"
  },
  {
    "selector": "chapter-tiles .chapter-tile-container .warning-pane",
    "prop": "top",
    "val": "calc( 50"
  },
  {
    "selector": ".background",
    "prop": "height",
    "val": "100"
  }
];
var viewportWidth = $(window).width();
var viewportHeight = $(window).height();
var is_safari_or_uiwebview = /(iPhone|iPod|iPad).+AppleWebKit/g.test(window.navigator.userAgent);

function getStyle(selectorText)
{
    var theRules = [];
    if (document.styleSheets[2].cssRules) {
        theRules = document.styleSheets[2].cssRules;
    }
    else if (document.styleSheets[2].rules) {
        theRules = document.styleSheets[2].rules;
    }
    for (var n in theRules)
    {
        if (theRules[n].selectorText === selectorText)   {
            return theRules[n];
        }
    }
    return false;
}

function updateCSS(list, unit){

    for(var s in list)
    {
        var myStyle = getStyle(list[s].selector);
        if(unit === "vw") {
            //console.log(list[s]);
            //console.log(list[s].prop);
            if(myStyle.style) {
                myStyle.style[list[s].prop] = (list[s].val * viewportWidth) / 100 + 'px';
                //console.log("VW: "+myStyle.style[list[s].prop]+" = ("+list[s].val+" * "+viewportWidth+") / 100 + px");
                //console.log(myStyle);
            }
        }else{
           if(myStyle.style) {
               myStyle.style[list[s].prop] = (list[s].val * viewportHeight) / 100 + 'px';
               //console.log("VH: "+myStyle.style[list[s].prop]+" = ("+list[s].val+" * "+viewportHeight+") / 100 + px");
               //console.log(myStyle);
           }
        }
    }
}

if(is_safari_or_uiwebview)
{
    //console.log("Safari polyfill");
    Modernizr.cssvhunit = false;
}

//Modernizr.cssvhunit = false;
//Modernizr.cssvwunit = false;

$(window).on('resize', function () {
    /*var val1 = $(window).width();
    var val2 = $(window).height();
    if (val1 > val2) {
        viewportWidth = $(window).width();
        viewportHeight = $(window).height();
    } else {
        viewportWidth = $(window).height();
        viewportHeight = $(window).width();
    }*/
    viewportWidth = $(window).width();
    viewportHeight = $(window).height();
    if(!Modernizr.cssvhunit) {
        //console.log("VH");
        if (viewportHeight > viewportWidth) {
            updateCSS(vhListPortrait, "vh");
        }
        else {
            updateCSS(vhListLandscape, "vh");
        }
    }
    if(!Modernizr.cssvwunit) {
        //console.log("vw");
        if(viewportHeight > viewportWidth){
            updateCSS(vwListPortrait, "vw");
        }
        else{
            updateCSS(vwListLandscape, "vw");
        }
    }
});

if(!Modernizr.cssvhunit) {
    if (viewportHeight > viewportWidth) {
        updateCSS(vhListPortrait, "vh");
    }
    else {
        updateCSS(vhListLandscape, "vh");
    }
}

if(!Modernizr.cssvwunit) {
    if (viewportHeight > viewportWidth) {
        updateCSS(vwListPortrait, "vw");
    }
    else {
        updateCSS(vwListLandscape, "vw");
    }
}
