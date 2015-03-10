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
            
			if(value === '')
				return null;
			
			if (!value) {
                return '';
            }

            return value.length > 75 ? value.substr(0, 75) + '...' : value;
        }
		
        RestangularProvider.setDefaultRequestParams({APIKey: 'jEGPvHoP7G4eMkjLQwE5'});
		
		// RestangularProvider.addElementTransformer('news', function(element) {
			// console.log('test');
			
			// // for (i = 0; i < element.length; ++i) {
			
				// // var categories = [];
				// // if (element[i].categories != null) {
					// // for (i = 0; i < element[i].categories.length; ++i) {
						// // categories.push(element[i].categories[i].id);
					// // }
				// // }
				// // element[i].categories = categories;
			// // }
			
			// return element;
		// });
		
        var app = new Application('NDR Admin') // application main title
			.baseApiUrl('https://w8-038.rcvg.local/api/'); // main API endpoint
            //.baseApiUrl('https://ndr.registercentrum.se/api/'); // main API endpoint
		
		console.log(app);
		
        var news = new Entity('News')
            .identifier(nga.field('newsID'))
			.label('Nyheter');
		
        var publications = new Entity('ResearchProject')
             .identifier(nga.field('id'))
			 .label('Forskningsprojekt');
			 
        var units = new Entity('Unit')
             .identifier(nga.field('unitID'))
			 .label('Enheter');
			 
        var users = new Entity('User')
             .identifier(nga.field('userID'))
			 .label('Användare');
		
		var newsCategories = new Entity('NewsCategory')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var unitTypes = new Entity('UnitType')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var counties = new Entity('County')
            .readOnly() // a readOnly entity has disabled creation, edition, and deletion views
			.identifier(nga.field('code'));
		
        // set the application entities
        app.addEntity(news);
		app.addEntity(units);
		app.addEntity(users);
		app.addEntity(publications);

        users.dashboardView()
            .title('Användare')
			//.limit(20)
            // .order(1) // display the comment panel second in the dashboard
            .fields([
                nga.field('userID').label('ID').order(0),
				nga.field('hsaid').label('HSAID').map(truncate).order(1),
                nga.field('firstName').label('Förnamn').map(truncate).order(1),
				nga.field('lastName').label('Efternamn').map(truncate).order(1)
                // new Field() // template fields don't need a name in dashboard view
                //     .type('template') // a field which uses a custom template
                //     .label('Actions')
                //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                //     .order(2)
            ]);		
		
       users.listView()
            .title('Användare')
			//.limit(30)
			.sortField('hsaid')
			//.infinitePagination(false)
			.perPage(50)
            // .order(1) // display the comment panel second in the dashboard
            .fields([
                nga.field('userID').label('ID').order(0),
				//nga.field('hsaid').label('HSAID').map(truncate),
                nga.field('firstName').label('Förnamn'),
				nga.field('lastName').label('Efternamn'),
				nga.field('email','email').label('E-post'),
				nga.field('isKas','boolean').label('KAS'),
				nga.field('isCoordinator','boolean').label('Koordinator'),
				nga.field('isAdministrator','boolean').label('Administratör')
            ])
            .listActions(['edit'])
			.filters([
				nga.field('q').label('Sök'),
			]);

        users.creationView()
			.title('Ny användare')
            .fields([
				nga.field('hsaid').label('HSAID').map(truncate),
                nga.field('firstName').label('Förnamn').map(truncate),
				nga.field('lastName').label('Efternamn').map(truncate),
				nga.field('workTitle').label('Titel').map(truncate),
				nga.field('email','email').label('E-post').map(truncate),
				nga.field('organization').label('Organisation').map(truncate),
				nga.field('isKas','boolean').label('KAS').map(truncate),
				nga.field('isCoordinator','boolean').label('Koordinator').map(truncate),
				nga.field('isAdministrator','boolean').label('Administratör').map(truncate)
            ]);
		
        users.editionView()
			.title('Uppdatera användare')
			.description('"{{ entry.values.hsaid }}"')
            .fields([
                //new Field('newsID'),
                users.creationView().fields()
            ]);	
		
        units.dashboardView()
            .title('Enheter')
			//.limit(20)
            // .order(1) // display the comment panel second in the dashboard
            .fields([
                nga.field('unitID').label('ID').order(0),
                nga.field('name').label('Enhetsnamn').map(truncate).order(1)
                // new Field() // template fields don't need a name in dashboard view
                //     .type('template') // a field which uses a custom template
                //     .label('Actions')
                //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                //     .order(2)
            ]);
			
        units.listView()
            .title('Enheter')
			//.limit(30)
			.sortField('name')
			//.infinitePagination(true)
			.perPage(50)
            // .order(1) // display the comment panel second in the dashboard
            .fields([
                nga.field('unitID').label('ID').order(0),
                nga.field('name').label('Enhetsnamn').map(truncate).order(1),
				nga.field('hsaid').label('HSAID').map(truncate).order(2),
				nga.field('manager').label('Verksamhetschef').map(truncate).order(2),
				nga.field('phone').label('Telefon').map(truncate).order(2),
            ])
            .listActions(['edit', 'delete'])
			.filters([
				nga.field('q').label('Sök'),
				nga.field('countyCode', 'reference')
					.label('Landsting')
					//.cssClasses('medium')
					//.map(truncate) // Allows to truncate values in the select
					.targetEntity(counties) // Select a target Entity
					.targetField(nga.field('name')), // Select a label Field
				nga.field('typeID', 'reference')
					.label('Typ')
					//.choices([{value: 1, label: 'Primärvårdsenhet'},{value: 2, label: 'Medicinklinik'}])
					//.map(truncate) // Allows to truncate values in the select
					.targetEntity(unitTypes) // Select a target Entity
					.targetField(nga.field('name')), // Select a label Field
				nga.field('notActive', 'boolean').label('Visa inaktiva')
			]);
		
        news.dashboardView()
            .title('Nyheter')
            // .order(1) // display the comment panel second in the dashboard
            // .limit(5)
            .fields([
                nga.field('newsID').label('ID').order(0),
                nga.field('title').label('Rubrik').map(truncate).order(1)
                // new Field() // template fields don't need a name in dashboard view
                //     .type('template') // a field which uses a custom template
                //     .label('Actions')
                //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                //     .order(2)
            ]);

        units.creationView()
			.title('Ny')
            .fields([
                nga.field('name').label('Enhetsnamn'),
				nga.field('isActive', 'boolean').label('Aktiv'),
				nga.field('countyCode', 'reference')
					.label('Landsting')
					.map(truncate) // Allows to truncate values in the select
					.targetEntity(counties) // Select a target Entity
					.targetField(nga.field('name')), // Select a label Field
				nga.field('typeID', 'reference')
					.label('Enhetstyp')
					.map(truncate) // Allows to truncate values in the select
					.targetEntity(unitTypes) // Select a target Entity
					.targetField(nga.field('name')), // Select a label Field
				nga.field('hsaid').label('HSAID').map(truncate),
                nga.field('street').label('Gatuadress'),
                nga.field('postalCode').label('Postadress'),
                nga.field('postalLocation').label('Postort'),
                nga.field('phone').label('Telefon'),
                nga.field('senderID').label('Sänd-ID'),
                nga.field('manager').label('Verksamhetschef'),
				nga.field('comment','text').label('Kommentar'),
				nga.field('lastUpdatedAt','date').label('Senast uppdaterad').editable(false)
            ]);
		
        units.editionView()
			.title('Uppdatera enhet')
			//.description('"{{ entry.values.name }}"')
            .fields([
                //new Field('newsID'),
                units.creationView().fields()
            ]);	
			
        news.listView()
            .title('Nyheter')
			.sortField('priority')
            // .order(1) // display the comment panel second in the dashboard
            // .limit(5)
            .fields([
                nga.field('newsID').label('ID').order(0),
                nga.field('title').label('Rubrik').map(truncate).order(1),
                nga.field('isInternal','boolean').label('Intern'),
                nga.field('publishedFrom', 'date').label('Datum'),
				nga.field('publishedTo', 'date').label('Datum')
                // new Field() // template fields don't need a name in dashboard view
                //     .type('template') // a field which uses a custom template
                //     .label('Actions')
                //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                //     .order(2)
            ])
            .listActions(['edit', 'delete'])
			.filters([
				nga.field('title').label('Sök rubrik'),
				nga.field('includeOutsidePeriod', 'boolean').label('Inkludera opublicerat'),
				nga.field('isInternal', 'boolean').label('Visa endast interna nyheter')
			]);	
			
        news.creationView()
			.title('Ny')
            .fields([
                /*new Field('createdAt')
                    .label('Created')
                    .type('date')
                    .defaultValue(new Date()), // preset fields in creation view with defaultValue*/
                nga.field('publishedFrom', 'date')
                    .label('Publicerad från')
					.format('yyyy-MM-dd'), // preset fields in creation view with defaultValue
                nga.field('publishedTo', 'date')
                    .label('Publicerad till')
					.format('yyyy-MM-dd'), // preset fields in creation view with defaultValue
				nga.field('categories', 'reference_many')
					.label('Kategorier')
					.targetEntity(newsCategories) // the tag entity is defined later in this file
					.targetField(nga.field('name')), // the field to be displayed in this list
				//new ReferenceMany('categories') // a Reference is a particular type of field that references another entity
				//	.targetEntity(newsCategories) // the tag entity is defined later in this file
				//	.targetField(nga.field('name')), // the field to be displayed in this list
                nga.field('author').label('Av'),
                nga.field('title').label('Titel'),
                nga.field('image').label('Bild'),
                nga.field('body','wysiwyg').label('Brödtext'),
                nga.field('excerpt','text').label('Sammanfattning'),
                nga.field('priority').label('Prioritet?'),
                nga.field('isInternal','boolean').label("Intern?")
            ]);
		
        news.editionView()
			.title('Uppdatera')
			.description('"{{ entry.values.title }}"')
            .fields([
                //new Field('newsID'),
                news.creationView().fields()
            ]);
			
        publications.dashboardView()
             .title('Forskningsprojekt')
             // .order(1) // display the comment panel second in the dashboard
             // .limit(5)
             .fields([
                 nga.field('id').label('ID').order(0),
                 nga.field('name').map(truncate).order(1)
                 // new Field() // template fields don't need a name in dashboard view
                 //     .type('template') // a field which uses a custom template
                 //     .label('Actions')
                 //     .template('<custom-post-link></custom-post-link>') // you can use custom directives, too
                 //     .order(2)
             ]);

        publications.listView()
             .title('Forskningsprojekt')
             .fields([
                 nga.field('id').label('ID').order(0),
                 nga.field('name').label('Titel').map(truncate).order(1)
             ])
             .listActions(['edit', 'delete']);

		
        publications.creationView()
		.title('Ny')
		.fields([
			nga.field('name').label('Titel'),
			nga.field('laymansDescription').type('text').label('Beskrivning'),
			nga.field('firstAuthor').label('Första författare'),
			nga.field('lastAuthor').label('Sista Författare'),
			nga.field('otherAuthor').label('Andra Författare'),
			nga.field('dateOfSubmission','date').label('Submitteringssdatum'),
			nga.field('dateOfPublication','date').label('Publiceringsdatum'),
			nga.field('magazine').label('Tidning'),
			nga.field('issue').label('Upplaga'),
			nga.field('pages').label('Sidor'),
			nga.field('image').label('Bild'),
			nga.field('pubMedURL').label('Länk till pubmed')
		]);

        publications.editionView()
			.title('Uppdatera')
			.description('"{{ entry.values.name }}"')
            .fields([
                //new Field('id'),
                publications.creationView().fields()
            ]);


        nga.configure(app);
    });
}());
