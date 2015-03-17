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

                    //console.log(entry);

                    $location.path('/edit/posts/' + postId);
                };
            }
        };
    }]);
	
    app.config(function (NgAdminConfigurationProvider, RestangularProvider, $stateProvider) {
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
				
        var app = nga.application('NDR Admin') // application main title
			//.baseApiUrl('https://w8-038.rcvg.local/api/'); // main API endpoint, Henrik utveckling
            .baseApiUrl('https://ndr.registercentrum.se/api/'); // main API endpoint
		

        var news = nga.entity('News')
		
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
		
        var app = nga.application('NDR Admin') // application main title
			//.baseApiUrl('https://w8-038.rcvg.local/api/'); // main API endpoint
            .baseApiUrl('https://ndr.registercentrum.se/api/'); // main API endpoint
		
		console.log(app);
		
        var news = new nga.entity('News')

            .identifier(nga.field('newsID'))
			.label('Nyheter');
		
        var publications = nga.entity('ResearchProject')
             .identifier(nga.field('id'))
			 .label('Forskningsprojekt');
			 
        var units = nga.entity('Unit')
             .identifier(nga.field('unitID'))
			 .label('Enheter');
			 
        var users = nga.entity('User')
             .identifier(nga.field('userID'))
			 .label('Användare');
		
		var accounts = nga.entity('Account')
			.identifier(nga.field('accountID'))
			.label('Användarkonton');
		
		var newsCategories = nga.entity('NewsCategory')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var unitTypes = nga.entity('UnitType')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var counties = nga.entity('County')
            .readOnly() // a readOnly entity has disabled creation, edition, and deletion views
			.identifier(nga.field('code'));
		
        // set the application entities
        app.addEntity(news)
			.addEntity(units)
			.addEntity(users)
			.addEntity(accounts)
			.addEntity(publications);
		
		// ****** ACCOUNTS ******
        accounts.dashboardView()
             .title('Användarkonton')
             .fields([
                 nga.field('unitName').label('Enhetsnamn').map(truncate),
				 nga.field('hsaid').label('HSAID').map(truncate)
             ]);

        accounts.listView()
             .title('Användarkonton')
			 .perPage(50)
             .fields([
				nga.field('unitID').label('Enhets-ID').map(truncate),
                 nga.field('unitName').label('Enhetsnamn').map(truncate),
				 nga.field('hsaid').label('HSAID').map(truncate)
             ])
			.filters([
				nga.field('q').label('Sök')
			])
			.listActions(['edit']);
		
        accounts.creationView()
			.title('Nytt användarkonto')
            .fields([
				nga.field('unitID').label('Enhets-ID').editable(false),
				nga.field('userID').label('Användar-ID'),
				nga.field('statusID', 'choice').label('Status')
					.choices(
						[{value: '1', label: 'Aktiv'},
						{value: '2', label: 'Second'}])
            ]);
		
        accounts.editionView()
			.title('Uppdatera användarkonto')
            .fields([
				nga.field('statusID', 'choice').label('Status')
					.choices(
						[{value: '1', label: 'First'},
						{value: '2', label: 'Second'}])
            ]);	
		
		
		// ****** USER ******
		users.dashboardView()
			.title('Användare')
			.fields([
				nga.field('userID').label('ID').order(0),
				nga.field('hsaid').label('HSAID').map(truncate).order(1),
				nga.field('firstName').label('Förnamn').map(truncate).order(1),
				nga.field('lastName').label('Efternamn').map(truncate).order(1)
			]);		
		
		users.listView()
			.title('Användare')
			.sortField('hsaid')
			.perPage(50)
			.fields([
				nga.field('firstName').label('Förnamn'),
				nga.field('lastName').label('Efternamn'),
				nga.field('email','email').label('E-post'),
				nga.field('isKAS','boolean').label('KAS'),
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
				nga.field('hsaid').label('HSAID').editable(false).map(truncate),
                nga.field('firstName').label('Förnamn').map(truncate),
				nga.field('lastName').label('Efternamn').map(truncate),
				nga.field('workTitle').label('Titel').map(truncate),
				nga.field('email','email').label('E-post').map(truncate),
				nga.field('organization').label('Organisation').map(truncate),
				nga.field('isKAS','boolean').label('KAS').map(truncate),
				nga.field('isCoordinator','boolean').label('Koordinator').map(truncate),
				nga.field('isAdministrator','boolean').label('Administratör').map(truncate)
            ]);
		
        users.editionView()
			.title('Uppdatera användare')
			.description('"{{ entry.values.hsaid }}"')
            .fields([
                users.creationView().fields()
            ]);	
		
		// ****** UNIT ******
        units.dashboardView()
            .title('Enheter')
            .fields([
                nga.field('unitID').label('NDR-ID').order(0),
                nga.field('name').label('Enhetsnamn').map(truncate).order(1)
            ]);
			
        units.listView()
            .title('Enheter')
			.sortField('name')
			.perPage(50)
            .fields([
                nga.field('unitID').label('NDR-ID').order(0),
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
					.targetEntity(counties) // Select a target Entity
					.targetField(nga.field('name')), // Select a label Field
				nga.field('typeID', 'reference')
					.label('Typ')
					.targetEntity(unitTypes) // Select a target Entity
					.targetField(nga.field('name')), // Select a label Field
				nga.field('notActive', 'boolean').label('Visa inaktiva')
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
			
		// ****** NEWS ******
        news.dashboardView()
            .title('Nyheter')
            .fields([
                nga.field('newsID').label('ID').order(0),
                nga.field('title').label('Rubrik').map(truncate).order(1)
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
                news.creationView().fields()
            ]);
		
		// ****** PUBLICATIONS ******
        publications.dashboardView()
             .title('Forskningsprojekt')
             .fields([
                 nga.field('id').label('ID').order(0),
                 nga.field('name').map(truncate).order(1)
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
				nga.field('laymansDescription','text').label('Beskrivning'),
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
                publications.creationView().fields()
            ]);
		

		// RestangularProvider.addElementTransformer('Account', true, function(elements) {
			
			// //do my stuff here
			// for (var i = 0, len = elements.length; i < len; i++) {
			  // elements[i].userID=elements[i].user.userID;
			  // elements[i].hsaid=elements[i].user.hsaid;
			  // elements[i].unitID=elements[i].unit.unitID;
			  // elements[i].unitName=elements[i].unit.name;
			// }
			// //console.log(elements);
			
			// return elements;
		// });
		RestangularProvider.addElementTransformer('Account', function(elements) {
			
			//do my stuff here
			if (elements.length>0) {
				for (var i = 0, len = elements.length; i < len; i++) {
				  elements[i].userID=elements[i].user.userID;
				  elements[i].hsaid=elements[i].user.hsaid;
				  elements[i].unitID=elements[i].unit.unitID;
				  elements[i].unitName=elements[i].unit.name;
				}
			} else {
				//elements.userID=elements.user.userID;
				//elements.hsaid=elements.user.hsaid;
				//elements.unitID=elements.unit.unitID;
				//elements.unitName=elements.unit.name;
			}
			
			return elements;
		});
		
		
		//todo transformera nyheter för att skapa array av kategori-idn .categories  ex. = [1,2]
		RestangularProvider.addElementTransformer('News', true, function(elements) {
			
			for (var i = 0, len = elements.length; i < len; i++) {
			  elements[i].categories=[1,2];
			}
			
			return elements;
		});
		
        NgAdminConfigurationProvider.configure(app);
    });
}());
