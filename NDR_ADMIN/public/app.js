﻿/*global angular*/
(function () {
    "use strict";

    var app = angular.module('myApp', ['ng-admin']);
	var baseApiUrl = 'https://www.ndr.nu/api/';
	var baseApiUrl = 'https://w10-038.rcvg.local/api/';// Henrik local development

	app.controller('adminCtrl', function adminCtrl($scope, $http)
	{
		$scope.isAdmin = false;

		var dfd = $http.get(baseApiUrl + 'currentvisitor')
		dfd.success(function(data, status, headers, config) {
			$scope.isAdmin = data.user.isAdministrator;
		})
		.error(function(data, status, headers, config) {

		});

	});

    /*app.config(function (NgAdminConfigurationProvider, RestangularProvider) {*/
	app.config(['NgAdminConfigurationProvider', 'RestangularProvider', function (NgAdminConfigurationProvider, RestangularProvider) {
        var nga = NgAdminConfigurationProvider;

        function truncate(value) {

			if(value === '')
				return null;

			if (!value) {
                return '';
            }

            return value.length > 75 ? value.substr(0, 75) + '...' : value;
        }

        RestangularProvider.setDefaultRequestParams({APIKey: 'G6jlpk43DvnMkrWcggjk'});//jEGPvHoP7G4eMkjLQwE5

        var app = nga.application('NDR Admin') // application main title
			.baseApiUrl(baseApiUrl);

		var contactOptionalMeta = nga.entity('ContactOptionalMeta')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views

		var integrationSystems = nga.entity('IntegrationSystem')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views

		var newsCategories = nga.entity('NewsCategory')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views

		var roles = nga.entity('Role')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views

		var unitTypes = nga.entity('UnitType')
            .readOnly(); // a readOnly entity has disabled creation, edition, and deletion views

		var counties = nga.entity('County')
            .readOnly() // a readOnly entity has disabled creation, edition, and deletion views
			.identifier(nga.field('code'));

        var news = nga.entity('News')
            .identifier(nga.field('newsID'))
			.label('Nyheter');

        var publications = nga.entity('Publication')
             .identifier(nga.field('id'))
			 .label('Publikationer');

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


        // set the application entities
        app.addEntity(units)
			.addEntity(users)
			.addEntity(accounts)
			.addEntity(news)
			.addEntity(publications)
			.addEntity(contactAttributes);

		// ****** UNIT ******
        units.dashboardView()
            .title('Enheter')
			.limit(10)
            .fields([
                nga.field('unitID').label('NDR-ID'),
                nga.field('name').label('Enhetsnamn').map(truncate)
            ]);

        units.listView()
            .title('Enheter')
			.sortField('name')
			.perPage(50)
            .fields([
                nga.field('unitID').label('NDR-ID').cssClasses(function(entry) {
					if (!entry.values.isActive) {
						return 'inActive';
					}
				}),
                nga.field('name').label('Enhetsnamn').cssClasses(function(entry) {
					if (!entry.values.isActive) {
						return 'inActive';
					}
				}),
				nga.field('hsaid').label('HSAID').cssClasses(function(entry) {
					if (!entry.values.isActive) {
						return 'inActive';
					}
				}),
				nga.field('contactPerson').label('Kontaktperson').cssClasses(function(entry) {
					if (!entry.values.isActive) {
						return 'inActive';
					}
				}),
				nga.field('contactPersonEmail').label('Kontaktperson Epost').cssClasses(function(entry) {
					if (!entry.values.isActive) {
						return 'inActive';
					}
				}),
				nga.field('phone').label('Telefon').cssClasses(function(entry) {
					if (!entry.values.isActive) {
						return 'inActive';
					}
				}),
				nga.field('lastUpdatedAt').label('Uppdaterad').cssClasses(function(entry) {
					if (!entry.values.isActive) {
						return 'inActive';
					}
				})
            ])
            .listActions(['edit'])
			.filters([
				nga.field('q').label('Sök')
					.pinned(true),
				nga.field('countyCode', 'reference')
					.pinned(true)
					.label('Landsting')
					.targetEntity(counties) // Select a target Entity
					.targetField(nga.field('name')), // Select a label Field
				nga.field('typeID', 'reference')
					.pinned(true)
					.label('Typ')
					.targetEntity(unitTypes)
					.targetField(nga.field('name')),
				nga.field('includeNotActive', 'boolean')
					.pinned(true)
					.label('Visa inaktiva'),
				nga.field('onlyUsingPROM', 'boolean')
					.pinned(true)
					.label('Använder PROM')
			])
			.permanentFilters({
				includeNotReporting: true
			});


		var ownership = [{value: 1, label: 'Offentlig'},
						{value: 2, label: 'Privat'}];

        units.creationView()
			.title('Ny enhet')
            .fields([
                nga.field('name').label('Enhetsnamn'),
				nga.field('isActive', 'boolean').label('Aktiv').defaultValue(true),
				nga.field('isUsingPROM', 'boolean').label('Använder PROM').defaultValue(false),
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
				nga.field('ownershipID', 'choice')
					.label('Ägarskap')
					.choices(ownership),
				nga.field('hsaid').label('HSAID').map(truncate),
				nga.field('senderID').label('Sänd-ID'),
                nga.field('street').label('Gatuadress'),
                nga.field('postalCode').label('Postadress'),
                nga.field('postalLocation').label('Postort'),
                nga.field('phone').label('Telefon'),
				nga.field('contactPerson').label('Kontaktperson').map(truncate),
				nga.field('contactPersonEmail').label('Kontaktperson Epost').map(truncate),
                nga.field('manager').label('Verksamhetschef'),
				nga.field('systemIDs', 'reference_many')
					.label('Överföringssystem')
					.targetEntity(integrationSystems)
					.targetField(nga.field('name')),
				nga.field('optionalIDs', 'reference_many')
					.label('Valbara frågor')
					.targetEntity(contactOptionalMeta)
					.targetField(nga.field('question')),
				nga.field('lng').label('Longitud'),
				nga.field('lat').label('Latitud'),
				nga.field('lastUpdatedAt','date').label('Senast uppdaterad').editable(false),
				nga.field('comment','text').label('Kommentar')
            ]);

        units.editionView()
			.title('Uppdatera enhet')
			.description('{{ entry.values.name }}')
            .fields([
                //new Field('newsID'),
                units.creationView().fields()
            ]);

		units.deletionView().disable();

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

		contactAttributes.deletionView().disable();


		// ****** ACCOUNTS ******
		var accountStatus = [{value: 1, label: 'Aktiv'},
						{value: 2, label: 'Inväntar godkännande'},
						{value: 3, label: 'Inkommen'},
						{value: 9, label: 'Inaktivt'}];

        accounts.listView()
             .title('Användarkonton')
			 .perPage(50)
             .fields([
				nga.field('unitID').label('Enhets-ID').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('unitName').label('Enhetsnamn').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('userID').label('Anv-ID').cssClasses(function(entry) {
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
					if (entry.values.statusID == 9)
						return 'inActive';
				}),
				nga.field('firstName').label('Anv. Förnamn').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('lastName').label('Anv. Efternamn').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('email').label('Anv. E-post').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive ';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('statusText').label('Status').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('unitContactPerson').label('Enhetskontakt').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				/*nga.field('unitContactPhone').label('Telefon').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}), */
				nga.field('unitContactEmail').label('Kontakt E-post').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('lastActiveAt').label('Senast aktiv').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				}),
				nga.field('lastUpdatedAt').label('Uppdaterad', 'date').cssClasses(function(entry) {
					if (entry.values.statusID == 9)
						return 'inActive';
					if (entry.values.statusID == 2 || entry.values.statusID == 3)
						return 'isPending';
				})
             ])
			.filters([
				nga.field('q')
					.pinned(true)
					.label('Sök'),
				nga.field('statusID', 'choice')
					.pinned(true)
					.label('Status')
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
				nga.field('statusID', 'choice')
					.label('Status')
					.choices(accountStatus)
            ]);

		accounts.deletionView().disable();

		// ****** USER ******
		users.dashboardView()
			.title('Användare')
			.limit(5)
			.fields([
				nga.field('userID').label('ID'),
				nga.field('hsaid').label('HSAID').map(truncate),
				nga.field('firstName').label('Förnamn').map(truncate),
				nga.field('lastName').label('Efternamn').map(truncate)
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
				nga.field('isAdministrator','boolean').label('NDR-Administratör'),
				nga.field('lastActiveAt').label('Senast aktiv'),
				nga.field('lastUpdatedAt').label('Uppdaterad')
			])
			.listActions(['edit'])
			.filters([
				nga.field('q')
					.pinned(true)
					.label('Sök'),
				nga.field('onlyKAS', 'boolean')
					.pinned(true)
					.label('Visa KAS'),
				nga.field('onlyKOO', 'boolean')
					.pinned(true)
					.label('Visa Koordinator'),
				nga.field('onlyAdmin', 'boolean')
					.pinned(true)
					.label('Visa Administratör')
			]);

        users.creationView()
			.title('Ny användare')
            .fields([
				nga.field('hsaid').label('HSAID'),
				nga.field('socialNumber').attributes({ placeholder: 'krävs för inloggning med mobilt bank-ID' }).label('Personnummer').map(truncate),
                nga.field('firstName').label('Förnamn'),
				nga.field('lastName').label('Efternamn'),
				nga.field('workTitle').label('Titel'),
				nga.field('organization').label('Organisation'),
				nga.field('email','email').label('E-post'),
				nga.field('kasCountyCode', 'reference')
					.label('KAS-landsting')
					.map(truncate)
					.targetEntity(counties)
					.targetField(nga.field('name')),
				nga.field('kasUnitTypeID', 'reference')
					.label('KAS-Enhetstyp')
					.map(truncate)
					.targetEntity(unitTypes)
					.targetField(nga.field('name')),
				nga.field('kooCountyCode', 'reference')
					.label('Koordinator-landsting')
					.map(truncate)
					.targetEntity(counties)
					.targetField(nga.field('name')),
				nga.field('kooUnitTypeID', 'reference')
					.label('Koordinator-Enhetstyp')
					.map(truncate)
					.targetEntity(unitTypes)
					.targetField(nga.field('name')),
				nga.field('phone').label('Tel'),
				//nga.field('isKAS','boolean').label('KAS'),
				//nga.field('isCoordinator','boolean').label('Koordinator'),
				nga.field('isAdministrator','boolean').label('NDR-Administratör'),
				nga.field('comment','text').label('Kommentar')
            ]);

        users.editionView()
			.title('Uppdatera användare')
			.description('"{{ entry.values.hsaid }}"')
            .fields([
				nga.field('userID').label('Användar-ID').editable(false),
				nga.field('hsaid').label('HSAID'),
				nga.field('socialNumber').attributes({ placeholder: 'krävs för inloggning med mobilt bank-ID' }).label('Personnummer').map(truncate),
                nga.field('firstName').label('Förnamn'),
				nga.field('lastName').label('Efternamn'),
				nga.field('workTitle').label('Titel'),
				nga.field('organization').label('Organisation'),
				nga.field('email','email').label('E-post'),
				nga.field('kasCountyCode', 'reference')
					.label('KAS-landsting')
					.map(truncate)
					.targetEntity(counties)
					.targetField(nga.field('name'))
					.defaultValue(null),
				nga.field('kasUnitTypeID', 'reference')
					.label('KAS-Enhetstyp')
					.map(truncate)
					.targetEntity(unitTypes)
					.targetField(nga.field('name'))
					.defaultValue(null),
				nga.field('kooCountyCode', 'reference')
					.label('Koordinator-landsting')
					.map(truncate)
					.targetEntity(counties)
					.targetField(nga.field('name'))
					.defaultValue(null),
				nga.field('kooUnitTypeID', 'reference')
					.label('Koordinator-Enhetstyp')
					.map(truncate)
					.targetEntity(unitTypes)
					.targetField(nga.field('name'))
					.defaultValue(null),
				nga.field('phone').label('Tel'),
				//nga.field('isKAS','boolean').label('KAS'),
				//nga.field('isCoordinator','boolean').label('Koordinator'),
				nga.field('isAdministrator','boolean').label('NDR-Administratör'),
				nga.field('comment','text').label('Kommentar')
            ]);

		users.deletionView().disable();

		// ****** NEWS ******
        news.dashboardView()
            .title('Nyheter')
			.limit(5)
            .fields([
                nga.field('publishedFrom','date').label('Publicerat'),
                nga.field('title').label('Rubrik').map(truncate)
            ]);

        news.listView()
            .title('Nyheter')
			.sortField('priority')
            .fields([
                nga.field('newsID').label('ID'),
                nga.field('title').label('Rubrik').map(truncate),
                nga.field('isInternal','boolean').label('Intern'),
				nga.field('readCount').label('Läst'),
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
				nga.field('title')
					.pinned(true)
					.label('Sök rubrik'),
				nga.field('includeOutsidePeriod', 'boolean')
					.pinned(true)
					.label('Inkludera opublicerat'),
				nga.field('excludePublic', 'boolean')
					.pinned(true)
					.label('Visa endast interna nyheter')
			])
			.permanentFilters({
				includeOutsidePeriod: true
			});

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
				nga.field('isInternal','boolean').label("Intern?"),
				nga.field('categoryIDs', 'reference_many')
					.label('Kategorier')
					.targetEntity(newsCategories) // the tag entity is defined later in this file
					.targetField(nga.field('name')), // the field to be displayed in this list
                nga.field('author').label('Av'),
                nga.field('title').label('Titel'),
                nga.field('image').label('Bild'),
				nga.field('excerpt','wysiwyg').label('Ingress'),
                nga.field('body','wysiwyg').label('Brödtext'),
                nga.field('priority').label('Prioritet?')
            ]);

        news.editionView()
			.title('Uppdatera')
			.description('"{{ entry.values.title }}"')
            .fields([
                news.creationView().fields()
            ]);

		// ****** PUBLICATIONS ******

        publications.dashboardView()
             .title('Publikationer')
			 .limit(5)
             .fields([
				nga.field('dateOfPublication', 'date').label('Publiceringsdatum'),
				nga.field('name').label('Titel'),
             ]);

        publications.listView()
             .title('Publikationer')
             .fields([
				nga.field('dateOfPublication', 'date').label('Publiceringsdatum'),
				nga.field('name').label('Titel'),
				nga.field('published').label('Publicerad')
             ])
			.filters([
				nga.field('q')
					.pinned(true)
					.label('Sök')
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
                nga.field('dateOfPublication', 'date')
                    .label('Publiceringsdatum')
					.format('yyyy-MM-dd'), // preset fields in creation view with defaultValue
				nga.field('published').label('Publicerad'),
				nga.field('pubMedURL').label('Länk till pubmed'),
				nga.field('image').label('Bild-URL'),
				nga.field('pubMedID').label('ID PubMed'),
				nga.field('doi').label('DOI')
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
			  elements[i].email=elements[i].user.email;
			  elements[i].unitID=elements[i].unit.unitID;
			  elements[i].unitName=elements[i].unit.name;
			  elements[i].unitContactPerson=elements[i].unit.contactPerson;
			  elements[i].unitContactPhone=elements[i].unit.phone;
			  elements[i].unitContactEmail=elements[i].unit.contactPersonEmail;
			  elements[i].statusText=elements[i].status.name;
			}
			//console.log(elements);

			return elements;
		});

		/*RestangularProvider.addElementTransformer('Unit', false, function(element) {

			function GetTextString(array, property) {

				var defaultVal = 'Inga';

				if (!array)
					return defaultVal;

				if (array.length == 0)
					return defaultVal;

				var tempArray = [];

				for (var i = 0, len = array.length; i < len; i++)
					tempArray.push(array[i][property]);

				if (tempArray.length>0)
					return tempArray.join(', ');

				return defaultVal;

			};

			//add optionalsText
			element.systemsText = GetTextString(element.systems, 'name');
			element.optionalsText = GetTextString(element.optionals, 'question');

			return element;

		});*/

		//Menu
		app.menu().getChildByTitle('Enheter')
			.icon('<span class="glyphicon glyphicon-home"></span>');
		app.menu().getChildByTitle('Användare')
			.icon('<span class="glyphicon glyphicon-user"></span>');
		app.menu().getChildByTitle('Användarkonton')
			.icon('<span class="glyphicon glyphicon-erase"></span>');
		app.menu().getChildByTitle('Nyheter')
			.icon('<span class="glyphicon glyphicon-file"></span>');
		app.menu().getChildByTitle('Publikationer')
			.icon('<span class="glyphicon glyphicon-book"></span>');
		app.menu().getChildByTitle('Metavariabler')
			.icon('<span class="glyphicon glyphicon-list"></span>');

		app.header('<div class="navbar-header"><a class="navbar-brand" href="#" ng-click="appController.displayHome()">NDR Admin</a></div>');

        NgAdminConfigurationProvider.configure(app);
    }]);
}());
