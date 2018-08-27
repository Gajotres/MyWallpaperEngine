angular.module('GoogleCalendar', []).directive('googleCalendar', function(){
  return {
    restrict: 'E',
    scope: {
      gcConfig: '=',
      hash: '=?'
    },
    templateUrl: 'template/google-calendar.html',
    controller: ['$filter', '$http', '$scope', function($filter, $http, $scope){

      if (!$scope.gcConfig.google_key) {
        throw('Missing required config google_key');
      }

      if (!$scope.gcConfig.calendar_id) {
        throw('Missing required config calendar_id');
      }

      /**
       * Must check if ngSanitize is
       * a part of the project for
       * binding description html
       */
       try {
        angular.module("ngSanitize");
        sanitize =  true;
      } catch (err) {
        sanitize = null;
      }

      var defaults = {
        max: 10,
        hideTitle: false,
        sanitize: sanitize,
        dateTimeFilter: 'd. MMM HH.mm',
        dateFilter: 'dd MMM',
        shortDateFilter: 'EEE',
        htmlDesc: false,
        calendar_name: false
      };

      $scope.gcConfig = angular.extend(defaults, $scope.gcConfig);

      fulldayFilter = function(date) {
        return $filter('date')(date, $scope.gcConfig.dateFilter)
      };

      timedFilter = function(date) {
        return $filter('date')(date, $scope.gcConfig.dateTimeFilter);
      };

      formatDateFilter = function(date) {
        return $filter('date')(date, $scope.gcConfig.shortDateFilter);
      };      

      $scope.sameDay = function(date1, date2) {
        $scope.date1 = new Date(date1);
        $scope.date2 = new Date(date2);
        $scope.date2.setDate($scope.date2.getDate() - 1);

        return $scope.date1.getFullYear() === $scope.date2.getFullYear() && $scope.date1.getMonth() === $scope.date2.getMonth() && $scope.date1.getDate() === $scope.date2.getDate();
      };

      $scope.startDate = function(event) {
        return (event.start.date) ? fulldayFilter(event.start.date) : "";
      };    

      $scope.formatPeriod = function(event) {
        return $scope.sameDay(event.start.date, event.end.date) ? "ALL DAY" : $scope.start + " - " + $scope.end;
      };

      $scope.formatDate = function(event) {
        return formatDateFilter(event.start.date)
      };      

      $scope.start = function(event){
        if (event.start.date) {
          return fulldayFilter(event.start.date);
        } else if (event.start.dateTime) {
          return timedFilter(event.start.dateTime);
        }
      };

      $scope.end = function(event){
        if (event.end.date) {
          var d = new Date(event.end.date);
          d.setDate(d.getDate() - 1);
          return fulldayFilter(d);
        } else if (event.end.dateTime) {
          return timedFilter(event.end.dateTime);
        }
      };

      $scope.formatdate = function(event){
        if (event.start.date) {
          return fulldayFilter(event.start.date);
        } else if (event.start.dateTime) {
          return timedFilter(event.start.dateTime);
        }
      };      

      var url = "https://www.googleapis.com/calendar/v3/calendars/" + $scope.gcConfig.calendar_id + "/events?orderBy=startTime&singleEvents=true&timeMin=" + (new Date().toISOString()) + "&maxResults=" + $scope.gcConfig.max + "&key=" + $scope.gcConfig.google_key;

      $http.get(url).success(function(data){
        $scope.calendar = data;
        if (!$scope.gcConfig.hideTitle && !$scope.gcConfig.calendar_name)
          angular.extend($scope.gcConfig, { calendar_name: data.summary })
      });
    }]
  };
});

angular.module('TrelloTasks', []).directive('trelloTasks', function(RestHandler, $interval){
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'template/trello-tasks.html',
    controller: ['$filter', '$http', '$scope', function($filter, $http, $scope){

      $scope.defaults = {
        dateFilter: 'dd MMM',
        shortDateFilter: 'EEE'
      };      

      $scope.formatdate = function(date) {
        return $filter('date')(date, $scope.defaults.dateFilter)
      }; 

      $scope.formatdateoftheweek = function(date) {
        return $filter('date')(date, $scope.defaults.shortDateFilter)
      };       

      $scope.getTasks = function() {
        RestHandler.getTasks(function (tasks) {

          /* Sort array by date */
          tasks.sort(function(a,b) { 
            return new Date(a.due).getTime() - new Date(b.due).getTime() 
          });

          $scope.tasks = tasks;
        });
      } 

      $interval(function () {
        $scope.getTasks();
      }, 600000);

      $scope.getTasks();
    }]
  };
});

angular.module('DigitalClock', []).directive('digitalClock', function($interval){
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'template/digital-clock.html',
    controller: ['$filter', '$http', '$scope', function($filter, $http, $scope){

      $scope.c = null;
      $scope.d = null;
      $scope.classList = ['visible', 'close', 'far', 'far', 'distant', 'distant'];
      $scope.use24HourClock = true;
      $scope.size = 86;
      $scope.columns = Array.from(document.getElementsByClassName('column'));

      function padClock(p, n) {
        return p + ('0' + n).slice(-2);
      }

      $scope.getClock = function() {
        $scope.d = new Date();
        return [$scope.use24HourClock ? $scope.d.getHours() : $scope.d.getHours() % 12 || 12,$scope.d.getMinutes(),$scope.d.getSeconds()].

        reduce(padClock, '');
      }

      $scope.getClass = function(n, i2) {
        return $scope.classList.find(function (class_, classIndex) {return Math.abs(n - i2) === classIndex;}) || '';
      }

      $interval(function () {
        $scope.c = $scope.getClock();

        $scope.columns.forEach(function (ele, i) {
          $scope.n = + $scope.c[i];
          $scope.offset = - $scope.n * $scope.size;
          ele.style.transform = 'translateY(calc(50vh + ' + $scope.offset + 'px - ' + $scope.size / 2 + 'px))';

          angular.forEach(ele.children, function(ele2, i2) {
            ele2.className = 'num ' + $scope.getClass($scope.n, i2);
          });
        });
      }, 200 + Math.E * 10);
    }]
  };
});

angular.module('WeekWeather', []).directive('weekWeather', function(RestHandler, $interval){
  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'template/week-weather.html',
    controller: ['$filter', '$http', '$scope', function($filter, $http, $scope){

      $scope.getWeather = function() {

        $scope.forcast = [];

        RestHandler.getWeather(function (weather) {

          var days = [], output = [], i;
          for( i = 0; i < weather.list.length; i++) {
            var weekDay = weather.list[i].dt_txt.substr(0, 10);
            if( days[weekDay]) continue;
            days[weekDay] = true;
            output.push(weekDay);
          }

          angular.forEach(output, function(day, j) {

            var dayOutput = {
              'day' : day,
              'max_temp' : '',
              'min_temp' : '',
              'weather' : ''
            }

            angular.forEach(weather.list, function(el, k) {
              if(day == el.dt_txt.substr(0, 10)) {
                var time = el.dt_txt.substr(11, 16);
                if(time == "15:00:00") {
                  dayOutput.max_temp = Math.round(el.main.temp);
                  dayOutput.weather  = el.weather[0].main
                } else if (time = "03:00:00") {
                  dayOutput.min_temp = Math.round(el.main.temp);
                }
              }
            });

            $scope.forcast.push(dayOutput);

          });          

        });
      } 

      $interval(function () {
        $scope.getWeather();
      }, 600000);

      $scope.getWeather();

    }]
  };
});