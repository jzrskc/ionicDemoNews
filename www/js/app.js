(function () {

    angular.module('hackerNews', ['ionic', 'ui.router']);

    angular.module('hackerNews')
        .service('newsService', ['$q', '$http', newsService]);

    angular.module('hackerNews')
        .controller('newsController', ['$scope', '$ionicLoading', 'newsService', newsController]);

    angular.module('hackerNews')
        .run(configureIonic)
        .config(configureRoutes);

    function newsService($q, $http) {
        return {
            getStory: function (id) {
                return $http.get('https://hacker-news.firebaseio.com/v0/item/' + id + ".json?print=pretty'");
            },
            getTopStoriesIds: function () { return $http.get('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty'); },
            getTopStories: function () {
                var deffered = $q.defer();

                var ids = [];
                var stories = [];
                var getStory = this.getStory;

                this.getTopStoriesIds().then(function (topStories) {
                    ids = topStories.data;
                    ids = ids.slice(0, 32);

                    ids.forEach(function (id) {
                        getStory(id).then(function (story) {
                            stories.push(story.data);
                            deffered.resolve(stories);
                        });
                    });
                });

                return deffered.promise;
            }
        };
    }

    function newsController($scope, $ionicLoading, newsService) {
        var loadTopStories = function(didFinishLoading) {
            newsService.getTopStories().then(function (stories) {
                $scope.stories = stories;
                didFinishLoading && didFinishLoading();
            });
        };
        $scope.refresh = function() {
            loadTopStories($scope.$broadcast('scroll.refreshComplete'));
        };
        $scope.loadStoryInBrowser = function(story) {
            window.open(story.url, '_blank');
        };
        $ionicLoading.show({
            template: 'Loading...'
        });
        loadTopStories(function () { $ionicLoading.hide(); });
    }

    function configureRoutes($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('list', {
                url: '/list',
                templateUrl: 'views/list.html',
                controller: 'newsController'
            });

        $urlRouterProvider.otherwise('/list');
    }

    function configureIonic($ionicPlatform) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    };
})();