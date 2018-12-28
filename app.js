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
    .factory('audioService', ['$interval', function ($interval) {
.
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
};
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
        .directive('gateAdapter', ['stateService', function (stateService) {
.directive('splashChooseBranch', ['chapterService','stateService', 'settingsService', '$timeout', function(chapterService, stateService, settingsService, $timeout) {
.directive('accordion', function() {
.directive('animationCustom', ['chapterService','stateService', '$timeout', function(chapterService, stateService, $timeout) {
.directive('ddrop', ['$sce', 'lmsService', 'stateService', '$timeout', function ($sce, lmsService, stateService, $timeout) {
.directive('flipCard', ["$timeout", function($timeout) {
.directive('mobileSwitch', ['$sce', 'stateService', function ($sce, stateService) {
.directive('clickComplete', function() {
.directive('inlineViewportPolyfill', function(){
.directive('popOver',[ 'stateService','$timeout', function(stateService, $timeout) {
.directive('popOverTrigger', ["$timeout", function($timeout) {
.directive('clickReveal', ["$timeout", function($timeout) {
.directive('direction', ['stateService', '$timeout', function (stateService, $timeout) {
.
.
.directive('knowledgeCheck', ['$sce', 'lmsService', 'stateService', '$timeout', function ($sce, lmsService, stateService, $timeout) {
.directive('interactiveWatch', function() {
.directive('audioScenario', ['$sce', 'audioService', 'stateService', '$timeout', function($sce, audioService, stateService, $timeout) {
.directive('branchingScenario', ['$compile', 'stateService', '$timeout', function($compile, stateService, $timeout) {
.directive('video', function() {
.directive('autoReveal', function() {
.directive('soundControl', ['audioService', '$timeout', function(audioService, $timeout) {
.controller('bookmark', ['$scope', 'stateService', 'chapterService','settingsService', function($scope, stateService, chapterService, settingService) {
.directive('menuTile', function() {
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