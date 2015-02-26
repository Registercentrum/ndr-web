/*global angular*/
(function () {
    "use strict";

    var app = angular.module('myApp', ['ng-admin']);

    app.directive('customPostLink', ['$location', function ($location) {
        return {
            restrict: 'E',
            template: '<p class="form-control-static"><a ng-click="displayPost(entry)">View&nbsp;post</a></p>',
            link: function ($scope) {
                $scope.displayPost = function (entry) {
                    var postId = entry.values.newsID;

                    console.log(entry);

                    $location.path('/edit/posts/' + postId);
                };
            }
        };
    }]);

    app.config(function (NgAdminConfigurationProvider, Application, Entity, Field, Reference, ReferencedList, ReferenceMany, RestangularProvider, $stateProvider) {
        var nga = NgAdminConfigurationProvider;


        function truncate(value) {
            if (!value) {
                return '';
            }

            return value.length > 75 ? value.substr(0, 75) + '...' : value;
        }

        RestangularProvider.setDefaultRequestParams({APIKey: 'jEGPvHoP7G4eMkjLQwE5'});

        var app = new Application('NDR Admin') // application main title
            .baseApiUrl('https://ndr.registercentrum.se/api/'); // main API endpoint

        var news = new Entity('News')
            .identifier(new Field('newsID'));


        var publications = new Entity('ResearchProject')
             .identifier(new Field('id'));

        // set the application entities
        app.addEntity(news);
        app.addEntity(publications);

        news.dashboardView()
            .title('Nyheter')
            // .order(1) // display the comment panel second in the dashboard
            // .limit(5)
            .fields([
                new Field('newsID').label('ID').order(0),
                new Field('title').map(truncate).order(1)
                // new Field() // template fields don't need a name in dashboard view
                //     .type('template') // a field which uses a custom template
                //     .label('Actions')
                //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                //     .order(2)
            ]);

        news.listView()
            .title('Nyheter')
            // .order(1) // display the comment panel second in the dashboard
            // .limit(5)
            .fields([
                new Field('newsID').label('ID').order(0),
                new Field('title').map(truncate).order(1),
                new Field('isInternal').label('Intern'),
                new Field('publishedFrom').label('Datum').type('date')

                // new Field() // template fields don't need a name in dashboard view
                //     .type('template') // a field which uses a custom template
                //     .label('Actions')
                //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                //     .order(2)
            ])
            .listActions(['edit', 'delete']);


        publications.dashboardView()
             .title('Publikationer')
             // .order(1) // display the comment panel second in the dashboard
             // .limit(5)
             .fields([
                 new Field('id').label('ID').order(0),
                 new Field('name').map(truncate).order(1)
                 // new Field() // template fields don't need a name in dashboard view
                 //     .type('template') // a field which uses a custom template
                 //     .label('Actions')
                 //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                 //     .order(2)
             ]);

        publications.listView()
             .title('Publikationer')
             .fields([
                 new Field('id').label('ID').order(0),
                 new Field('name').map(truncate).order(1)
             ])
             .listActions(['edit', 'delete']);


        news.creationView()
            .fields([
                /*new Field('createdAt')
                    .label('Created')
                    .type('date')
                    .defaultValue(new Date()), // preset fields in creation view with defaultValue*/
                new Field('publishedFrom')
                    .label('Publicerad')
                    .type('date')
                    .defaultValue(new Date()), // preset fields in creation view with defaultValue
                new Field('author').label('Av'),
                new Field('title').label('Titel'),
                new Field('image').label('Bild'),
                new Field('body').type('wysiwyg').label('Brödtext'),
                new Field('excerpt').type('text').label('Sammanfattning'),
                new Field('priority').label("Prioritet?"),
                new Field('isInternal').type('boolean').label("Intern?")
            ]);

        news.editionView()
            .fields([
                new Field('newsID'),
                news.creationView().fields()
            ]);


        publications.creationView()
             .fields([
                 new Field('name'),
                 new Field('laymansDescription').label('Titel'),
                 new Field('firstAuthor').label('Författare 1'),
             ]);

        publications.editionView()
            .fields([
                new Field('id'),
                publications.creationView().fields()
            ]);


        NgAdminConfigurationProvider.configure(app);
    });
}());
