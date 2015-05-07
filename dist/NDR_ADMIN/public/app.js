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

		var contactAttributes = nga.entity('ContactAttribute')
			.label('Metavariabler');			
		
		var newsCategories = nga.entity('NewsCategory')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var roles = nga.entity('Role')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var integrationSystems = nga.entity('IntegrationSystem')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var unitTypes = nga.entity('UnitType')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views
			
		var counties = nga.entity('County')
            .readOnly() // a readOnly entity has disabled creation, edition, and deletion views
			.identifier(nga.field('code'));
		
        // set the application entities
        app.addEntity(units)
			.addEntity(users)
			.addEntity(accounts)
			.addEntity(news)
			.addEntity(publications)
			.addEntity(contactAttributes);
		
		// ****** METAVARIABLER ******
		contactAttributes.listView()
             .title('Metavariabler')
			 .perPage(60)
             .fields([
				nga.field('question').label('Etikett').map(truncate),
				nga.field('definition').label('Beskrivning').map(truncate),
				nga.field('helpNote').label('Hjälptext').map(truncate)
             ])
			.listActions(['edit']);
		
        contactAttributes.editionView()
			.title('Uppdatera variabel')
            .fields([
                nga.field('question').label('Etikett'),
                nga.field('definition','text').label('Beskrivning'),
                nga.field('helpNote','text').label('Hjälptext')
            ]);	
		
		
		// ****** ACCOUNTS ******
        // accounts.dashboardView()
             // .title('Användarkonton')
			 // .limit(10)
             // .fields([
                 // nga.field('unitName').label('Enhetsnamn').map(truncate),
				 // nga.field('hsaid').label('HSAID').map(truncate)
             // ]);
		var accountStatus = [{value: 1, label: 'Aktiv'},
						{value: 2, label: 'Inväntar godkännande'},
						{value: 3, label: 'Inaktivt'}];
			 
        accounts.listView()
             .title('Användarkonton')
			 .perPage(50)
             .fields([
				nga.field('unitID').label('Enhets-ID').map(truncate),
				nga.field('unitName').label('Enhetsnamn').map(truncate),
				nga.field('firstName').label('Förnamn').map(truncate),
				nga.field('lastName').label('Efternamn').map(truncate),
				nga.field('hsaid').label('HSAID').map(truncate), 
				nga.field('statusText').label('Status').map(truncate)
             ])
			.filters([
				nga.field('q').label('Sök'),
				nga.field('statusID', 'choice').label('Status')
					.choices(accountStatus)
			])
			.listActions(['edit']);
		
        accounts.creationView()
			.title('Nytt användarkonto')
            .fields([
				nga.field('unitID').label('Enhets-ID'),
				nga.field('userID').label('Användar-ID'),
				nga.field('roleIDs', 'reference_many')
					.label('Roller')
					.targetEntity(roles) // the tag entity is defined later in this file
					.targetField(nga.field('name')), // the field to be displayed in this list
				nga.field('statusID', 'choice').label('Status')
					.choices(accountStatus)
            ]);
		
        accounts.editionView()
			.title('Uppdatera användarkonto')
            .fields([
				nga.field('roleIDs', 'reference_many')
					.label('Roller')
					.targetEntity(roles) // the tag entity is defined later in this file
					.targetField(nga.field('name')), // the field to be displayed in this list
				nga.field('statusID', 'choice').label('Status')
					.choices(
						[{value: 1, label: 'Aktiv'},
						{value: 2, label: 'Inväntar godkännande'},
						{value: 3, label: 'Inaktivt'}])
            ]);	
		
		
		// ****** USER ******
		users.dashboardView()
			.title('Användare')
			.limit(5)
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
				nga.field('userID').label('Användar-ID').editable(false).map(truncate),
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
			.limit(10)
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
				nga.field('contactPerson').label('Kontaktperson').map(truncate).order(2),
				nga.field('contactPersonEmail').label('Kontaktperson Epost').map(truncate).order(2),
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
				nga.field('contactPerson').label('Kontaktperson').map(truncate).order(2),
				nga.field('contactPersonEmail').label('Kontaktperson Epost').map(truncate).order(2),
                nga.field('senderID').label('Sänd-ID'),
                nga.field('manager').label('Verksamhetschef'),
				nga.field('comment','text').label('Kommentar'),
				nga.field('systemIDs', 'reference_many')
					.label('Överföringssystem')
					.targetEntity(integrationSystems)
					.targetField(nga.field('name')),
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
			.limit(5)
            .fields([
                nga.field('newsID').label('ID').order(0),
                nga.field('title').label('Rubrik').map(truncate).order(1)
            ]);

        news.listView()
            .title('Nyheter')
			.sortField('priority')
            // .order(1) // display the comment panel second in the dashboard
            .fields([
                nga.field('newsID').label('ID').order(0),
                nga.field('title').label('Rubrik').map(truncate).order(1),
                nga.field('isInternal','boolean').label('Intern'),
                nga.field('publishedFrom', 'date').label('Från'),
				nga.field('publishedTo', 'date').label('Till')
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
				nga.field('categoryIDs', 'reference_many')
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
		var status = [{value: 1, label: 'Pågår'},
						{value: 2, label: 'Manus'},
						{value: 3, label: 'Submitterat'},
						{value: 4, label: 'Accepterat'},
						{value: 5, label: 'Publicerat'}];
						
		var ethicsApprovalStatus = [{value: 1, label: 'Godkänt'},
						{value: 2, label: 'Ej relevant'}];
		
		
        publications.dashboardView()
             .title('Forskningsprojekt')
			 .limit(5)
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
			.filters([
				nga.field('q').label('Sök'),
				nga.field('status', 'choice').label('Status')
					.choices(status)
			])
             .listActions(['edit', 'delete']);

        publications.creationView()
			.title('Ny')
			.fields([
				nga.field('statusID', 'choice').label('Status')
					.choices(status),
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
				nga.field('ethicsApprovalStatusID', 'choice').label('Etikprövat')
					.choices(ethicsApprovalStatus),
				nga.field('pubMedURL').label('Länk till pubmed')
			]);
		
        publications.editionView()
			.title('Uppdatera')
			.description('{{ entry.values.name }}')
            .fields([
                publications.creationView().fields()
            ]);
		

		RestangularProvider.addElementTransformer('Account', true, function(elements) {
			
			//do my stuff here
			for (var i = 0, len = elements.length; i < len; i++) {
			  elements[i].userID=elements[i].user.userID;
			  elements[i].hsaid=elements[i].user.hsaid;
			  elements[i].firstName=elements[i].user.firstName;
			  elements[i].lastName=elements[i].user.lastName;
			  elements[i].unitID=elements[i].unit.unitID;
			  elements[i].unitName=elements[i].unit.name;
			  elements[i].statusText=elements[i].status.name;
			}
			//console.log(elements);
			
			return elements;
		});
		
        NgAdminConfigurationProvider.configure(app);
    });
}());
