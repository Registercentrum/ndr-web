// =============================
// Data Service

angular.module("ndrApp")
    .service("dataService", ["$q", "$http", "Restangular", "accountService", function($q, $http, Restangular, accountService) {

        var self = this;

        this.data = {
            units : [],
            counties : [],
            indicators : [],

            preparedGeoList : []
        };

        /* RESTANGULAR CONFIG */
        Restangular.setBaseUrl("https://ndr.registercentrum.se/api/");
        Restangular.setDefaultRequestParams({
            APIKey : "LkUtebH6B428KkPqAAsV"
        });


        /* RESTANGULAR OBJECTS */
        var endpoints = {
            indicator        : Restangular.one("indicator"),
            indicatorresult  : Restangular.one("indicatorresult"),
            contactAttributes: Restangular.one("ContactAttribute"),
            units            : Restangular.all("unit"),
            counties         : Restangular.all("county"),
            news             : Restangular.all("news"),
            researchproject  : Restangular.all("researchproject"),
            contacts         : Restangular.all("Contact"),
            subject          : Restangular.all("subject")

        };



        /**
         * Get the list of possible choices for filtering option
         * @param  {Object} filter Object with filter ids to include or exclude from the result
         * @return {Array}        Array with filter options
         */
        this.getContactAttributes = function (filter) {
            return endpoints.contactAttributes.get()
                .then(function (data) {
                    var filtered = [];

                    // Filter the data set by the column names…
                    if (filter) {
                        if (filter.include) {
                            filtered = filtered.concat(_.filter(data.plain(), (function (d) { return _.indexOf(filter.include, d.columnName) !== -1; })));
                        }

                        if (filter.exclude) {
                            filtered = filtered.concat(_.filter(data.plain(), (function (d) { return _.indexOf(filter.exclude, d.columnName) === -1; })));
                        }

                        return filtered;

                    // …or just return the clean data set, without all the stuff from Restangular
                    } else {
                        return data.plain();
                    }
                })
                ["catch"](function (error) {
                    return error;
                });
        };

        this.getSubject = function (id) {
            return Restangular.one("Subject", id).get({"AccountID": accountService.accountModel.activeAccount.accountID})
                .then(function(subject) {
                    return subject.plain();
                })
                ["catch"](function(error) {
                    return error;
                });
        };




            this.getContacts = function (query) {
                query = query || {};
                query.AccountID = accountService.accountModel.activeAccount.accountID;

                return endpoints.contacts.getList(query)
                    .then(function (data) {
                        return data.plain();
                    })
                    ["catch"](function (error) {
                    return error;
                });
            }




        this.getSubjects = function (query) {
            query = query || {};
            query.AccountID = accountService.accountModel.activeAccount.accountID;

            return endpoints.subject.getList(query)
                .then(function (data) {
                    return data.plain();
                })
                ["catch"](function (error) {
                return error;
            });
        }



        /* METHODS - returns promises */
        this.getList = function (type){
            return endpoints[type].getList();
        };

        this.getAny = function (type, params){
            return Restangular.all(type).get(params);
        };

        this.getOne = function (type, id){
            return Restangular.one(type, id).get();
        };


        //this.getSome = function(type, number){
        //    var all = endpoints[type].getList();
        //    all.then(function(a,b,c){
        //        debugger;
        //    });
        //    debugger;
        //   //  return all.splice(0, number);
        //}

        this.getStats = function (params){
            return endpoints.indicatorresult.get(params).then(function (data) {
                return data.plain();
            });
        };

        this.prepareGeoList = function (){


            var preparedGeoList = [];

            _.each(self.data.units, function(obj, key){

                if(obj.isActive) {
                    var o = {
                        type: "unit",
                        name: obj.name,
                        id: "unit_" + obj.unitID
                    };
                    preparedGeoList.push(o);
                }
            });

            _.each(self.data.counties, function(obj, key){
                var o = {
                    type : "county",
                    name : obj.name,
                    id : "county_" + obj.code
                };
                preparedGeoList.push(o);
            });

            self.data.preparedGeoList = preparedGeoList;
        };

        this.queryFactory = function(params){

            var defaults = {
                level: 1,
                countyCode: 0,
                unitID: 0,
                indicatorID : null,
                fromYear: 2014,
                fromQuartal: 0,
                fromMonth: 0,
                toYear: 2014,
                toQuartal: 0,
                toMonth: 0,
                diabetesType: 0,
                sex: 0,
                unitType: 0,
                fromAge: 0,
                toAge: 0,
                interval: null,
                recalculate: false,
                outdatedDays: 14
                //dTH :
            };

            return angular.extend(defaults, params);

        };


        this.bootstrap = function (){


            var useStaticUnits = true;
            var units = [{"unitID":1,"name":"Hallstaviks VC","isActive":true},{"unitID":3,"name":"Aleris Vårdcentral Nykvarn","isActive":true},{"unitID":4,"name":"Telgeakuten","isActive":true},{"unitID":5,"name":"Tveta Hälsocentralen","isActive":true},{"unitID":6,"name":"Munsö Husläkarmottagning","isActive":true},{"unitID":8,"name":"Fem Husläkare Sollentuna sjukhus","isActive":true},{"unitID":9,"name":"Hälsocentralen Akka","isActive":true},{"unitID":10,"name":"Ektorps VC","isActive":true},{"unitID":11,"name":"HLM Korallen","isActive":true},{"unitID":13,"name":"Torsviks VC","isActive":true},{"unitID":14,"name":"Täby VC","isActive":true},{"unitID":15,"name":"Täby Kyrkby husläkarmottagning","isActive":true},{"unitID":16,"name":"Enebybergs VC","isActive":true},{"unitID":17,"name":"Sibylleklinikens husläkarmottagning","isActive":true},{"unitID":19,"name":"Segeltorps VC","isActive":true},{"unitID":20,"name":"Södersjukhuset","isActive":true},{"unitID":22,"name":"Norrtälje sjukhus TioHundra","isActive":true},{"unitID":23,"name":"Karolinska Universitetssjukhuset Solna","isActive":true},{"unitID":24,"name":"Capio St Görans sjukhus","isActive":true},{"unitID":25,"name":"Vårdcentral Familjeläkarna i Bålsta","isActive":true},{"unitID":26,"name":"Kvarnbyn Väst","isActive":true},{"unitID":27,"name":"Kvarnbyn Öst","isActive":true},{"unitID":28,"name":"Örsundsbro VC","isActive":true},{"unitID":29,"name":"Aros läkarmottagning","isActive":true},{"unitID":31,"name":"Ture Ålander Läkarpraktik","isActive":true},{"unitID":32,"name":"Eriksbergs VC","isActive":true},{"unitID":35,"name":"Nyby VC","isActive":true},{"unitID":37,"name":"Rasbo husläkarmottagning","isActive":true},{"unitID":39,"name":"Svartbäckens VC","isActive":true},{"unitID":40,"name":"Carema vårdcentral Sävja","isActive":true},{"unitID":42,"name":"Årsta husläkarmottagning","isActive":true},{"unitID":43,"name":"Tierps VC","isActive":true},{"unitID":44,"name":"Gimo Vårdcentral","isActive":true},{"unitID":45,"name":"Öregrunds VC","isActive":true},{"unitID":46,"name":"Österbybruks VC","isActive":true},{"unitID":47,"name":"Östhammars VC","isActive":true},{"unitID":48,"name":"Capio Enköping Vårdcentral","isActive":true},{"unitID":49,"name":"Enköpings Husläkarcentrum","isActive":true},{"unitID":52,"name":"Akademiska sjukhuset Uppsala","isActive":true},{"unitID":53,"name":"Lasarettet i Enköping","isActive":true},{"unitID":57,"name":"Vårdcentralen Torshälla","isActive":true},{"unitID":58,"name":"Ekeby VC","isActive":true},{"unitID":59,"name":"Skiftinge VC","isActive":true},{"unitID":61,"name":"Vårdcentralen Strängnäs","isActive":true},{"unitID":64,"name":"Nyköpings lasarett","isActive":true},{"unitID":65,"name":"Vårdcentralen Borensberg","isActive":true},{"unitID":66,"name":"Vårdcentralen Kisa","isActive":true},{"unitID":67,"name":"Aleris Vårdcentral Kneippen","isActive":true},{"unitID":68,"name":"Vilbergens VC","isActive":true},{"unitID":69,"name":"Vårdcentralen Östertull","isActive":true},{"unitID":70,"name":"Lasarettet i Motala","isActive":true},{"unitID":71,"name":"Universitetssjukhuset Linköping","isActive":true},{"unitID":72,"name":"Finspångs lasarett","isActive":true},{"unitID":75,"name":"Tranås vårdcentum","isActive":true},{"unitID":76,"name":"Skillingaryds VC","isActive":true},{"unitID":77,"name":"Vaggeryds VC","isActive":true},{"unitID":78,"name":"Länssjukhuset Ryhov","isActive":true},{"unitID":79,"name":"Värnamo sjukhus","isActive":true},{"unitID":81,"name":"Vårdcentralen Markaryd","isActive":true},{"unitID":82,"name":"Vårdcentralen Kungshögen","isActive":true},{"unitID":83,"name":"Vårdcentralen Lagan","isActive":true},{"unitID":84,"name":"Vårdcentralen Sländan","isActive":true},{"unitID":85,"name":"Vårdcentralen Strömsnäsbruk","isActive":true},{"unitID":86,"name":"Acima Care Vårdcentral Älmhult","isActive":true},{"unitID":87,"name":"Centrallasarettet Växjö","isActive":true},{"unitID":88,"name":"Stensö HC","isActive":true},{"unitID":89,"name":"Lindsdals HC","isActive":true},{"unitID":90,"name":"Smedby HC","isActive":true},{"unitID":91,"name":"Ljungbyholms HC","isActive":true},{"unitID":92,"name":"Norrlidens HC","isActive":true},{"unitID":93,"name":"Berga HC","isActive":true},{"unitID":94,"name":"Torsås HC","isActive":true},{"unitID":95,"name":"Emmaboda HC","isActive":true},{"unitID":97,"name":"Nybro HC","isActive":true},{"unitID":98,"name":"Färjestadens HC","isActive":true},{"unitID":99,"name":"Mörbylånga HC","isActive":true},{"unitID":100,"name":"Borgholms HC","isActive":true},{"unitID":101,"name":"Mönsterås HC","isActive":true},{"unitID":102,"name":"Högsby Hälsocentral","isActive":true},{"unitID":103,"name":"Mörlunda HC","isActive":true},{"unitID":104,"name":"Hultsfred HC","isActive":true},{"unitID":105,"name":"Vårdcentralen Virserum","isActive":true},{"unitID":106,"name":"Dackekliniken","isActive":true},{"unitID":107,"name":"Gamleby HC","isActive":true},{"unitID":108,"name":"Länssjukhuset Kalmar","isActive":true},{"unitID":114,"name":"Vårdcentralen Wisby Söder","isActive":true},{"unitID":115,"name":"Vårdcentralen Hemse","isActive":true},{"unitID":116,"name":"Roma VC","isActive":true},{"unitID":118,"name":"Visby lasarett","isActive":true},{"unitID":119,"name":"Vårdcentralen Degeberga","isActive":true},{"unitID":120,"name":"Vårdcentralen Knislinge","isActive":true},{"unitID":121,"name":"Vårdcentralen Vä","isActive":true},{"unitID":122,"name":"Vårdcentralen Vinslöv","isActive":true},{"unitID":123,"name":"Vårdcentralen Osby","isActive":true},{"unitID":124,"name":"HälsoRingen Bromölla","isActive":true},{"unitID":125,"name":"Vårdcentralen Åhus","isActive":true},{"unitID":126,"name":"Capio Citykliniken Broby","isActive":true},{"unitID":128,"name":"Vårdcentralen Näsby","isActive":true},{"unitID":129,"name":"Capio Citykliniken Båstad","isActive":true},{"unitID":130,"name":"Vårdcentralen Åparken","isActive":true},{"unitID":131,"name":"Kristianstadkliniken","isActive":true},{"unitID":132,"name":"Vårdcentralen Vilan","isActive":true},{"unitID":133,"name":"Östra Läkargruppen","isActive":true},{"unitID":134,"name":"Vårdcentralen Östermalm","isActive":true},{"unitID":135,"name":"Vårdcentralen Brösarp","isActive":true},{"unitID":136,"name":"Vårdcentralen Perstorp","isActive":true},{"unitID":137,"name":"Vårdcentralen Tollarp","isActive":true},{"unitID":138,"name":"Vårdcentralen Vittsjö","isActive":true},{"unitID":139,"name":"Solbrinken Hässleholm","isActive":true},{"unitID":140,"name":"Båstad läkarpraktik","isActive":true},{"unitID":141,"name":"Centralsjukhuset Kristianstad RoDEoN","isActive":true},{"unitID":142,"name":"Hässleholms sjukhus","isActive":true},{"unitID":146,"name":"Vårdcentralen Nöbbelöv","isActive":true},{"unitID":147,"name":"Vårdcentralen Skurup","isActive":true},{"unitID":150,"name":"Vårdcentralen Sjöbo","isActive":true},{"unitID":151,"name":"Vårdcentralen Bokskogen","isActive":true},{"unitID":152,"name":"Vårdcentralen Dalby","isActive":true},{"unitID":153,"name":"Vårdcentralen Staffanstorp","isActive":true},{"unitID":155,"name":"Vårdcentralen Löddeköpinge","isActive":true},{"unitID":156,"name":"Centrumkliniken Trelleborg","isActive":true},{"unitID":157,"name":"Brahehälsan, Familjeläkarmottagning","isActive":true},{"unitID":158,"name":"Vårdcentralen Södra Sandby","isActive":true},{"unitID":159,"name":"Vårdcentralen Anderslöv","isActive":true},{"unitID":160,"name":"Vårdcentralen Centrum","isActive":true},{"unitID":161,"name":"Vårdcentralen Sankt Lars","isActive":true},{"unitID":164,"name":"Vårdcentralen Arlöv","isActive":true},{"unitID":165,"name":"Vårdcentralen Tornet","isActive":true},{"unitID":166,"name":"Tåbelunds VC","isActive":true},{"unitID":167,"name":"Vårdcentralen Södertull","isActive":true},{"unitID":168,"name":"Sveakliniken","isActive":true},{"unitID":170,"name":"Kärråkra Vårdcentralen","isActive":true},{"unitID":171,"name":"Vårdcentralen Linero","isActive":true},{"unitID":172,"name":"Vårdcentralen Lomma","isActive":true},{"unitID":173,"name":"Vårdcentralen Ystad","isActive":true},{"unitID":174,"name":"Skånes Universitetssjukhus Lund","isActive":true},{"unitID":175,"name":"Helsingsborgs lasarett","isActive":true},{"unitID":176,"name":"Lasarettet Ystad","isActive":true},{"unitID":177,"name":"Trelleborgs lasarett","isActive":true},{"unitID":178,"name":"Landskrona lasarett","isActive":true},{"unitID":181,"name":"Vårdcentralen Getinge","isActive":true},{"unitID":183,"name":"Viktoriakliniken Kungsgatan","isActive":true},{"unitID":184,"name":"Söndrumskliniken","isActive":true},{"unitID":185,"name":"Vårdcentralen Bäckagård","isActive":true},{"unitID":186,"name":"Åsa VC","isActive":true},{"unitID":187,"name":"Capio Citykliniken Halmstad","isActive":true},{"unitID":188,"name":"Vårdcentralen Hyltebruk Unnaryd","isActive":true},{"unitID":189,"name":"Kungsbacka Närsjukhus","isActive":true},{"unitID":190,"name":"Varbergs sjukhus","isActive":true},{"unitID":191,"name":"Länssjukhuset Halmstad","isActive":true},{"unitID":194,"name":"Närhälsan Gibraltargatan vårdcentral","isActive":true},{"unitID":196,"name":"Närhälsan Gamlestadstorget vårdcentral","isActive":true},{"unitID":197,"name":"Närhälsan Angered vårdcentral","isActive":true},{"unitID":198,"name":"Närhälsan Kärra vårdcentral","isActive":true},{"unitID":199,"name":"Närhälsan Brämaregården vårdcentral","isActive":true},{"unitID":200,"name":"Närhälsan Torslanda vårdcentral","isActive":true},{"unitID":201,"name":"Närhälsan Bjurslätt vårdcentral","isActive":true},{"unitID":202,"name":"Närhälsan Kyrkbyn vårdcentral","isActive":true},{"unitID":203,"name":"Närhälsan Kungssten vårdcentral","isActive":true},{"unitID":204,"name":"Närhälsan Opaltorget vårdcentral","isActive":true},{"unitID":205,"name":"Närhälsan Askim vårdcentral","isActive":true},{"unitID":206,"name":"Närhälsan Frölunda vårdcentral","isActive":true},{"unitID":207,"name":"Närhälsan Högsbo vårdcentral","isActive":true},{"unitID":209,"name":"Närhälsan Krokslätt vårdcentral","isActive":true},{"unitID":210,"name":"Närhälsan Lindome vårdcentral","isActive":true},{"unitID":211,"name":"Capio Vårdcentral Mölndal","isActive":true},{"unitID":212,"name":"Närhälsan Landvetter vårdcentral","isActive":true},{"unitID":213,"name":"Närhälsan Hindås vårdcentral","isActive":true},{"unitID":217,"name":"Sahlgrenska Universitetssjukhuset Sahlgrenska","isActive":true},{"unitID":220,"name":"Sahlgrenska Universitetssjukhuset Östra","isActive":true},{"unitID":221,"name":"Sahlgrenska Universitetssjukhuset Mölndal","isActive":true},{"unitID":223,"name":"Frölunda specialistsjukhus","isActive":true},{"unitID":225,"name":"Uddevalla sjukhus","isActive":true},{"unitID":226,"name":"Närhälsan Lerum vårdcentral","isActive":true},{"unitID":227,"name":"Närhälsan Gråbo vårdcentral","isActive":true},{"unitID":228,"name":"Närhälsan Sörhaga vårdcentral","isActive":true},{"unitID":229,"name":"Capio vårdcentral Noltorp","isActive":true},{"unitID":230,"name":"Närhälsan Ängabo vårdcentral","isActive":true},{"unitID":231,"name":"Närhälsan Sollebrunn vårdcentral","isActive":true},{"unitID":233,"name":"Södra Älvsborgs sjukhus Borås Skene","isActive":true},{"unitID":235,"name":"Karlskoga lasarett","isActive":true},{"unitID":236,"name":"Centralsjukhuset Karlstad","isActive":true},{"unitID":239,"name":"Hälsocentralen Linden","isActive":true},{"unitID":242,"name":"Gävle sjukhus","isActive":true},{"unitID":243,"name":"Vårdcentral Mora","isActive":true},{"unitID":245,"name":"Vårdcentral Orsa","isActive":true},{"unitID":246,"name":"Vårdcentral Rättvik","isActive":true},{"unitID":247,"name":"Vårdcentral Älvdalen","isActive":true},{"unitID":248,"name":"Vårdcentral Särna","isActive":true},{"unitID":249,"name":"Vårdcentral Vansbro","isActive":true},{"unitID":250,"name":"Vårdcentral Malung","isActive":true},{"unitID":252,"name":"Vårdcentral Leksand","isActive":true},{"unitID":253,"name":"Medicin Falun","isActive":true},{"unitID":254,"name":"Medicin Mora","isActive":true},{"unitID":258,"name":"Sundsvalls sjukhus","isActive":true},{"unitID":259,"name":"Örnsköldsviks sjukhus","isActive":true},{"unitID":261,"name":"Hälsocentralen Svenstavik","isActive":true},{"unitID":263,"name":"Hälsocentralen Funäsdalen","isActive":true},{"unitID":264,"name":"Hälsocentralen Sveg","isActive":true},{"unitID":266,"name":"Föllinge HC","isActive":true},{"unitID":267,"name":"Hälsocentralen Krokom","isActive":true},{"unitID":268,"name":"Hälsocentralen Offerdal","isActive":true},{"unitID":269,"name":"Stugun HC","isActive":true},{"unitID":270,"name":"Backe HC, Läkarmottagningen","isActive":true},{"unitID":271,"name":"Hammerdal Hälsocentral Nya närvården","isActive":true},{"unitID":272,"name":"Hälsocentralen Hoting","isActive":true},{"unitID":273,"name":"Hälsocentralen Strömsund","isActive":true},{"unitID":274,"name":"Hälsocentralen Hallen","isActive":true},{"unitID":275,"name":"Hälsocentralen Järpen","isActive":true},{"unitID":276,"name":"Hälsocentralen Brunflo","isActive":true},{"unitID":277,"name":"Hälsocentralen Lugnvik","isActive":true},{"unitID":278,"name":"Hälsocentralen Odensala","isActive":true},{"unitID":282,"name":"Östersunds sjukhus","isActive":true},{"unitID":283,"name":"Kåge Morö Backe VC","isActive":true},{"unitID":285,"name":"Vårdcentralen Johannelund","isActive":true},{"unitID":286,"name":"Mälarsjukhuset Eskilstuna","isActive":true},{"unitID":288,"name":"Ryds VC","isActive":true},{"unitID":289,"name":"Närhälsan Sätila vårdcentral","isActive":true},{"unitID":290,"name":"Närhälsan Skene vårdcentral","isActive":true},{"unitID":291,"name":"Närhälsan Fritsla vårdcentral","isActive":true},{"unitID":292,"name":"Danderyds sjukhus","isActive":true},{"unitID":293,"name":"Södertälje sjukhus","isActive":true},{"unitID":294,"name":"Skutskär VC","isActive":true},{"unitID":295,"name":"Alunda husläkarmottagning","isActive":true},{"unitID":296,"name":"Väster VC","isActive":true},{"unitID":297,"name":"Vårdcentralen Ingelstad","isActive":true},{"unitID":298,"name":"Vårdcentralen Sösdala","isActive":true},{"unitID":299,"name":"Vårdcentralen Vänhem","isActive":true},{"unitID":300,"name":"Närhälsan Olskroken vårdcentral","isActive":true},{"unitID":301,"name":"Närhälsan Olskroken vårdcentral","isActive":true},{"unitID":304,"name":"Närhälsan Färgelanda vårdcentral","isActive":true},{"unitID":305,"name":"Närhälsan Mellerud vårdcentral","isActive":true},{"unitID":306,"name":"Närhälsan Dals-Ed vårdcentral","isActive":true},{"unitID":308,"name":"Närhälsan Bengtsfors vårdcentral","isActive":true},{"unitID":309,"name":"Närhälsan Åmål vårdcentral","isActive":true},{"unitID":311,"name":"Närhälsan Floda vårdcentral","isActive":true},{"unitID":312,"name":"Närhälsan Vårgårda vårdcentral","isActive":true},{"unitID":313,"name":"Närhälsan Herrljunga vårdcentral","isActive":true},{"unitID":314,"name":"Vårdcentralen Vålberg","isActive":true},{"unitID":316,"name":"Järvsö HC","isActive":true},{"unitID":317,"name":"Sjukhuset i Söderhamn","isActive":true},{"unitID":319,"name":"Hälsocentralen Matfors VC","isActive":true},{"unitID":320,"name":"Härnösands sjukhus","isActive":true},{"unitID":321,"name":"Bräcke Hälsocentral","isActive":true},{"unitID":322,"name":"Hammarstrands HC","isActive":true},{"unitID":323,"name":"Hälsocentralen Gäddede","isActive":true},{"unitID":324,"name":"Norrlands universitetssjukhus","isActive":true},{"unitID":325,"name":"Gnosjö VC","isActive":true},{"unitID":326,"name":"Gottsunda Vårdcentral","isActive":true},{"unitID":327,"name":"Hälsocentralen Torvalla","isActive":true},{"unitID":328,"name":"Kungälvs sjukhus","isActive":true},{"unitID":331,"name":"Vrinnevisjukhuset","isActive":true},{"unitID":332,"name":"Sandvikens sjukhus","isActive":true},{"unitID":333,"name":"Lidens Hälsocentral","isActive":true},{"unitID":334,"name":"Alnö Vårdcentral","isActive":true},{"unitID":335,"name":"Hälsocentralen Centrum","isActive":true},{"unitID":337,"name":"Vårdcentralen Storfors","isActive":true},{"unitID":339,"name":"Hälsocentralen Åre","isActive":true},{"unitID":341,"name":"Hälsocentralen Lit","isActive":true},{"unitID":342,"name":"Hälsocentralen Zätagränd","isActive":true},{"unitID":343,"name":"Dalslands sjukhus","isActive":true},{"unitID":344,"name":"Närhälsan Horred vårdcentral","isActive":true},{"unitID":345,"name":"Sävsjö Vårdcentral","isActive":true},{"unitID":346,"name":"Närhälsan Källstorp vårdcentral","isActive":true},{"unitID":347,"name":"Husläkarmottagningen Rimbo-Edsbro","isActive":true},{"unitID":348,"name":"Skelleftehamns Hälsocentral","isActive":true},{"unitID":349,"name":"Bureå Vårdcentral","isActive":true},{"unitID":350,"name":"Vårdcentralen Teleborg","isActive":true},{"unitID":351,"name":"Vårdcentralen Söderväg","isActive":true},{"unitID":354,"name":"Torsby sjukhus","isActive":true},{"unitID":355,"name":"Vårdcentralen Likenäs","isActive":true},{"unitID":356,"name":"Karolinska universitetssjukhuset Huddinge","isActive":true},{"unitID":357,"name":"Oskarshamns sjukhus","isActive":true},{"unitID":358,"name":"Ängelholms sjukhus","isActive":true},{"unitID":359,"name":"Höglandssjukhuset Eksjö","isActive":true},{"unitID":360,"name":"Vårdcentralen Skoghall Lövnäs","isActive":true},{"unitID":362,"name":"Capio vårdcentral Liljeforstorg","isActive":true},{"unitID":363,"name":"Åby VC","isActive":true},{"unitID":364,"name":"Närhälsan Åby vårdcentral","isActive":true},{"unitID":365,"name":"HälsocentralenNacksta","isActive":true},{"unitID":366,"name":"Din Vårdcentral Bagarmossen","isActive":true},{"unitID":367,"name":"Björkhagens VC","isActive":true},{"unitID":368,"name":"Dalens VC","isActive":true},{"unitID":370,"name":"Capio Högdalens VC","isActive":true},{"unitID":371,"name":"Capio Vårdcentral Ringen","isActive":true},{"unitID":372,"name":"Rosenlunds VC","isActive":true},{"unitID":373,"name":"Capio Vårdcentral Rågsved","isActive":true},{"unitID":374,"name":"Stureby VC","isActive":true},{"unitID":377,"name":"Din Hälsocentral Söderhamn","isActive":true},{"unitID":378,"name":"Bollnäs sjukhus","isActive":true},{"unitID":379,"name":"Västmanlands sjukhus","isActive":true},{"unitID":380,"name":"Vårdcentralen Laxen","isActive":true},{"unitID":381,"name":"Råcksta Vällingby närvårdsmottagning","isActive":true},{"unitID":382,"name":"Vårdcentralen Grums","isActive":true},{"unitID":383,"name":"Arbrå HC","isActive":true},{"unitID":385,"name":"Nödinge Vårdcentral","isActive":true},{"unitID":389,"name":"Alfta HC","isActive":true},{"unitID":390,"name":"Hälsocentralen Edsbyn","isActive":true},{"unitID":391,"name":"Skaraborgs sjukhus Skövde","isActive":true},{"unitID":392,"name":"Arvika sjukhus","isActive":true},{"unitID":393,"name":"Alingsås lasarett","isActive":true},{"unitID":394,"name":"Vårdcentral Slite","isActive":true},{"unitID":395,"name":"Solna Centrum Vårdcentral","isActive":true},{"unitID":396,"name":"Kungsgatans vårdcentral Link.","isActive":true},{"unitID":397,"name":"Fisksätra VC","isActive":true},{"unitID":398,"name":"Klinte Vårdcentral","isActive":true},{"unitID":400,"name":"Delsbo Friggesunds HC","isActive":true},{"unitID":401,"name":"Gillebergets Vårdcentral","isActive":true},{"unitID":402,"name":"Capio Läkargruppen AB","isActive":true},{"unitID":403,"name":"Närhälsan Vargön vårdcentral","isActive":true},{"unitID":404,"name":"Närhälsan Stenstorp vårdcentral","isActive":true},{"unitID":406,"name":"Bengt-Ivar Nöjd","isActive":true},{"unitID":407,"name":"Mariefreds VC","isActive":true},{"unitID":408,"name":"Lindesbergs Vårdcentral","isActive":true},{"unitID":417,"name":"Ersta Sjukhus","isActive":true},{"unitID":418,"name":"Tegs HC","isActive":true},{"unitID":419,"name":"Gislaveds VC","isActive":true},{"unitID":420,"name":"Smålandsstenars VC","isActive":true},{"unitID":421,"name":"Capio vårdcentral Bro","isActive":true},{"unitID":422,"name":"Vårdcentralen Hermes","isActive":true},{"unitID":423,"name":"Capio Vårdcentral Berga","isActive":true},{"unitID":424,"name":"Vårdcentralen Boxholm","isActive":true},{"unitID":425,"name":"Vårdcentralen Brinken","isActive":true},{"unitID":426,"name":"Vårdcentralen Ekholmen","isActive":true},{"unitID":427,"name":"Vårdcentralen Nygatan","isActive":true},{"unitID":428,"name":"Cityhälsan Söder VC","isActive":true},{"unitID":429,"name":"Kolmårdens VC","isActive":true},{"unitID":430,"name":"Hällefors VC","isActive":true},{"unitID":432,"name":"Vårdcentralen Sunne","isActive":true},{"unitID":433,"name":"Dorotea VC","isActive":true},{"unitID":434,"name":"Närhälsan Bäckefors vårdcentral","isActive":true},{"unitID":435,"name":"Vårdcentralen Nybble","isActive":true},{"unitID":436,"name":"Vårdcentralen Vikbolandet","isActive":true},{"unitID":437,"name":"Trollbäckens VC","isActive":true},{"unitID":438,"name":"Forums VC","isActive":true},{"unitID":439,"name":"Nynäshamns Vårdcentral","isActive":true},{"unitID":440,"name":"Gustavsbergs VC","isActive":true},{"unitID":441,"name":"LUCD","isActive":true},{"unitID":442,"name":"Knivsta Vårdcentral","isActive":true},{"unitID":443,"name":"Flens VC","isActive":true},{"unitID":444,"name":"Malmköpings VC","isActive":true},{"unitID":446,"name":"Kärna VC","isActive":true},{"unitID":447,"name":"Lambohovs VC","isActive":true},{"unitID":448,"name":"Linghems VC","isActive":true},{"unitID":449,"name":"Ljungsbro VC","isActive":true},{"unitID":450,"name":"Lyckornas VC","isActive":true},{"unitID":451,"name":"Mantorps VC","isActive":true},{"unitID":452,"name":"Mariebergs VC","isActive":true},{"unitID":453,"name":"Vårdcentralen Mjölby","isActive":true},{"unitID":454,"name":"Cityhälsan Norr","isActive":true},{"unitID":455,"name":"Aleris Skarptorps VC","isActive":true},{"unitID":456,"name":"Vårdcentralen Valla","isActive":true},{"unitID":457,"name":"Vårdcentralen Skäggetorp","isActive":true},{"unitID":458,"name":"Skänninge VC","isActive":true},{"unitID":459,"name":"Skärblacka VC","isActive":true},{"unitID":460,"name":"Cityhälsan Centrum","isActive":true},{"unitID":461,"name":"Tannefors VC","isActive":true},{"unitID":462,"name":"Vadstena VC","isActive":true},{"unitID":463,"name":"Valdemarsviks VC","isActive":true},{"unitID":465,"name":"Åtvidabergs VC","isActive":true},{"unitID":466,"name":"Ödeshögs VC","isActive":true},{"unitID":467,"name":"Österbymo VC","isActive":true},{"unitID":468,"name":"Vårdcentralen Finspång","isActive":true},{"unitID":469,"name":"Vetlanda VC","isActive":true},{"unitID":470,"name":"Kristinebergs HC","isActive":true},{"unitID":471,"name":"Blekingesjukhuset Karlskrona","isActive":true},{"unitID":472,"name":"Läkarmottagningen Bjärnum","isActive":true},{"unitID":474,"name":"Laxå VC","isActive":true},{"unitID":475,"name":"Molkom VC","isActive":true},{"unitID":476,"name":"Forshaga VC","isActive":true},{"unitID":477,"name":"Vårdcentralen Kronoparken","isActive":true},{"unitID":481,"name":"Stortorgets HC","isActive":true},{"unitID":483,"name":"Lycksele vårdcentral skall vara 5610035","isActive":true},{"unitID":484,"name":"Stenbergska vårdcentralen","isActive":true},{"unitID":485,"name":"Nordmalings HC","isActive":true},{"unitID":486,"name":"Kiruna sjukhus","isActive":true},{"unitID":487,"name":"Närhälsan Styrsö vårdcentral","isActive":true},{"unitID":488,"name":"Boo VC","isActive":true},{"unitID":491,"name":"Hudiksvalls sjukhus","isActive":true},{"unitID":492,"name":"Rävlanda vårdcentral","isActive":true},{"unitID":493,"name":"Brunnsgårdens VC","isActive":true},{"unitID":494,"name":"Samariterhemmets VC","isActive":true},{"unitID":495,"name":"Dr Wahlunds Läkarmottagning","isActive":true},{"unitID":496,"name":"Vårdcentralen Munka Ljungby","isActive":true},{"unitID":498,"name":"Sandviken Norra - Din HC","isActive":true},{"unitID":499,"name":"Bjuråkers HC","isActive":true},{"unitID":501,"name":"Vårdcentralen Söderåsen Bjuv","isActive":true},{"unitID":502,"name":"Lysekils sjukhus","isActive":true},{"unitID":503,"name":"Ljusdals HC","isActive":true},{"unitID":504,"name":"Ålidhems VC","isActive":true},{"unitID":505,"name":"Ljusne HC","isActive":true},{"unitID":506,"name":"Vendelsö VC","isActive":true},{"unitID":508,"name":"Lindesbergs lasarett","isActive":true},{"unitID":509,"name":"NovaKliniken Gärsnäs","isActive":true},{"unitID":510,"name":"Sjukhuset i Lidköping","isActive":true},{"unitID":511,"name":"Trosa VC","isActive":true},{"unitID":513,"name":"Råsunda VC","isActive":true},{"unitID":514,"name":"Universitetssjukhuset Örebro","isActive":true},{"unitID":515,"name":"Storvreta VC","isActive":true},{"unitID":516,"name":"Närhälsan Sjöbo vårdcentral","isActive":true},{"unitID":517,"name":"Salems VC","isActive":true},{"unitID":518,"name":"Capio Hälsocentral Brynäs","isActive":true},{"unitID":520,"name":"Privatläkarmottagningen Arken","isActive":true},{"unitID":521,"name":"Skånes Universitetssjukhus Malmö","isActive":true},{"unitID":522,"name":"Närhälsan Trandared vårdcentral","isActive":true},{"unitID":526,"name":"Kilafors HC","isActive":true},{"unitID":527,"name":"Närhälsan Dalum vårdcentral","isActive":true},{"unitID":529,"name":"Oasen Allmänmedicin","isActive":true},{"unitID":530,"name":"Färnebo HC","isActive":true},{"unitID":531,"name":"Ockelbo HC","isActive":true},{"unitID":532,"name":"Bankeryds VC","isActive":true},{"unitID":533,"name":"Vårdcentralen Örkelljunga","isActive":true},{"unitID":534,"name":"Västmanlands sjukhus Köping","isActive":true},{"unitID":536,"name":"Sandviken Södra  Din HC","isActive":true},{"unitID":537,"name":"Vårdcentralen Lessebo","isActive":true},{"unitID":539,"name":"Vårdcentralen Lammhult","isActive":true},{"unitID":540,"name":"Sollefteå sjukhus","isActive":true},{"unitID":541,"name":"Centrumpraktiken","isActive":true},{"unitID":542,"name":"Vårdcentralen Moheda","isActive":true},{"unitID":543,"name":"Ljungby lasarett","isActive":true},{"unitID":544,"name":"Tallhöjdens VC","isActive":true},{"unitID":546,"name":"Vårdcentralen Nävertorp","isActive":true},{"unitID":547,"name":"Vårdcentralen Falkenberg","isActive":true},{"unitID":548,"name":"Varberga Vårdcentral","isActive":true},{"unitID":549,"name":"Brickegårdens VC","isActive":true},{"unitID":550,"name":"Vårdcentralen Rottne","isActive":true},{"unitID":551,"name":"Jordbro VC","isActive":true},{"unitID":552,"name":"Lycksele lasarett","isActive":true},{"unitID":553,"name":"Vilhelmina Sjukstuga","isActive":true},{"unitID":554,"name":"Bollmora VC","isActive":true},{"unitID":555,"name":"Vårdcentralen Lenhovda","isActive":true},{"unitID":556,"name":"Vårdcentralen Åseda","isActive":true},{"unitID":557,"name":"Storviks HC","isActive":true},{"unitID":559,"name":"Närhälsan Sandared vårdcentral","isActive":true},{"unitID":561,"name":"Ältapraktiken","isActive":true},{"unitID":562,"name":"Capio Vårdcentral Viksjö","isActive":true},{"unitID":564,"name":"Hälsoringen Vård AB Osby","isActive":true},{"unitID":565,"name":"Husläkare Ingemar Borggren","isActive":true},{"unitID":566,"name":"Vårdcentralen Söderköping","isActive":true},{"unitID":567,"name":"Wämö Vårdcentral","isActive":true},{"unitID":569,"name":"Hälsocentralen Iggesund","isActive":true},{"unitID":570,"name":"Hofors HC","isActive":true},{"unitID":571,"name":"Närhälsan Södra Torget vårdcentral","isActive":true},{"unitID":572,"name":"Backens HC","isActive":true},{"unitID":573,"name":"VC Granen","isActive":true},{"unitID":575,"name":"Tyresöhälsan Aleris","isActive":true},{"unitID":576,"name":"Distrikstsköterskemottag","isActive":true},{"unitID":577,"name":"Jokkmokks Hälsocentral","isActive":true},{"unitID":578,"name":"Vårdcentralen Carlanderska","isActive":true},{"unitID":579,"name":"Färila/Los HC","isActive":true},{"unitID":581,"name":"Trossö VC","isActive":true},{"unitID":582,"name":"Vårdcentralen Verkstaden","isActive":true},{"unitID":583,"name":"Capio Gävle HC","isActive":true},{"unitID":584,"name":"Fjärdhundra VC","isActive":true},{"unitID":585,"name":"Kungsgärdets Vårdcentral","isActive":true},{"unitID":586,"name":"Rissne VC","isActive":true},{"unitID":587,"name":"Närhälsan Fjällbacka vårdcentral","isActive":true},{"unitID":588,"name":"Närhälsan Tanumshede vårdcentral","isActive":true},{"unitID":589,"name":"Filipstads VC","isActive":true},{"unitID":590,"name":"Saltsjöbadens VC","isActive":true},{"unitID":591,"name":"Närhälsan Munkedal vårdcentral","isActive":true},{"unitID":592,"name":"Spånga VC","isActive":true},{"unitID":593,"name":"Capio Vårdcentral Lina Hage","isActive":true},{"unitID":595,"name":"Norra Älvsborgs Länssjukhus","isActive":true},{"unitID":596,"name":"Axelsbergs Vårdcentral","isActive":true},{"unitID":597,"name":"Mariehems VC","isActive":true},{"unitID":598,"name":"Närhälsan Heimdal vårdcentral","isActive":true},{"unitID":599,"name":"Vårdcentral Avesta","isActive":true},{"unitID":600,"name":"Holmsunds VC","isActive":true},{"unitID":601,"name":"Djurö VC","isActive":true},{"unitID":602,"name":"Strömstads sjukhus","isActive":true},{"unitID":603,"name":"Vårdcentralen Sjöcrona","isActive":true},{"unitID":604,"name":"Ronneby VC","isActive":true},{"unitID":605,"name":"Strömsbro HC","isActive":true},{"unitID":606,"name":"Reftele VC","isActive":true},{"unitID":607,"name":"Slottsgatans HC","isActive":true},{"unitID":608,"name":"Vårdcentralen Påarp","isActive":true},{"unitID":610,"name":"Säffle Nysäter VC","isActive":true},{"unitID":611,"name":"Närhälsan Herrestad vårdcentral","isActive":true},{"unitID":612,"name":"Vårdcentalen Vråen","isActive":true},{"unitID":613,"name":"Handens VC","isActive":true},{"unitID":614,"name":"Malmens Hälsocentral","isActive":true},{"unitID":615,"name":"Åsö VC","isActive":true},{"unitID":616,"name":"Vårdcentralen Kirseberg","isActive":true},{"unitID":617,"name":"Jämjö VC","isActive":true},{"unitID":618,"name":"Lyckeby VC","isActive":true},{"unitID":619,"name":"Kallinge VC","isActive":true},{"unitID":620,"name":"Bräkne Hoby VC","isActive":true},{"unitID":621,"name":"Närhälsan Viskafors vårdcentral","isActive":true},{"unitID":622,"name":"Närhälsan Bollebygd vårdcentral","isActive":true},{"unitID":623,"name":"Porsöns HC","isActive":true},{"unitID":624,"name":"Bergsjö Din HC","isActive":true},{"unitID":626,"name":"Vällingby Läkarhus","isActive":true},{"unitID":627,"name":"Brandbergens VC","isActive":true},{"unitID":628,"name":"Karla VC","isActive":true},{"unitID":629,"name":"Heimdall VC","isActive":true},{"unitID":630,"name":"Vingåkers vårdcentral AB","isActive":true},{"unitID":631,"name":"Fornhöjdens vårdcentrum AB","isActive":true},{"unitID":632,"name":"Vårdcentralen Ryd","isActive":true},{"unitID":633,"name":"Vårdcentralen Lidhult","isActive":true},{"unitID":634,"name":"Tranebergs VC","isActive":true},{"unitID":635,"name":"Cementa FHV","isActive":true},{"unitID":636,"name":"VC Centrum","isActive":true},{"unitID":637,"name":"Södertulls HC","isActive":true},{"unitID":638,"name":"VC Samariten","isActive":true},{"unitID":639,"name":"Medicinmottagningen Ludvika","isActive":true},{"unitID":641,"name":"Medicin-Geriatrik Avesta","isActive":true},{"unitID":642,"name":"Vårdcentral Sälen-Lima","isActive":true},{"unitID":643,"name":"Vårdcentral Säter","isActive":true},{"unitID":644,"name":"Vårdcentral Kvarnsveden","isActive":true},{"unitID":645,"name":"Vårdcentral Jakobsgårdarna","isActive":true},{"unitID":646,"name":"Vårdcentralen Söderbärke","isActive":true},{"unitID":648,"name":"Vårdcentral Smedjebacken","isActive":true},{"unitID":649,"name":"Vårdcentral Långshyttan","isActive":true},{"unitID":650,"name":"Vårdcentral Domnarvet","isActive":true},{"unitID":651,"name":"Fredriksbergs VC","isActive":true},{"unitID":652,"name":"Vårdcentral Hedemora","isActive":true},{"unitID":653,"name":"Mottagning Svärdsjö","isActive":true},{"unitID":654,"name":"Vårdcentral Grängesberg","isActive":true},{"unitID":656,"name":"Vårdcentral Tisken","isActive":true},{"unitID":657,"name":"Vårdcentral Grangärde/Fredriksberg","isActive":true},{"unitID":659,"name":"Filialmottagning Mockfjärd","isActive":true},{"unitID":660,"name":"Norslund Vårdcentral","isActive":true},{"unitID":661,"name":"Vårdcentral Ludvika","isActive":true},{"unitID":663,"name":"Mottagning Grycksbo","isActive":true},{"unitID":665,"name":"Vårdcentral Gagnef","isActive":true},{"unitID":666,"name":"Mottagning Britsarvet","isActive":true},{"unitID":667,"name":"Närhälsan Dalsjöfors vårdcentral","isActive":true},{"unitID":668,"name":"Närhälsan Ulricehamn vårdcentral","isActive":true},{"unitID":670,"name":"Kungsängens VC","isActive":true},{"unitID":671,"name":"Malå Sjukstuga","isActive":true},{"unitID":673,"name":"Aneby Vårdcentral","isActive":true},{"unitID":675,"name":"Capio Vårdcentral Södermalm","isActive":true},{"unitID":676,"name":"Vårdcentralen Linden","isActive":true},{"unitID":677,"name":"Husläkarna i Margretelund","isActive":true},{"unitID":678,"name":"Västra Skogens VC","isActive":true},{"unitID":679,"name":"Närhälsan Kungshamn vårdcentral","isActive":true},{"unitID":680,"name":"Torsby VC","isActive":true},{"unitID":681,"name":"Närhälsan Skogslyckan vårdcentral","isActive":true},{"unitID":682,"name":"Märsta Närvård","isActive":true},{"unitID":683,"name":"Närhälsan Kinna vårdcentral","isActive":true},{"unitID":684,"name":"Närhälsan Svenljunga vårdcentral","isActive":true},{"unitID":686,"name":"Capio Citykliniken Limhamn","isActive":true},{"unitID":687,"name":"Dalarömottagningen","isActive":true},{"unitID":688,"name":"Närhälsan Stenungsund vårdcentral","isActive":true},{"unitID":689,"name":"Tunafors VC","isActive":true},{"unitID":690,"name":"Luna VC","isActive":true},{"unitID":691,"name":"Laurentiuskliniken Falkenberg","isActive":true},{"unitID":692,"name":"Rosenhälsan","isActive":true},{"unitID":693,"name":"Norrahammars VC","isActive":true},{"unitID":694,"name":"Habo Vårdcentral","isActive":true},{"unitID":695,"name":"Vårdcentralen i Gnesta","isActive":true},{"unitID":696,"name":"Norbergs Vårdcentral","isActive":true},{"unitID":697,"name":"Valbo HC","isActive":true},{"unitID":698,"name":"Rydaholms VC","isActive":true},{"unitID":699,"name":"Kullbergska sjukhuset","isActive":true},{"unitID":701,"name":"Vårdcentralen Kramfors","isActive":true},{"unitID":702,"name":"Vårdcentralen Hälsan 1","isActive":true},{"unitID":703,"name":"Vårdcentralen Drillsnäppan","isActive":true},{"unitID":704,"name":"Privatläkarmot i Sävsjö och Vrigstad","isActive":true},{"unitID":705,"name":"Sölvesborgs Vårdcentral","isActive":true},{"unitID":706,"name":"S:t Hans Läkarmottagning","isActive":true},{"unitID":707,"name":"Råslätts VC","isActive":true},{"unitID":708,"name":"DLM Hälsan 2","isActive":true},{"unitID":709,"name":"Capio Vårdcentral Orust","isActive":true},{"unitID":710,"name":"Vårdcentralen Kusten","isActive":true},{"unitID":711,"name":"Nötkärnan Kållered Familjeläkare och BVC","isActive":true},{"unitID":712,"name":"Capio Lekebergs VC","isActive":true},{"unitID":713,"name":"Hörnefors VC","isActive":true},{"unitID":715,"name":"Sätra HC","isActive":true},{"unitID":716,"name":"Hallsbergs VC","isActive":true},{"unitID":717,"name":"Jakobsbergs Akademiska VC","isActive":true},{"unitID":718,"name":"Mitt Hjärta i Bergslagen AB","isActive":true},{"unitID":719,"name":"Curera Söder Hornstulls VC","isActive":true},{"unitID":720,"name":"Kungshälsans VC","isActive":true},{"unitID":721,"name":"Mullsjö VC","isActive":true},{"unitID":724,"name":"Vårdcentralen Visby Norr","isActive":true},{"unitID":725,"name":"Sjöndahls husläkarmottagning","isActive":true},{"unitID":726,"name":"Kungsbacka VC","isActive":true},{"unitID":727,"name":"Freja Vårdcentral","isActive":true},{"unitID":729,"name":"Vårdcentralen Strandbjörket","isActive":true},{"unitID":730,"name":"Aleris Stureplan Husläkarmott","isActive":true},{"unitID":731,"name":"Närhälsan Solgärde vårdcentral","isActive":true},{"unitID":732,"name":"Närhälsan Oden vårdcentral","isActive":true},{"unitID":733,"name":"Närhälsan Mösseberg vårdcentral","isActive":true},{"unitID":734,"name":"Närhälsan Floby vårdcentral","isActive":true},{"unitID":735,"name":"Capio vårdcentral Grästorp","isActive":true},{"unitID":736,"name":"Närhälsan Gullspång vårdcentral","isActive":true},{"unitID":737,"name":"Närhälsan Götene vårdcentral","isActive":true},{"unitID":738,"name":"Närhälsan Hjo vårdcentral","isActive":true},{"unitID":739,"name":"Vårdcentralen Hova","isActive":true},{"unitID":740,"name":"Närhälsan Karlsborg vårdcentral","isActive":true},{"unitID":742,"name":"Närhälsan Guldvingen vårdcentral","isActive":true},{"unitID":743,"name":"Närhälsan Ågårdsskogen vårdcentral","isActive":true},{"unitID":744,"name":"Närhälsan Mariestad vårdcentral","isActive":true},{"unitID":745,"name":"Närhälsan Nossebro vårdcentral","isActive":true},{"unitID":747,"name":"Närhälsan Skara vårdcentral","isActive":true},{"unitID":748,"name":"Närhälsan Billingen vårdcentral","isActive":true},{"unitID":749,"name":"Närhälsan Hentorp vårdcentral","isActive":true},{"unitID":750,"name":"Närhälsan Norrmalm vårdcentral","isActive":true},{"unitID":751,"name":"Närhälsan Södra Ryd vårdcentral","isActive":true},{"unitID":753,"name":"Närhälsan Tibro vårdcentral","isActive":true},{"unitID":754,"name":"Närhälsan Tidaholm vårdcentral","isActive":true},{"unitID":755,"name":"Närhälsan Tidan vårdcentral","isActive":true},{"unitID":756,"name":"Närhälsan Töreboda vårdcentral","isActive":true},{"unitID":757,"name":"Närhälsan Vara vårdcentral","isActive":true},{"unitID":759,"name":"Skaraborgs sjukhus Falköping","isActive":true},{"unitID":760,"name":"Vårdcentralen Braås","isActive":true},{"unitID":761,"name":"Nässjö vårdcentral Bra liv","isActive":true},{"unitID":762,"name":"Öxnehaga VC","isActive":true},{"unitID":763,"name":"Vårdcentralen Vislanda","isActive":true},{"unitID":765,"name":"Valsta VC","isActive":true},{"unitID":766,"name":"Närhälsan Boda vårdcentral","isActive":true},{"unitID":767,"name":"Ösmo VC","isActive":true},{"unitID":769,"name":"Familjedoktorn","isActive":true},{"unitID":770,"name":"Närhälsan Älvängen vårdcentral","isActive":true},{"unitID":772,"name":"Vårdcentralen i Alvesta","isActive":true},{"unitID":773,"name":"Storå VC","isActive":true},{"unitID":774,"name":"Västmanlands sjukhus Sala","isActive":true},{"unitID":775,"name":"Cityläkarna","isActive":true},{"unitID":776,"name":"Gränna Vårdcentral","isActive":true},{"unitID":777,"name":"Capio vårdcentrall Simrishamn","isActive":true},{"unitID":778,"name":"Närhälsan Hjällbo vårdcentral","isActive":true},{"unitID":779,"name":"Vellinge VC","isActive":true},{"unitID":781,"name":"Hälsohuset AB","isActive":true},{"unitID":782,"name":"Dalbo VC","isActive":true},{"unitID":783,"name":"Vårdcentralen i Tingsryd","isActive":true},{"unitID":784,"name":"Närhälsan Ljungskile vårdcentral","isActive":true},{"unitID":785,"name":"Sigtuna Läkarhus","isActive":true},{"unitID":786,"name":"Vibblaby HLM","isActive":true},{"unitID":787,"name":"Rosenlunds VC","isActive":true},{"unitID":789,"name":"Capio Citykliniken Landskrona","isActive":true},{"unitID":790,"name":"Vårdcentralen Eksjö","isActive":true},{"unitID":793,"name":"Mikaeli VC","isActive":true},{"unitID":794,"name":"Vårdcentralen Gripen","isActive":true},{"unitID":795,"name":"Bodafors vårdcentral Bra Liv","isActive":true},{"unitID":796,"name":"Vårdcentralen Kronan","isActive":true},{"unitID":797,"name":"Vårdcentralen Tomelilla","isActive":true},{"unitID":798,"name":"Lill-Jans Husläkarmottagning","isActive":true},{"unitID":799,"name":"Fröslunda VC","isActive":true},{"unitID":800,"name":"Vårdcentralen Kil","isActive":true},{"unitID":801,"name":"Achima Care Trollhättans vårdcentral","isActive":true},{"unitID":803,"name":"Närhälsan Hjällbo vårdcentral","isActive":true},{"unitID":804,"name":"Hälsocentralen Myrviken","isActive":true},{"unitID":805,"name":"Närhälsan Vänerparken vårdcentral","isActive":true},{"unitID":806,"name":"NOVA-kliniken Borrby","isActive":true},{"unitID":808,"name":"Närhälsan Fristad vårdcentral","isActive":true},{"unitID":830,"name":"Närhälsan Nordmanna vårdcentral","isActive":true},{"unitID":831,"name":"CityPraktiken","isActive":true},{"unitID":832,"name":"Birka VC","isActive":true},{"unitID":833,"name":"Vårdcentralen Munkfors","isActive":true},{"unitID":834,"name":"Vårdcentralen Skåre","isActive":true},{"unitID":838,"name":"Hälsocentralen Sollefteå","isActive":true},{"unitID":839,"name":"Blekingesjukhuset Karlshamn","isActive":true},{"unitID":841,"name":"Capio vårdcentral Skogås","isActive":true},{"unitID":842,"name":"Vårdcentralen Måsen","isActive":true},{"unitID":843,"name":"Södervärns VC","isActive":true},{"unitID":845,"name":"Pilgårdens VC","isActive":true},{"unitID":846,"name":"Piteå Älvdals sjukhus","isActive":true},{"unitID":847,"name":"Capio Vårdcentral Hovshaga","isActive":true},{"unitID":848,"name":"NOVAkliniken Rydsgård","isActive":true},{"unitID":849,"name":"Västerviks sjukhus","isActive":true},{"unitID":850,"name":"HälsoRingen Lönsboda","isActive":true},{"unitID":851,"name":"Lillåns VC","isActive":true},{"unitID":852,"name":"Klippans VC","isActive":true},{"unitID":853,"name":"Capio Vårdcentral Hagsätra","isActive":true},{"unitID":854,"name":"Frösö HC","isActive":true},{"unitID":856,"name":"Östra vårdcentralen","isActive":true},{"unitID":857,"name":"Skellefteå lasarett","isActive":true},{"unitID":858,"name":"Mjölkuddens HC","isActive":true},{"unitID":859,"name":"Vårdcentralen Förslöv","isActive":true},{"unitID":860,"name":"Vårdcentralen Åstorp","isActive":true},{"unitID":861,"name":"Kopparbergs VC","isActive":true},{"unitID":862,"name":"Fålhagens VC","isActive":true},{"unitID":863,"name":"Företagshälsovården i Enköping AB","isActive":true},{"unitID":864,"name":"Hagalunds VC","isActive":true},{"unitID":865,"name":"Tore Södermark","isActive":true},{"unitID":866,"name":"Skebäcks VC","isActive":true},{"unitID":867,"name":"Vännäs HC","isActive":true},{"unitID":868,"name":"Vårdcentralen SöderDoktorn","isActive":true},{"unitID":869,"name":"Österpraktiken AB","isActive":true},{"unitID":870,"name":"Åsele Sjukstuga","isActive":true},{"unitID":871,"name":"Medpro Clinic Brålanda-Torpa Vårdcentral","isActive":true},{"unitID":872,"name":"Hjärt & Kärlcentrum","isActive":true},{"unitID":873,"name":"Askersunds Vårdcentral","isActive":true},{"unitID":874,"name":"Burträsk HC","isActive":true},{"unitID":875,"name":"Vårdcentralen Västerstrand","isActive":true},{"unitID":876,"name":"TungelstaHälsan","isActive":true},{"unitID":877,"name":"Vivalla VC","isActive":true},{"unitID":878,"name":"Apalby Familjeläkarenhet","isActive":true},{"unitID":879,"name":"Medpro Clinic Lilla Edet Vårdcentral","isActive":true},{"unitID":880,"name":"Arvidsjaurs HC","isActive":true},{"unitID":881,"name":"Kvartersakuten Serafen","isActive":true},{"unitID":882,"name":"Capio Vårdcentral Årsta","isActive":true},{"unitID":883,"name":"Capio Haga Vårdcentral","isActive":true},{"unitID":885,"name":"Ekerö VC","isActive":true},{"unitID":887,"name":"Hagfors Ekshärad VC","isActive":true},{"unitID":888,"name":"Närhälsan Dalaberg vårdcentral","isActive":true},{"unitID":889,"name":"Eda Vårdcentral","isActive":true},{"unitID":890,"name":"Vårdcentralen Herrhagen","isActive":true},{"unitID":891,"name":"Karolina VC","isActive":true},{"unitID":892,"name":"Herkules Vårdcentral","isActive":true},{"unitID":893,"name":"Vårdcentralen Vessigebro","isActive":true},{"unitID":894,"name":"Rödeby VC","isActive":true},{"unitID":895,"name":"Nättraby VC","isActive":true},{"unitID":896,"name":"Oxelösunds VC","isActive":true},{"unitID":897,"name":"Hamrånge HC","isActive":true},{"unitID":898,"name":"Huvudsta VC","isActive":true},{"unitID":899,"name":"Byske HC","isActive":true},{"unitID":900,"name":"Vårdcentralen Hälsan","isActive":true},{"unitID":902,"name":"Töcksforspraktiken","isActive":true},{"unitID":903,"name":"Sorsele sjukstuga","isActive":true},{"unitID":904,"name":"Anderstorps VC","isActive":true},{"unitID":905,"name":"Närhälsan Tranemo vårdcentral","isActive":true},{"unitID":906,"name":"Tumba VC","isActive":true},{"unitID":907,"name":"Kristina VC","isActive":true},{"unitID":909,"name":"Carema hälsocentral Bomhus","isActive":true},{"unitID":910,"name":"Åbågens Vårdcentral","isActive":true},{"unitID":911,"name":"Kvartersakuten Tegnergatan","isActive":true},{"unitID":914,"name":"Vårdcentralen City","isActive":true},{"unitID":915,"name":"Vårdcentralen Bagaregatan","isActive":true},{"unitID":916,"name":"Villa Qrera","isActive":true},{"unitID":917,"name":"Husläkaren","isActive":true},{"unitID":918,"name":"Sickla Hälsocenter","isActive":true},{"unitID":919,"name":"Närhälsan Biskopsgården vårdcentral","isActive":true},{"unitID":920,"name":"Kumla vårdcentral, Fylstamottagningen","isActive":true},{"unitID":921,"name":"Olaus Petri VC","isActive":true},{"unitID":922,"name":"Hedesunda HC","isActive":true},{"unitID":923,"name":"Läkargruppen Mölndalsbro","isActive":true},{"unitID":924,"name":"Kåge VC","isActive":true},{"unitID":925,"name":"Familjeläkargruppen Odenplan","isActive":true},{"unitID":926,"name":"Piteå HC","isActive":true},{"unitID":928,"name":"Vårdcentralen Rud","isActive":true},{"unitID":929,"name":"Gröndals VC","isActive":true},{"unitID":930,"name":"Vittangi vårdcentral Praktikertjänst","isActive":true},{"unitID":931,"name":"Mariannelunds VC","isActive":true},{"unitID":932,"name":"Knutby VC","isActive":true},{"unitID":936,"name":"EDA vårdcentral Koppom","isActive":true},{"unitID":940,"name":"Östermalms VC","isActive":true},{"unitID":942,"name":"Vårdcentralen Oxie","isActive":true},{"unitID":943,"name":"NovaKlinikens Läkargrupp AB Ystad","isActive":true},{"unitID":944,"name":"Sunderby sjukhus","isActive":true},{"unitID":945,"name":"Vårdcentralen Åsidan","isActive":true},{"unitID":946,"name":"Ekensbergs VC","isActive":true},{"unitID":947,"name":"Hälsocentralen Kälarne","isActive":true},{"unitID":948,"name":"Älvsbyns HC","isActive":true},{"unitID":949,"name":"Capio Lundby Närsjukhus","isActive":true},{"unitID":951,"name":"Vårdcentralen Årjäng","isActive":true},{"unitID":952,"name":"Vårdcentralen Ullared","isActive":true},{"unitID":953,"name":"Dragonens Nya HC","isActive":true},{"unitID":955,"name":"Wästerläkarna","isActive":true},{"unitID":956,"name":"Storumans sjukstuga","isActive":true},{"unitID":957,"name":"Mottagningen Sjöstaden","isActive":true},{"unitID":958,"name":"Vimmerby HC","isActive":true},{"unitID":959,"name":"Vårdcentralen Höör","isActive":true},{"unitID":960,"name":"VC Norra Fäladen","isActive":true},{"unitID":962,"name":"Vindelns HC","isActive":true},{"unitID":964,"name":"Vårdcentralen Södra Sundet","isActive":true},{"unitID":965,"name":"Näsets läkargrupp HB","isActive":true},{"unitID":966,"name":"Ersboda HC","isActive":true},{"unitID":967,"name":"Capio Vårdcentral Wasa","isActive":true},{"unitID":970,"name":"Jakobsbergs sjukhus","isActive":true},{"unitID":971,"name":"CURA-kliniken","isActive":true},{"unitID":975,"name":"Robertsfors Hälsocentral","isActive":true},{"unitID":976,"name":"Granloholms VC","isActive":true},{"unitID":982,"name":"Vårdcentralen Delfinen","isActive":true},{"unitID":983,"name":"Medpro Clinic Stavre Vårdcentral","isActive":true},{"unitID":984,"name":"Banérgatans husläkarmottagning","isActive":true},{"unitID":985,"name":"HerrgärdetsVårdcentral","isActive":true},{"unitID":988,"name":"Arjeplogs HC","isActive":true},{"unitID":989,"name":"Capio vårdcentral Farsta","isActive":true},{"unitID":991,"name":"Njurunda VC","isActive":true},{"unitID":992,"name":"Söråkers VC","isActive":true},{"unitID":993,"name":"Fränsta VC","isActive":true},{"unitID":994,"name":"Granlo VC","isActive":true},{"unitID":995,"name":"Hälsocentralen Stöde","isActive":true},{"unitID":996,"name":"Timrå VC","isActive":true},{"unitID":997,"name":"Ånge VC","isActive":true},{"unitID":1000,"name":"Medpro Clinic Brålanda Vårdcentral","isActive":true},{"unitID":1001,"name":"Närhälsan Sylte vårdcentral","isActive":true},{"unitID":1003,"name":"Vårdcentralen Ankaret","isActive":true},{"unitID":1004,"name":"Viksäng-Irsta familjeläkarmottagning","isActive":true},{"unitID":1005,"name":"Närhälsan Slottsskogen vårdcentral","isActive":true},{"unitID":1006,"name":"Servicehälsan i Västerås","isActive":true},{"unitID":1007,"name":"Capio vårdcentral Gubbängen","isActive":true},{"unitID":1013,"name":"Tybble Vårdcentral","isActive":true},{"unitID":1016,"name":"Kvarnholmens HC","isActive":true},{"unitID":1017,"name":"Blomstermåla HC","isActive":true},{"unitID":1018,"name":"Runby VC","isActive":true},{"unitID":1019,"name":"Vårdcentralen Olofström","isActive":true},{"unitID":1020,"name":"Kalix sjukhus","isActive":true},{"unitID":1021,"name":"Kalix HC","isActive":true},{"unitID":1022,"name":"Grytnäs HC","isActive":true},{"unitID":1023,"name":"Primärvården Västra Ramsele,Junsele, Näsåker","isActive":true},{"unitID":1024,"name":"Vårdcentralen Slöinge","isActive":true},{"unitID":1025,"name":"Järna VC","isActive":true},{"unitID":1026,"name":"Vårdcentralen Veddige","isActive":true},{"unitID":1028,"name":"Nora VC","isActive":true},{"unitID":1030,"name":"Hässelby VC","isActive":true},{"unitID":1031,"name":"Aleris HC Bollnäs","isActive":true},{"unitID":1032,"name":"Andersbergs HC","isActive":true},{"unitID":1033,"name":"Vårdcentralen Tvååker-Himledalen","isActive":true},{"unitID":1034,"name":"Hortlax HC","isActive":true},{"unitID":1035,"name":"Capio Husläkarna Kungsbacka","isActive":true},{"unitID":1036,"name":"Vårdcentralen Borgmästaregården","isActive":true},{"unitID":1037,"name":"Vallentuna Doktorn","isActive":true},{"unitID":1038,"name":"Läkarpraktiken","isActive":true},{"unitID":1039,"name":"Närhälsan Björkekärr vårdcentral","isActive":true},{"unitID":1040,"name":"Närhälsan Masthugget vårdcentral","isActive":true},{"unitID":1041,"name":"Närhälsan Tuve vårdcentral","isActive":true},{"unitID":1042,"name":"Vårdcentralen Håsten","isActive":true},{"unitID":1043,"name":"Närhälsan Ekmanska vårdcentral","isActive":true},{"unitID":1044,"name":"Odensbackens VC","isActive":true},{"unitID":1045,"name":"Adolfbergs VC","isActive":true},{"unitID":1046,"name":"Sävar HC","isActive":true},{"unitID":1047,"name":"Vårdcentralen Hörby","isActive":true},{"unitID":1048,"name":"Onsala VC","isActive":true},{"unitID":1049,"name":"Vårdcentralen i Kristinehamn","isActive":true},{"unitID":1050,"name":"Kista VC","isActive":true},{"unitID":1051,"name":"Vårdcentralen Västra Vall","isActive":true},{"unitID":1052,"name":"Erikslids VC","isActive":true},{"unitID":1053,"name":"Vårdcentralen Svalöv","isActive":true},{"unitID":1054,"name":"Bjurholms HC","isActive":true},{"unitID":1055,"name":"Närhälsan Majorna vårdcentral","isActive":true},{"unitID":1056,"name":"Byjordens familjeläkarmottagning","isActive":true},{"unitID":1057,"name":"Brickebackens VC","isActive":true},{"unitID":1058,"name":"Bolidens VC","isActive":true},{"unitID":1059,"name":"Maria Alberts Vårdcentral","isActive":true},{"unitID":1060,"name":"Blackeberg VC","isActive":true},{"unitID":1061,"name":"Hudiksvalls HC","isActive":true},{"unitID":1062,"name":"Esplanadens HC","isActive":true},{"unitID":1064,"name":"Dr Radomskas mottagning","isActive":true},{"unitID":1065,"name":"Löttorps HC","isActive":true},{"unitID":1066,"name":"Blå Kustens HC","isActive":true},{"unitID":1067,"name":"Söderåkra HC","isActive":true},{"unitID":1068,"name":"Stora Trädgårdsgatans HC","isActive":true},{"unitID":1069,"name":"Ankarsrums HC","isActive":true},{"unitID":1070,"name":"Alby VC","isActive":true},{"unitID":1071,"name":"Ullvi-Tuna Vårdcentral","isActive":true},{"unitID":1072,"name":"Vallås VC","isActive":true},{"unitID":1073,"name":"Hälsocentralen Falken","isActive":true},{"unitID":1074,"name":"Distriktsmottagningen Timmersdala","isActive":true},{"unitID":1075,"name":"Norrtälje Norra Vårdcentral","isActive":true},{"unitID":1076,"name":"Särö VC","isActive":true},{"unitID":1077,"name":"Tärnaby Sjukstuga","isActive":true},{"unitID":1078,"name":"Fagerängens VC","isActive":true},{"unitID":1079,"name":"Länna Vårdcentral","isActive":true},{"unitID":1080,"name":"Vårdcentralen Nyland","isActive":true},{"unitID":1081,"name":"Baggängens VC","isActive":true},{"unitID":1082,"name":"Achima Care Köping Vårdcentral","isActive":true},{"unitID":1083,"name":"Achima Care Uddevalla vårdcentral","isActive":true},{"unitID":1084,"name":"Aleris Näsby Parks Husläkarmottagning","isActive":true},{"unitID":1085,"name":"Närhälsan Strömstad vårdcentral","isActive":true},{"unitID":1086,"name":"Kumla Medicinska Praktik AB","isActive":true},{"unitID":1087,"name":"Hälsocentralen Höga Kusten","isActive":true},{"unitID":1090,"name":"Capio Citykliniken Helsingborg","isActive":true},{"unitID":1092,"name":"Bergshamra VC","isActive":true},{"unitID":1093,"name":"Vårdcentralen Linden","isActive":true},{"unitID":1094,"name":"Anderstorps VC","isActive":true},{"unitID":1096,"name":"Vårdcentralen Oskarström","isActive":true},{"unitID":1097,"name":"Vårdcentralen Andersberg","isActive":true},{"unitID":1098,"name":"Vårdcentralen Fågelbacken","isActive":true},{"unitID":1099,"name":"Vidarklinikens VC","isActive":true},{"unitID":1100,"name":"Vårdcentralen Bredbyn","isActive":true},{"unitID":1101,"name":"Vårdcentralen Domsjö","isActive":true},{"unitID":1103,"name":"Fjällhälsan Hede Vemdalen","isActive":true},{"unitID":1104,"name":"Vårdcentralen Husum-Trehörningsjö","isActive":true},{"unitID":1105,"name":"Vårdcentralen Laröd","isActive":true},{"unitID":1106,"name":"Laponia HC","isActive":true},{"unitID":1110,"name":"Haparanda Hälsocentral","isActive":true},{"unitID":1111,"name":"Sotenäs Vårdcentral i Hunnebostrand","isActive":true},{"unitID":1112,"name":"Närhälsan Backa vårdcentral","isActive":true},{"unitID":1114,"name":"Husläkarna i Österåker","isActive":true},{"unitID":1115,"name":"Vårdcentralen Silentzvägen","isActive":true},{"unitID":1116,"name":"Närhälsan Partille vårdcentral","isActive":true},{"unitID":1118,"name":"Norsjö Vårdcentral","isActive":true},{"unitID":1119,"name":"Närhälsan Lysekil vårdcentral","isActive":true},{"unitID":1120,"name":"Vårdcentralen Själevad","isActive":true},{"unitID":1121,"name":"Stadsvikens HC","isActive":true},{"unitID":1122,"name":"Cerotto AB c/o Derbykliniken","isActive":true},{"unitID":1124,"name":"Närhälsan Tjörn vårdcentral","isActive":true},{"unitID":1125,"name":"Hälsocentralen","isActive":true},{"unitID":1126,"name":"Vårdcentralen Fosietorp","isActive":true},{"unitID":1127,"name":"Okända vårdcentraler","isActive":true},{"unitID":1128,"name":"Okända medicinkliniker","isActive":true},{"unitID":1129,"name":"Simon Larsson","isActive":true},{"unitID":1130,"name":"Capio vårdcentral Vallby","isActive":true},{"unitID":1132,"name":"Capio Vårdcentral Sävedalen","isActive":true},{"unitID":1133,"name":"Hallunda VC","isActive":true},{"unitID":1134,"name":"Capio Citykliniken","isActive":true},{"unitID":1135,"name":"Närhälsan Öckerö vårdcentral","isActive":true},{"unitID":1136,"name":"Bjästa Vårdcentral","isActive":true},{"unitID":1137,"name":"Rinkeby VC","isActive":true},{"unitID":1138,"name":"Vårdcentralen Rosengården","isActive":true},{"unitID":1139,"name":"Överkalix HC","isActive":true},{"unitID":1140,"name":"Övertorneå HC","isActive":true},{"unitID":1141,"name":"Vårdcentralen Kroksbäck","isActive":true},{"unitID":1142,"name":"Björknäs HC","isActive":true},{"unitID":1144,"name":"Granitens HC","isActive":true},{"unitID":1145,"name":"Vårdcentralen Lundbergsgatan","isActive":true},{"unitID":1146,"name":"Vårdcentralen Eden","isActive":true},{"unitID":1147,"name":"Vårdcentralen Husie","isActive":true},{"unitID":1148,"name":"Djursholms HLM","isActive":true},{"unitID":1149,"name":"Vårdcentralen Ljungbyhed","isActive":true},{"unitID":1150,"name":"Vårdcentralen Törnrosen","isActive":true},{"unitID":1151,"name":"Berga läkarhus","isActive":true},{"unitID":1152,"name":"Vårdcentralen Lunden","isActive":true},{"unitID":1153,"name":"Fjärås VC","isActive":true},{"unitID":1154,"name":"Närhälsan Dagson vårdcentral","isActive":true},{"unitID":1155,"name":"Vårdcentralen Gullviksborg","isActive":true},{"unitID":1156,"name":"Närhälsan Solgärde vårdcentral","isActive":true},{"unitID":1157,"name":"Huddinge VC","isActive":true},{"unitID":1158,"name":"Skepparens läkarmottagning","isActive":true},{"unitID":1159,"name":"Tensta Vårdcentral","isActive":true},{"unitID":1160,"name":"Dr Nina Clausen Sjöbom","isActive":true},{"unitID":1161,"name":"Capio Vårdcentral Väsby","isActive":true},{"unitID":1162,"name":"Bergnäsets HC","isActive":true},{"unitID":1163,"name":"Plus7 Vårdcentralen","isActive":true},{"unitID":1164,"name":"Capio Citykliniken Kristianstad","isActive":true},{"unitID":1165,"name":"Nynäsvård AB Diabetesmott","isActive":true},{"unitID":1166,"name":"Riksby VC","isActive":true},{"unitID":1168,"name":"Centrumkliniken","isActive":true},{"unitID":1169,"name":"Vårdcentralen Lindeborg","isActive":true},{"unitID":1170,"name":"Barkarby VC","isActive":true},{"unitID":1171,"name":"Skärholmens VC","isActive":true},{"unitID":1172,"name":"Luthagens VC","isActive":true},{"unitID":1173,"name":"Öjebyns HC","isActive":true},{"unitID":1174,"name":"Oxbacken Skultuna Vårdcentral","isActive":true},{"unitID":1175,"name":"Asomeda Vallentuna Vårdcentral","isActive":true},{"unitID":1176,"name":"Dr K Hedlunds mottagning","isActive":true},{"unitID":1177,"name":"Amadeuskliniken","isActive":true},{"unitID":1178,"name":"Gällivare sjukhus","isActive":true},{"unitID":1179,"name":"Luthagsgården HB Husläkargrupp","isActive":true},{"unitID":1180,"name":"Vårdcentralen Stadsfjärden","isActive":true},{"unitID":1181,"name":"Sandens HC","isActive":true},{"unitID":1183,"name":"Närhälsan Kungshöjd vårdcentral","isActive":true},{"unitID":1184,"name":"Grindberga familjeläkarenhet","isActive":true},{"unitID":1186,"name":"Hertsöns HC","isActive":true},{"unitID":1187,"name":"CityHeart","isActive":true},{"unitID":1193,"name":"Achima Care Sala Vårdcentral","isActive":true},{"unitID":1194,"name":"Capio Citykliniken Malmö Centrum","isActive":true},{"unitID":1195,"name":"Vårdcentralen Närlunda","isActive":true},{"unitID":1196,"name":"St Eriks VC","isActive":true},{"unitID":1197,"name":"Äldrevårdscentralen","isActive":true},{"unitID":1198,"name":"Edsberg VC","isActive":true},{"unitID":1199,"name":"Hemdal Vårdcentral","isActive":true},{"unitID":1200,"name":"Hallstahammar Vårdcentral","isActive":true},{"unitID":1201,"name":"Capio vårdcentral Grästorp","isActive":true},{"unitID":1202,"name":"Vårdcentralen Katten","isActive":true},{"unitID":1203,"name":"Tullinge VC","isActive":true},{"unitID":1206,"name":"Stocksunds VC","isActive":true},{"unitID":1207,"name":"Kvartersakuten Matteus","isActive":true},{"unitID":1208,"name":"Närhälsan Lövgärdet vårdcentral","isActive":true},{"unitID":1209,"name":"Sundsvalls vårdcentral Skönsmon","isActive":true},{"unitID":1210,"name":"Liljeholmens Vårdcentralen","isActive":true},{"unitID":1211,"name":"Vårby VC","isActive":true},{"unitID":1212,"name":"Ulriksdals VC","isActive":true},{"unitID":1213,"name":"Bergshamra Ulriksdal VC","isActive":true},{"unitID":1217,"name":"Fruängens VC","isActive":true},{"unitID":1218,"name":"Sköndals VC","isActive":true},{"unitID":1219,"name":"Erikslunds Hälsocentral","isActive":true},{"unitID":1221,"name":"Ängsgårdens Vårdcentral","isActive":true},{"unitID":1222,"name":"Prima Familjeläkarmottagning","isActive":true},{"unitID":1223,"name":"Läkarhuset Ellenbogen","isActive":true},{"unitID":1224,"name":"Furunäsets HC","isActive":true},{"unitID":1225,"name":"Fittja VC","isActive":true},{"unitID":1226,"name":"Läkarhuset Kronan","isActive":true},{"unitID":1227,"name":"Capio Vårdcentral Axess","isActive":true},{"unitID":1228,"name":"Norrfjärdens Hälsocentral","isActive":true},{"unitID":1229,"name":"Skinnskattebergs Vårdcentral","isActive":true},{"unitID":1230,"name":"Dr Johnny Nielsens mottagning","isActive":true},{"unitID":1231,"name":"Capio Vårdcentral Västerås City","isActive":true},{"unitID":1232,"name":"Täby Centrum Doktorn","isActive":true},{"unitID":1233,"name":"Närhälsan Mölnlycke vårdcentral","isActive":true},{"unitID":1234,"name":"Kävlinge VC","isActive":true},{"unitID":1235,"name":"Johannes husläkarmottagning","isActive":true},{"unitID":1236,"name":"Medicinmottagningen Sophiahemmet","isActive":true},{"unitID":1238,"name":"Pajala HC","isActive":true},{"unitID":1239,"name":"Roslagshälsans HLM","isActive":true},{"unitID":1240,"name":"Vallentuna Husläkargrupp","isActive":true},{"unitID":1241,"name":"Capio Husläkaremottagning Serafen","isActive":true},{"unitID":1242,"name":"Gärdets VC","isActive":true},{"unitID":1243,"name":"Hjorthagens husläkarmottagning","isActive":true},{"unitID":1245,"name":"Flogsta VC","isActive":true},{"unitID":1246,"name":"Capio StadshusDoktorn Lidingö","isActive":true},{"unitID":1247,"name":"VC Hertig Knut","isActive":true},{"unitID":1248,"name":"Nyhems VC","isActive":true},{"unitID":1249,"name":"Tudorklinikens allmänläkarmottagning","isActive":true},{"unitID":1250,"name":"Solna läkarmottagning","isActive":true},{"unitID":1251,"name":"Essinge VC","isActive":true},{"unitID":1252,"name":"Bredängs VC","isActive":true},{"unitID":1253,"name":"Sätra Vårdcentral","isActive":true},{"unitID":1254,"name":"Odensvi Familjeläkarmottagning","isActive":true},{"unitID":1255,"name":"Vårdcentralen Tågaborg","isActive":true},{"unitID":1256,"name":"Aleris VallatorpsDoktorn","isActive":true},{"unitID":1257,"name":"Vårdcentralen Råå","isActive":true},{"unitID":1259,"name":"Vårdcentralen Drottninghög","isActive":true},{"unitID":1260,"name":"Sala Väsby Vårdcentral","isActive":true},{"unitID":1261,"name":"Flemingsbergs Vårdcentral","isActive":true},{"unitID":1262,"name":"Familjeläkarna i Forserum","isActive":true},{"unitID":1263,"name":"Österåkers Doktorn","isActive":true},{"unitID":1264,"name":"Storvretens vårdcentral AB","isActive":true},{"unitID":1265,"name":"Bäckby familjeläkarmottagning","isActive":true},{"unitID":1266,"name":"Stuvsta VC","isActive":true},{"unitID":1267,"name":"Lidingödoktorn","isActive":true},{"unitID":1269,"name":"Vårdcentralen Rydebäck","isActive":true},{"unitID":1270,"name":"Kolsva Vårdcentral","isActive":true},{"unitID":1271,"name":"Västervårdens Husläkarmottagning","isActive":true},{"unitID":1273,"name":"HälsoRingen Vård Knäred","isActive":true},{"unitID":1274,"name":"Familjeläkarna vid Torget","isActive":true},{"unitID":1275,"name":"Äppelvikens läkarmottagning","isActive":true},{"unitID":1276,"name":"Vårdcentral Ingrid Marie","isActive":true},{"unitID":1277,"name":"Hjärtdiagnostik i Sundsvall AB","isActive":true},{"unitID":1278,"name":"Neptunuskliniken","isActive":true},{"unitID":1279,"name":"Lisebergs VC","isActive":true},{"unitID":1281,"name":"Privatlälakarna Hälsovalet Helsingborg","isActive":true},{"unitID":1282,"name":"Kallhälls Nya VC","isActive":true},{"unitID":1283,"name":"Capio Citykliniken Klippan","isActive":true},{"unitID":1284,"name":"Läkarhuset Väster","isActive":true},{"unitID":1285,"name":"Norrtälje Södra husläkarmot Tiohundra","isActive":true},{"unitID":1288,"name":"Rådhusläkarna","isActive":true},{"unitID":1289,"name":"Läkarmottagningen GrevTure","isActive":true},{"unitID":1290,"name":"Valens läkargrupp","isActive":true},{"unitID":1292,"name":"Familjeläkarna Önsta-Gryta","isActive":true},{"unitID":1294,"name":"Vårdcentralen Östervåla","isActive":true},{"unitID":1295,"name":"Läkarhuset Jönköping","isActive":true},{"unitID":1296,"name":"Stenhamra VC","isActive":true},{"unitID":1297,"name":"Näsets Läkargrupp i Skanör","isActive":true},{"unitID":1298,"name":"Läjeskliniken","isActive":true},{"unitID":1299,"name":"Capio Familjeläkarna Söderbro Skrea","isActive":true},{"unitID":1300,"name":"Vårdcentralen Torup","isActive":true},{"unitID":1301,"name":"Läkargruppen Tre Hjärtan","isActive":true},{"unitID":1302,"name":"LäkarGruppen","isActive":true},{"unitID":1303,"name":"Stiftelsen Stora Sköndal","isActive":true},{"unitID":1304,"name":"Mörby VC","isActive":true},{"unitID":1305,"name":"Kungsgårdshälsan","isActive":true},{"unitID":1306,"name":"Säröledens Familjeläkare","isActive":true},{"unitID":1307,"name":"Brommaplans VC","isActive":true},{"unitID":1308,"name":"Björkskatans HC","isActive":true},{"unitID":1309,"name":"Heby VC","isActive":true},{"unitID":1310,"name":"Familjeläkarmottagningen","isActive":true},{"unitID":1311,"name":"Närhälsan Opaltorget vårdcentral","isActive":true},{"unitID":1313,"name":"Rotebro VC","isActive":true},{"unitID":1314,"name":"Vårdcentralen Centrum","isActive":true},{"unitID":1315,"name":"Hallonbergens VC","isActive":true},{"unitID":1319,"name":"Hammarby Sjöstads Husläkare","isActive":true},{"unitID":1322,"name":"Kringlans vårdcentrum","isActive":true},{"unitID":1323,"name":"Vårdcentralen Husensjö","isActive":true},{"unitID":1324,"name":"Astrakanen Nybro Läkarcentrum","isActive":true},{"unitID":1325,"name":"Kungsörs Vårdcentral","isActive":true},{"unitID":1327,"name":"Läkarhuset Prima","isActive":true},{"unitID":1328,"name":"Tvings läkarmottagning","isActive":true},{"unitID":1329,"name":"Kungsmarkens VC","isActive":true},{"unitID":1330,"name":"Läkarhuset Roslunda","isActive":true},{"unitID":1331,"name":"Skagerns Vård och Hälsoenhet","isActive":true},{"unitID":1332,"name":"Engelbrektskliniken","isActive":true},{"unitID":1333,"name":"Edö Äldreboende","isActive":true},{"unitID":1335,"name":"Hälsoringen Glänninge","isActive":true},{"unitID":1336,"name":"Slottsfjärdens läkarmottagning","isActive":true},{"unitID":1337,"name":"Stora Sköndals särskilda boenden","isActive":true},{"unitID":1338,"name":"Vårdcentralen i Skarpnäck","isActive":true},{"unitID":1339,"name":"Scania Husläkarmottagning","isActive":true},{"unitID":1341,"name":"Veritaskliniken Ekerö husläkarmottagning","isActive":true},{"unitID":1342,"name":"Gammelstads HC","isActive":true},{"unitID":1343,"name":"Göran Svensson läkarmottagning","isActive":true},{"unitID":1344,"name":"Capio vårdcentral Gullmarsplan","isActive":true},{"unitID":1345,"name":"Trångsunds VC","isActive":true},{"unitID":1346,"name":"Älvsjö Vårdcentral","isActive":true},{"unitID":1347,"name":"Angereds närsjukhus","isActive":true},{"unitID":1349,"name":"Vårdcentralen Visborg","isActive":true},{"unitID":1350,"name":"Läkarmottagningen Sparta","isActive":true},{"unitID":1351,"name":"Proxima Primärvård/vårdcentral","isActive":true},{"unitID":1352,"name":"Familjeläkarna i Saltsjöbaden","isActive":true},{"unitID":1353,"name":"Vårdcentralen Hansahälsan","isActive":true},{"unitID":1354,"name":"Husläkarmottagningen Stockholms sjukhem","isActive":true},{"unitID":1355,"name":"Vaxholms VC","isActive":true},{"unitID":1356,"name":"Kvartersakuten Surbrunn","isActive":true},{"unitID":1357,"name":"Företagshälsovården Smurfit Kappa Craftliner","isActive":true},{"unitID":1359,"name":"Turebergs VC","isActive":true},{"unitID":1360,"name":"Ockelbo familjeläkarmottagning","isActive":true},{"unitID":1361,"name":"Brommaakuten","isActive":true},{"unitID":1362,"name":"Läkargruppen Victoria","isActive":true},{"unitID":1363,"name":"Kolbäcks familjeläkarmottagning","isActive":true},{"unitID":1364,"name":"Ekeby vårdcentral AchiMa Care AB","isActive":true},{"unitID":1366,"name":"DjursholmsDoktorn","isActive":true},{"unitID":1367,"name":"Örnäsets HC","isActive":true},{"unitID":1369,"name":"Hönö Vårdcentral","isActive":true},{"unitID":1370,"name":"Capio VC Vårberg","isActive":true},{"unitID":1371,"name":"Capio Vårdcentral Lidingö","isActive":true},{"unitID":1372,"name":"Husläkarmott i Täby Centrum","isActive":true},{"unitID":1373,"name":"Vården i Centrum","isActive":true},{"unitID":1375,"name":"Närhälsan Tidaholm vårdcentral","isActive":true},{"unitID":1376,"name":"Asyl och Integrationshälsan","isActive":true},{"unitID":1377,"name":"Capio Vårdcentral Taptogatan","isActive":true},{"unitID":1378,"name":"Backa Läkarhus","isActive":true},{"unitID":1379,"name":"Nynäsakuten","isActive":true},{"unitID":1380,"name":"NovaKliniken Tomelilla","isActive":true},{"unitID":1381,"name":"Stattena VC","isActive":true},{"unitID":1382,"name":"Ödåkra Läkargrupp AB","isActive":true},{"unitID":1383,"name":"Platsarna läkarmottagning","isActive":true},{"unitID":1384,"name":"Capio Göingekliniken","isActive":true},{"unitID":1385,"name":"Capio Citykliniken Hallstahammar","isActive":true},{"unitID":1386,"name":"Capio Citykliniken Olympia","isActive":true},{"unitID":1387,"name":"Båstad Bjäre Läkarpraktik","isActive":true},{"unitID":1388,"name":"Vårdcentralen Planteringen","isActive":true},{"unitID":1389,"name":"Familjeläkarna i Laholm","isActive":true},{"unitID":1390,"name":"VC Växjöhälsan","isActive":true},{"unitID":1391,"name":"Hälsoringen Vård Älmhult","isActive":true},{"unitID":1392,"name":"Husläkarmottagningen Doktor Kom Hem","isActive":true},{"unitID":1393,"name":"Hälsomedicinskt center Hjärup","isActive":true},{"unitID":1395,"name":"Kungsportsläkarna","isActive":true},{"unitID":1396,"name":"Capio Vårdcentral Solna","isActive":true},{"unitID":1397,"name":"VC Specialistläkargruppen Växjö","isActive":true},{"unitID":1398,"name":"Nya Järva Vårdmottagning","isActive":true},{"unitID":1399,"name":"Närhälsan Torpavallen vårdcentral","isActive":true},{"unitID":1400,"name":"Läkarcentrum Nyponet","isActive":true},{"unitID":1401,"name":"Kåbohälsan","isActive":true},{"unitID":1402,"name":"Enköpingshälsan","isActive":true},{"unitID":1403,"name":"Närhälsan Furulund vårdcentral","isActive":true},{"unitID":1404,"name":"Navets VC","isActive":true},{"unitID":1405,"name":"Novakliniken Sjöbo","isActive":true},{"unitID":1406,"name":"Oxtorgets HC","isActive":true},{"unitID":1408,"name":"Diabetesmottagningen Sophiahemmet","isActive":true},{"unitID":1410,"name":"Norrvikens VC","isActive":true},{"unitID":1411,"name":"Märsta Läkarhus AB","isActive":true},{"unitID":1412,"name":"Dr Hans Thulin, Gruppläkarmottagningen","isActive":true},{"unitID":1413,"name":"Familjehälsan Åstorp","isActive":true},{"unitID":1414,"name":"Capio Citykliniken Clemenstorget","isActive":true},{"unitID":1415,"name":"Centrumläkarna Adolfsberg","isActive":true},{"unitID":1416,"name":"Hötorgets Vårdcentral","isActive":true},{"unitID":1417,"name":"VC Specialistläkargruppen Hälsans hus","isActive":true},{"unitID":1418,"name":"Ekenhälsan","isActive":true},{"unitID":1419,"name":"Ramlösa VC","isActive":true},{"unitID":1420,"name":"Bohuspraktiken","isActive":true},{"unitID":1421,"name":"Capio Vårdcentral Östermalm","isActive":true},{"unitID":1422,"name":"Järnhälsan","isActive":true},{"unitID":1424,"name":"Vårdcentralen Bunkeflo","isActive":true},{"unitID":1426,"name":"Novakliniken Veberöd","isActive":true},{"unitID":1427,"name":"Sotenäs Vårdcentral i Hunnebostrand","isActive":true},{"unitID":1428,"name":"Primapraktiken","isActive":true},{"unitID":1429,"name":"Nötkärnan Kållered Familjeläkare och BVC","isActive":true},{"unitID":1430,"name":"Kvarterskliniken Tanum","isActive":true},{"unitID":1431,"name":"Hälsocentralen Sankt Hans","isActive":true},{"unitID":1432,"name":"Nötkärnan Masthugget Familjeläkare och BVC","isActive":true},{"unitID":1435,"name":"Tibra medica AB, Husläkarmott Kista Hälsocenter","isActive":true},{"unitID":1436,"name":"Vårdcentralen Nordstan","isActive":true},{"unitID":1437,"name":"Vårdcentralen Centrum","isActive":true},{"unitID":1439,"name":"Bräcke Diakoni Vårdcentralen Centrum","isActive":true},{"unitID":1441,"name":"Backa Läkarhusgruppen Stenungsund","isActive":true},{"unitID":1442,"name":"JohannesVården - Vårdcentral och BVC","isActive":true},{"unitID":1443,"name":"Vårdcentralen Kurhälsan","isActive":true},{"unitID":1444,"name":"Capio Vårdcentral Lundby","isActive":true},{"unitID":1445,"name":"Avonova Kinnekullehälsan Mariestad","isActive":true},{"unitID":1446,"name":"Adina Hälsans Vårdcentral Nol","isActive":true},{"unitID":1447,"name":"Nya Vårdcentralen Kortedala Torg","isActive":true},{"unitID":1448,"name":"Lysekils Läkarhus","isActive":true},{"unitID":1449,"name":"Adina Hälsans Vårdcentral Sävedalen","isActive":true},{"unitID":1450,"name":"Vårdcentralen Limhamn","isActive":true},{"unitID":1451,"name":"Vårdcentralen Bohuslinden","isActive":true},{"unitID":1452,"name":"Torslanda Läkarhus","isActive":true},{"unitID":1453,"name":"Selmas Läkarhus","isActive":true},{"unitID":1454,"name":"Rudans vårdcentral Praktikertjänst  AB","isActive":true},{"unitID":1457,"name":"Capio Vårdcentral Amhult","isActive":true},{"unitID":1458,"name":"Kvarterskliniken Lorensberg","isActive":true},{"unitID":1459,"name":"Gränsbygdskliniken","isActive":true},{"unitID":1460,"name":"Väddö VC","isActive":true},{"unitID":1461,"name":"Allemanshälsans vårdcentral Lunden","isActive":true},{"unitID":1462,"name":"Vårdcentralen Medicinskt Centrum","isActive":true},{"unitID":1463,"name":"Vårdcentralen Vilan","isActive":true},{"unitID":1464,"name":"Nötkärnan Friskväderstorget Vårdcentral och BVC","isActive":true},{"unitID":1465,"name":"Nötkärnan Bergsjön Vårdcentral och BVC","isActive":true},{"unitID":1466,"name":"Hagaklinikens Vårdcentral","isActive":true},{"unitID":1467,"name":"Nötkärnan Sävelången Familjeläkare och BVC","isActive":true},{"unitID":1468,"name":"Veritaskliniken","isActive":true},{"unitID":1469,"name":"Quality Care Europe AB","isActive":true},{"unitID":1470,"name":"Nötkärnan Kortedala Vårdcentral och BVC","isActive":true},{"unitID":1471,"name":"Nötkärnan Hovås Askim Familjeläkare och BVC","isActive":true},{"unitID":1472,"name":"Värmdö VC","isActive":true},{"unitID":1473,"name":"Kvarterskliniken Husaren","isActive":true},{"unitID":1474,"name":"VC Familjedoktorerna","isActive":true},{"unitID":1477,"name":"Laurentiikliniken Hälsoringen","isActive":true},{"unitID":1478,"name":"Vårdcentralen Läkarhuset","isActive":true},{"unitID":1479,"name":"Medicindirekt AB","isActive":true},{"unitID":1480,"name":"Brämhults Vårdcentral","isActive":true},{"unitID":1481,"name":"Capio Husläkarna Vallda","isActive":true},{"unitID":1482,"name":"Din Klinik","isActive":true},{"unitID":1483,"name":"Aleris Vårdcentral Järva","isActive":true},{"unitID":1484,"name":"Solljungahälsan","isActive":true},{"unitID":1485,"name":"Allemanshälsans vårdcentral Landala","isActive":true},{"unitID":1486,"name":"Vårdcentralen Smeden","isActive":true},{"unitID":1487,"name":"Husby Akalla VC","isActive":true},{"unitID":1490,"name":"Allemanshälsans vårdcentral Jungfruplatsen","isActive":true},{"unitID":1491,"name":"Hälsocentralen Ellenbogen","isActive":true},{"unitID":1492,"name":"Vårdcentralen Kyrkbacken","isActive":true},{"unitID":1493,"name":"Pålsboda VC","isActive":true},{"unitID":1494,"name":"Novakliniken Missuna","isActive":true},{"unitID":1495,"name":"Angereds Läkarhus","isActive":true},{"unitID":1496,"name":"Novakliniken Simrishamn","isActive":true},{"unitID":1497,"name":"Harmånger HC","isActive":true},{"unitID":1498,"name":"Virsbodoktorn","isActive":true},{"unitID":1499,"name":"Knivsta läkargrupp","isActive":true},{"unitID":1500,"name":"Allékliniken Sleipner Vårdcentral","isActive":true},{"unitID":1501,"name":"Örestadskliniken","isActive":true},{"unitID":1503,"name":"Läkehjälpen Olofström AB","isActive":true},{"unitID":1504,"name":"Vårdcentralen Svea","isActive":true},{"unitID":1505,"name":"Capio Citykliniken Ängelholm","isActive":true},{"unitID":1506,"name":"Din Doktor Märsta","isActive":true},{"unitID":1507,"name":"Råneå HC","isActive":true},{"unitID":1508,"name":"Närhälsan Stora Höga vårdcentral","isActive":true},{"unitID":1509,"name":"Vårdcentralen Centrum Flen","isActive":true},{"unitID":1510,"name":"Kungsholmsdoktorn AB","isActive":true},{"unitID":1511,"name":"Vårdcentralen Sorgenfrimottagningen","isActive":true},{"unitID":1513,"name":"Capio Vårdcentral Gårda","isActive":true},{"unitID":1514,"name":"Curera Farsta","isActive":true},{"unitID":1516,"name":"Vintergatans Vårdcentralen","isActive":true},{"unitID":1518,"name":"Kristinehamns Nya VC","isActive":true},{"unitID":1519,"name":"Wetterhälsan AB","isActive":true},{"unitID":1520,"name":"Öbacka VC","isActive":true},{"unitID":1523,"name":"Familjehälsan Vårdcentral","isActive":true},{"unitID":1524,"name":"Vårdcentralen Lokstallarna","isActive":true},{"unitID":1525,"name":"Avonova vårdcentral Vetlanda","isActive":true},{"unitID":1526,"name":"Vårdcentralen Aroma","isActive":true},{"unitID":1527,"name":"Filipstads Nya VC","isActive":true},{"unitID":1528,"name":"Sigtuna VC","isActive":true},{"unitID":1530,"name":"E Ehnevids Läkarmottagning","isActive":true},{"unitID":1531,"name":"Vårdcentralen Nyhälsan","isActive":true},{"unitID":1532,"name":"Landsbro VC","isActive":true},{"unitID":1534,"name":"Gislehälsan","isActive":true},{"unitID":1536,"name":"Avonova Kinnekullehälsan Götene","isActive":true},{"unitID":1537,"name":"Vårdcentralen City Skövde","isActive":true},{"unitID":1538,"name":"Cederkliniken","isActive":true},{"unitID":1540,"name":"Capio Vårdcentral Billdal","isActive":true},{"unitID":1541,"name":"Attundahälsans familjeläkarmottagning","isActive":true},{"unitID":1542,"name":"Vårdcentralen Johannesberg","isActive":true},{"unitID":1543,"name":"Balderkliniken","isActive":true},{"unitID":1544,"name":"Norrlandskliniken","isActive":true},{"unitID":1547,"name":"Allemanshälsans vårdcentral Frölunda","isActive":true},{"unitID":1548,"name":"Bräcke Diakoni Vårdcentralen Centralhälsan","isActive":true},{"unitID":1549,"name":"Citymottagningen","isActive":true},{"unitID":1551,"name":"Västerleden Vårdcentral - Grimmered","isActive":true},{"unitID":1552,"name":"Vår Vårdcentral","isActive":true},{"unitID":1553,"name":"Fredriksdals Läkarhus","isActive":true},{"unitID":1554,"name":"Sundets läkargrupp","isActive":true},{"unitID":1555,"name":"Hälsohuset för alla","isActive":true},{"unitID":1556,"name":"Victoria Vård och Hälsa","isActive":true},{"unitID":1558,"name":"Kvarterskliniken Almedal","isActive":true},{"unitID":1560,"name":"Akutläkarna Västra Frölunda","isActive":true},{"unitID":1562,"name":"Hälsans Hus Vårdcentral","isActive":true},{"unitID":1563,"name":"Närhälsan Eriksberg vårdcentral","isActive":true},{"unitID":1564,"name":"Brukshälsan","isActive":true},{"unitID":1565,"name":"Familjeläkarna i Sverige AB","isActive":true},{"unitID":1567,"name":"Norra Ölands Läkarmottagning","isActive":true},{"unitID":1568,"name":"Husläkarna Varmbadhuset","isActive":true},{"unitID":1570,"name":"Hälsopartner HC","isActive":true},{"unitID":1571,"name":"Åkermyntans VC","isActive":true},{"unitID":1572,"name":"Avonova Specialistläkargruppen Värnamo","isActive":true},{"unitID":1574,"name":"Hälsocentralen City","isActive":true},{"unitID":1575,"name":"HumanResurs VC","isActive":true},{"unitID":1576,"name":"Akutläkarna Vårdcentralen Stampen","isActive":true},{"unitID":1577,"name":"Nya Närvården AB","isActive":true},{"unitID":1578,"name":"Wasa City klinik","isActive":true},{"unitID":1579,"name":"Voxnadalens HC","isActive":true},{"unitID":1580,"name":"Apladalens VC","isActive":true},{"unitID":1581,"name":"Vrigstad läkarmottagning","isActive":true},{"unitID":1582,"name":"Kvartersakuten Mörby Centrum","isActive":true},{"unitID":1583,"name":"Kinnekullehälsans VC","isActive":true},{"unitID":1584,"name":"Trädgårdstorgets Vårdcentral","isActive":true},{"unitID":1585,"name":"Vårdcentral Läkarhuset Sensia","isActive":true},{"unitID":1586,"name":"Varvets HC","isActive":true},{"unitID":1587,"name":"Familjeläkarna i Olofström","isActive":true},{"unitID":1588,"name":"Läkarhuset i Karlshamn","isActive":true},{"unitID":1589,"name":"Primärvården Hoting","isActive":true},{"unitID":1591,"name":"Telefonplans husläkarmottagning","isActive":true},{"unitID":1592,"name":"Valjehälsan","isActive":true},{"unitID":1593,"name":"Husläkarnas HC","isActive":true},{"unitID":1594,"name":"Vårdcentralen Åttkanten","isActive":true},{"unitID":1596,"name":"Medicinkonsulten AB Hälsocentral","isActive":true},{"unitID":1598,"name":"Vårdcentralen i Alvesta","isActive":true},{"unitID":1599,"name":"Arkadens läkarmottagning","isActive":true},{"unitID":1600,"name":"Stenblomman VC","isActive":true},{"unitID":1602,"name":"HälsoBrunnen - vårdcentral","isActive":true},{"unitID":1603,"name":"Husläkarmottagningen Chapmans torg","isActive":true},{"unitID":1604,"name":"Nässjö Läkarhus","isActive":true},{"unitID":1605,"name":"Domus Medica","isActive":true},{"unitID":1606,"name":"Tenhults VC","isActive":true},{"unitID":1607,"name":"Sensia Sjukvård","isActive":true},{"unitID":1608,"name":"Hälsogemenskapen","isActive":true},{"unitID":1609,"name":"Doktorteam CeMax AB","isActive":true},{"unitID":1610,"name":"Familjeläkarna i City","isActive":true},{"unitID":1612,"name":"Carema Sjukvård","isActive":true},{"unitID":1613,"name":"Husläkarmottagningen Sophiahemmet","isActive":true},{"unitID":1614,"name":"Solklart vård i Bjuv","isActive":true},{"unitID":1615,"name":"Virserums Läkarhus","isActive":true},{"unitID":1616,"name":"Efoel husläkarmottagning","isActive":true},{"unitID":1617,"name":"Ängens Vårdcentral","isActive":true},{"unitID":1618,"name":"Familjeläkarna i Kista","isActive":true},{"unitID":1619,"name":"Gävle Strand Din HC","isActive":true},{"unitID":1620,"name":"Försäkringsmottagningen Sophiahemmet","isActive":true},{"unitID":1622,"name":"Vårdcentralen Fristaden Södermanland","isActive":true},{"unitID":1624,"name":"ToCare City","isActive":true},{"unitID":1626,"name":"Adviva HC","isActive":true},{"unitID":1628,"name":"SmålandsHälsan","isActive":true},{"unitID":1630,"name":"Husläkarcentrum","isActive":true},{"unitID":1631,"name":"Söderhamnsfjärdens HC","isActive":true},{"unitID":1632,"name":"BålstaDoktorn","isActive":true},{"unitID":1633,"name":"Läkarhuset Tranås","isActive":true},{"unitID":1634,"name":"Läkarhuset Huskvarna","isActive":true},{"unitID":1635,"name":"Capio Citykliniken Mariastaden","isActive":true},{"unitID":1636,"name":"Läkarhuset Ljungby","isActive":true},{"unitID":1637,"name":"Vårdcentralen Feelgood","isActive":true},{"unitID":1638,"name":"Capio Citykliniken Västra Hamnen","isActive":true},{"unitID":1639,"name":"Capio Citykliniken Singelgatan","isActive":true},{"unitID":1640,"name":"Riddarhusläkarna","isActive":true},{"unitID":1641,"name":"Familjeläkarna i Husby","isActive":true},{"unitID":1642,"name":"Hamnstadens Vårdcentral","isActive":true},{"unitID":1643,"name":"Dr Anders Blombergs mottagning","isActive":true},{"unitID":1645,"name":"Ekeby Hälsocenter","isActive":true},{"unitID":1646,"name":"Capio Cityklinik Bunkeflo Hylje","isActive":true},{"unitID":1647,"name":"Ronna VC","isActive":true},{"unitID":1648,"name":"Vårdcentralen Badhotellet","isActive":true},{"unitID":1649,"name":"Vårdcentral Koppardalen","isActive":true},{"unitID":1650,"name":"Cityläkarna Borås","isActive":true},{"unitID":1652,"name":"Liljeholmskajens VC","isActive":true},{"unitID":1654,"name":"Närhälsan Brastad vårdcentral","isActive":true},{"unitID":1655,"name":"Vårbergs VC","isActive":true},{"unitID":1656,"name":"Sidsjö VC","isActive":true},{"unitID":1658,"name":"BrommaAkuten VC","isActive":true},{"unitID":1659,"name":"Slottsbergskliniken","isActive":true},{"unitID":1660,"name":"MultiClinic Skåne","isActive":true},{"unitID":1664,"name":"Falu Vårdcentral","isActive":true},{"unitID":1665,"name":"Viktoriakliniken Eldsberga","isActive":true},{"unitID":1666,"name":"CityDiabetes","isActive":true},{"unitID":1669,"name":"Aleris Barncentrum och Vårdcentral Uppsala","isActive":true},{"unitID":1672,"name":"Husläkarmottagningen Bryggaregatan ab","isActive":true},{"unitID":1673,"name":"Almö Läkarhus","isActive":true},{"unitID":1674,"name":"Beckomberga VC","isActive":true},{"unitID":1675,"name":"Capio Vårdcentralen Slussen","isActive":true},{"unitID":1676,"name":"Geria VC","isActive":true},{"unitID":1677,"name":"Sjöstadsdoktorn","isActive":true},{"unitID":1678,"name":"Vårdcentralen Feelgood Torslanda","isActive":true},{"unitID":1679,"name":"Väsby Läkargrupp Husläkarmottagning","isActive":true},{"unitID":1680,"name":"Telefonplans VC","isActive":true},{"unitID":1681,"name":"Arlanda Sky Clinic","isActive":true},{"unitID":1683,"name":"Cityakutens husläkarmottagning","isActive":true},{"unitID":1684,"name":"Feelgood vårdcentral Grevturegatan","isActive":true},{"unitID":1685,"name":"Vårdhuset Malmö city","isActive":true},{"unitID":1686,"name":"Vårdcentral Avestahälsan","isActive":true},{"unitID":1687,"name":"Vårdcentral Engelbrekt Ludvika","isActive":true},{"unitID":1689,"name":"Fridhemsplans VC","isActive":true},{"unitID":1690,"name":"Hälsoteamet Anderstorp","isActive":true},{"unitID":1691,"name":"Hälsoteamet Gislaved","isActive":true},{"unitID":1692,"name":"Hälsoteamet Mullsjö","isActive":true},{"unitID":1693,"name":"Hälsoteamet Smålandsstenar","isActive":true},{"unitID":1694,"name":"Lövånger HC","isActive":true},{"unitID":1695,"name":"To Care Husläkarmott Solna Sundbyberg","isActive":true},{"unitID":1696,"name":"Förenade Care Svenstavik (Hemvård Mitt)","isActive":true},{"unitID":1697,"name":"Nya Närvården NNV AB","isActive":true},{"unitID":1698,"name":"Baldersnäs Din HC","isActive":true},{"unitID":1699,"name":"Vårdcentral Solnas Hjärta","isActive":true},{"unitID":1700,"name":"Sickla Hälsocenter Danviken","isActive":true},{"unitID":1701,"name":"Vårdcentralen centrum Familjedoktorerna","isActive":true},{"unitID":1702,"name":"E-Hälsan Mitt Hjärta","isActive":true},{"unitID":1703,"name":"Rosengårdskliniken","isActive":true},{"unitID":1705,"name":"Boländernas VC","isActive":true},{"unitID":1706,"name":"Vårdkliniken i Ängelholm","isActive":true},{"unitID":1707,"name":"Hälsocentralen i Näsum","isActive":true},{"unitID":1708,"name":"Ljustadalens Hälsocentral Premicare","isActive":true},{"unitID":1709,"name":"Vårdcentralen Brahehälsan Eslöv","isActive":true},{"unitID":1710,"name":"HND - centrum","isActive":true},{"unitID":1711,"name":"Angered Care Vårdcentral","isActive":true},{"unitID":1712,"name":"Hälsomedicinskt center Lomma","isActive":true},{"unitID":1713,"name":"Lundens Husläkarmottagning","isActive":true},{"unitID":1714,"name":"Cityläkarna i Kalmar AB","isActive":true},{"unitID":1715,"name":"Min Hälsa Hälsocentral","isActive":true},{"unitID":1716,"name":"Strömstad Läkarhus","isActive":true},{"unitID":1717,"name":"Capio Hälsocentral Wasahuset","isActive":true},{"unitID":1718,"name":"Emmakliniken","isActive":true},{"unitID":1719,"name":"Nockebyhöjdens Vårdcentral","isActive":true},{"unitID":1720,"name":"Hälsans Vårdcentral Tensta","isActive":true},{"unitID":1721,"name":"Vårdcentralen Getingen","isActive":true},{"unitID":1722,"name":"Tryggakliniken Bromölla","isActive":true},{"unitID":1726,"name":"Västerleden Vårdcentral och BVC - Frölunda Torg","isActive":true},{"unitID":1727,"name":"Vårdcentralen Flottiljen","isActive":true},{"unitID":1728,"name":"Crama Vårdcentral","isActive":true},{"unitID":1729,"name":"Vårdcentralen Hökarängen","isActive":true},{"unitID":1730,"name":"EIRA Hälsocentral","isActive":true},{"unitID":1731,"name":"Christian Rosqvist Läkarmottagning","isActive":true},{"unitID":1732,"name":"Håstaholmens Hälsocentral","isActive":true},{"unitID":1733,"name":"St Olof Vårdcentral","isActive":true},{"unitID":1734,"name":"Hälsomedicinskt Center Landskrona","isActive":true},{"unitID":1735,"name":"Vårdcentralen Kolla","isActive":true},{"unitID":1736,"name":"Husläkaren Lugn och Ro","isActive":true},{"unitID":1737,"name":"Vårdcentralen Norrahamn","isActive":true}];
            var indicators = {
                all: [
                    {
                        thresHold: 50,
                        id: 101,
                        name: "HbA1c",
                        indicatorType: 2,
                        unit: "mmol/mol",
                        asc: true,
                        sortOrder: 10
                    },
                    {
                        thresHold: 50,
                        id: 102,
                        name: "BMI",
                        indicatorType: 2,
                        unit: "kg/längd²",
                        asc: true,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 103,
                        name: "LDL",
                        indicatorType: 2,
                        unit: "mmol/l",
                        asc: true,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 104,
                        name: "Kolesterol",
                        indicatorType: 2,
                        unit: "mmol/l",
                        asc: true,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 105,
                        name: "Blodtryck, systoliskt",
                        indicatorType: 2,
                        unit: "mm Hg",
                        asc: true,
                        sortOrder: 20
                    },
                    {
                        thresHold: 50,
                        id: 106,
                        name: "Blodtryck, diastoliskt",
                        indicatorType: 2,
                        unit: "mm Hg",
                        asc: true,
                        sortOrder: 21
                    },
                    {
                        thresHold: 50,
                        id: 201,
                        name: "HbA1c <52",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 10
                    },
                    {
                        thresHold: 50,
                        id: 202,
                        name: "Rökare",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: true,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 203,
                        name: "Fotundersökning senaste året",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 204,
                        name: "HbA1c >73",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: true,
                        sortOrder: 15
                    },
                    {
                        thresHold: 50,
                        id: 205,
                        name: "Blodtryck <130/80",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 20
                    },
                    {
                        thresHold: 50,
                        id: 206,
                        name: "Blodtryck <140/80",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 21
                    },
                    {
                        thresHold: 50,
                        id: 207,
                        name: "Blodtryck ≤130/80",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 20
                    },
                    {
                        thresHold: 50,
                        id: 208,
                        name: "Blodtryck ≤140/80",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 21
                    },
                    {
                        thresHold: 50,
                        id: 209,
                        name: "LDL <2,5",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 210,
                        name: "Kolesterol <4,5",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 211,
                        name: "Förekomst av albuminuri",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: true,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 212,
                        name: "Ögonbottenundersökning inom 2 år",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 213,
                        name: "Ögonbottenundersökning inom 3 år",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 214,
                        name: "Med lipidsänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 215,
                        name: "Med blodtryckssänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 216,
                        name: "Förekomst av diabetesretinopati",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 217,
                        name: "BMI <35",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 218,
                        name: "Systoliskt blodtryck <150",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 21
                    },
                    {
                        thresHold: 50,
                        id: 301,
                        name: "HbA1c",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 10
                    },
                    {
                        thresHold: 50,
                        id: 302,
                        name: "LDL",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 303,
                        name: "Blodtryck",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 20
                    },
                    {
                        thresHold: 50,
                        id: 304,
                        name: "Kolesterol",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 305,
                        name: "BMI",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 306,
                        name: "Diabetesbehandling",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 307,
                        name: "Fotundersökning senaste året",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 308,
                        name: "Rökare",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 309,
                        name: "Fysisk aktivitet",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 310,
                        name: "Blodtryckssänkande behandling",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 311,
                        name: "Lipidsänkande läkemedel",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 312,
                        name: "Datum för ögonbottenundersökning",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 313,
                        name: "Albuminuri",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 314,
                        name: "Diabetesretinopati",
                        indicatorType: 3,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 2001,
                        name: "HbA1c <52, kostbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 11
                    },
                    {
                        thresHold: 50,
                        id: 2002,
                        name: "HbA1c >73, kostbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: true,
                        sortOrder: 16
                    },
                    {
                        thresHold: 50,
                        id: 1001,
                        name: "HbA1c, kostbehandlade",
                        indicatorType: 2,
                        unit: "mmol/mol",
                        asc: false,
                        sortOrder: 11
                    },
                    {
                        thresHold: 50,
                        id: 2011,
                        name: "HbA1c <52, tablettbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 12
                    },
                    {
                        thresHold: 50,
                        id: 2012,
                        name: "HbA1c >73, tablettbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: true,
                        sortOrder: 17
                    },
                    {
                        thresHold: 50,
                        id: 1011,
                        name: "HbA1c, tablettbehandlade",
                        indicatorType: 2,
                        unit: "mmol/mol",
                        asc: true,
                        sortOrder: 12
                    },
                    {
                        thresHold: 50,
                        id: 2021,
                        name: "HbA1c <52, insulinbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 13
                    },
                    {
                        thresHold: 50,
                        id: 2022,
                        name: "HbA1c >73, insulinbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: true,
                        sortOrder: 18
                    },
                    {
                        thresHold: 50,
                        id: 1021,
                        name: "HbA1c, insulinbehandlade",
                        indicatorType: 2,
                        unit: "mmol/mol",
                        asc: true,
                        sortOrder: 13
                    },
                    {
                        thresHold: 50,
                        id: 2031,
                        name: "HbA1c <52, tablett- och insulinbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 14
                    },
                    {
                        thresHold: 50,
                        id: 2032,
                        name: "HbA1c >73, tablett- och insulinbehandlade",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: true,
                        sortOrder: 19
                    },
                    {
                        thresHold: 50,
                        id: 1031,
                        name: "HbA1c, tablett- och insulinbehandlade",
                        indicatorType: 2,
                        unit: "mmol/mol",
                        asc: true,
                        sortOrder: 13
                    },
                    {
                        thresHold: 50,
                        id: 2003,
                        name: "Blodtryck <130/80, blodtryckssänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 22
                    },
                    {
                        thresHold: 50,
                        id: 2004,
                        name: "Blodtryck ≤130/80, blodtryckssänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 22
                    },
                    {
                        thresHold: 50,
                        id: 2005,
                        name: "Blodtryck <140/80, blodtryckssänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 23
                    },
                    {
                        thresHold: 50,
                        id: 2006,
                        name: "Blodtryck ≤140/80, blodtryckssänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 23
                    },
                    {
                        thresHold: 50,
                        id: 2007,
                        name: "LDL <2,5, lipidsänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    },
                    {
                        thresHold: 50,
                        id: 2008,
                        name: "Kolesterol <4,5, lipidsänkande läkemedel",
                        indicatorType: 1,
                        unit: "Andel %",
                        asc: false,
                        sortOrder: 255
                    }
                ],
                byType: {
                    mean: [
                        {
                            thresHold: 50,
                            id: 101,
                            name: "HbA1c",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 10
                        },
                        {
                            thresHold: 50,
                            id: 102,
                            name: "BMI",
                            indicatorType: 2,
                            unit: "kg/längd²",
                            asc: true,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 103,
                            name: "LDL",
                            indicatorType: 2,
                            unit: "mmol/l",
                            asc: true,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 104,
                            name: "Kolesterol",
                            indicatorType: 2,
                            unit: "mmol/l",
                            asc: true,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 105,
                            name: "Blodtryck, systoliskt",
                            indicatorType: 2,
                            unit: "mm Hg",
                            asc: true,
                            sortOrder: 20
                        },
                        {
                            thresHold: 50,
                            id: 106,
                            name: "Blodtryck, diastoliskt",
                            indicatorType: 2,
                            unit: "mm Hg",
                            asc: true,
                            sortOrder: 21
                        },
                        {
                            thresHold: 50,
                            id: 1001,
                            name: "HbA1c, kostbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: false,
                            sortOrder: 11
                        },
                        {
                            thresHold: 50,
                            id: 1011,
                            name: "HbA1c, tablettbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 12
                        },
                        {
                            thresHold: 50,
                            id: 1021,
                            name: "HbA1c, insulinbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 13
                        },
                        {
                            thresHold: 50,
                            id: 1031,
                            name: "HbA1c, tablett- och insulinbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 13
                        }
                    ],
                    reported: [
                        {
                            thresHold: 50,
                            id: 301,
                            name: "HbA1c",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10
                        },
                        {
                            thresHold: 50,
                            id: 302,
                            name: "LDL",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 303,
                            name: "Blodtryck",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 20
                        },
                        {
                            thresHold: 50,
                            id: 304,
                            name: "Kolesterol",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 305,
                            name: "BMI",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 306,
                            name: "Diabetesbehandling",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 307,
                            name: "Fotundersökning senaste året",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 308,
                            name: "Rökare",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 309,
                            name: "Fysisk aktivitet",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 310,
                            name: "Blodtryckssänkande behandling",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 311,
                            name: "Lipidsänkande läkemedel",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 312,
                            name: "Datum för ögonbottenundersökning",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 313,
                            name: "Albuminuri",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 314,
                            name: "Diabetesretinopati",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        }
                    ],
                    target: [
                        {
                            thresHold: 50,
                            id: 201,
                            name: "HbA1c <52",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10
                        },
                        {
                            thresHold: 50,
                            id: 202,
                            name: "Rökare",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 203,
                            name: "Fotundersökning senaste året",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 204,
                            name: "HbA1c >73",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 15
                        },
                        {
                            thresHold: 50,
                            id: 205,
                            name: "Blodtryck <130/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 20
                        },
                        {
                            thresHold: 50,
                            id: 206,
                            name: "Blodtryck <140/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 21
                        },
                        {
                            thresHold: 50,
                            id: 207,
                            name: "Blodtryck ≤130/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 20
                        },
                        {
                            thresHold: 50,
                            id: 208,
                            name: "Blodtryck ≤140/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 21
                        },
                        {
                            thresHold: 50,
                            id: 209,
                            name: "LDL <2,5",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 210,
                            name: "Kolesterol <4,5",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 211,
                            name: "Förekomst av albuminuri",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 212,
                            name: "Ögonbottenundersökning inom 2 år",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 213,
                            name: "Ögonbottenundersökning inom 3 år",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 214,
                            name: "Med lipidsänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 215,
                            name: "Med blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 216,
                            name: "Förekomst av diabetesretinopati",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 217,
                            name: "BMI <35",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 218,
                            name: "Systoliskt blodtryck <150",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 21
                        },
                        {
                            thresHold: 50,
                            id: 2001,
                            name: "HbA1c <52, kostbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 11
                        },
                        {
                            thresHold: 50,
                            id: 2002,
                            name: "HbA1c >73, kostbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 16
                        },
                        {
                            thresHold: 50,
                            id: 2011,
                            name: "HbA1c <52, tablettbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 12
                        },
                        {
                            thresHold: 50,
                            id: 2012,
                            name: "HbA1c >73, tablettbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 17
                        },
                        {
                            thresHold: 50,
                            id: 2021,
                            name: "HbA1c <52, insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 13
                        },
                        {
                            thresHold: 50,
                            id: 2022,
                            name: "HbA1c >73, insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 18
                        },
                        {
                            thresHold: 50,
                            id: 2031,
                            name: "HbA1c <52, tablett- och insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 14
                        },
                        {
                            thresHold: 50,
                            id: 2032,
                            name: "HbA1c >73, tablett- och insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 19
                        },
                        {
                            thresHold: 50,
                            id: 2003,
                            name: "Blodtryck <130/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 22
                        },
                        {
                            thresHold: 50,
                            id: 2004,
                            name: "Blodtryck ≤130/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 22
                        },
                        {
                            thresHold: 50,
                            id: 2005,
                            name: "Blodtryck <140/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 23
                        },
                        {
                            thresHold: 50,
                            id: 2006,
                            name: "Blodtryck ≤140/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 23
                        },
                        {
                            thresHold: 50,
                            id: 2007,
                            name: "LDL <2,5, lipidsänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        },
                        {
                            thresHold: 50,
                            id: 2008,
                            name: "Kolesterol <4,5, lipidsänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255
                        }
                    ]
                }
            };
            var counties = [
                {
                    code: 1,
                    name: "Stockholm"
                },
                {
                    code: 3,
                    name: "Uppsala"
                },
                {
                    code: 4,
                    name: "Södermanland"
                },
                {
                    code: 5,
                    name: "Östergötland"
                },
                {
                    code: 6,
                    name: "Jönköping"
                },
                {
                    code: 7,
                    name: "Kronoberg"
                },
                {
                    code: 8,
                    name: "Kalmar"
                },
                {
                    code: 9,
                    name: "Gotland"
                },
                {
                    code: 10,
                    name: "Blekinge"
                },
                {
                    code: 12,
                    name: "Skåne"
                },
                {
                    code: 13,
                    name: "Halland"
                },
                {
                    code: 14,
                    name: "Västra Götaland"
                },
                {
                    code: 17,
                    name: "Värmland"
                },
                {
                    code: 18,
                    name: "Örebro"
                },
                {
                    code: 19,
                    name: "Västmanland"
                },
                {
                    code: 20,
                    name: "Dalarna"
                },
                {
                    code: 21,
                    name: "Gävleborg"
                },
                {
                    code: 22,
                    name: "Västernorrland"
                },
                {
                    code: 23,
                    name: "Jämtland"
                },
                {
                    code: 24,
                    name: "Västerbotten"
                },
                {
                    code: 25,
                    name: "Norrbotten"
                }
            ];

            units = _.where(units, {isActive : true});

            if (!useStaticUnits) {
                return $q.all([
                            endpoints.units.getList(),
                            endpoints.counties.getList(),
                            endpoints.indicator.get()
                        ]).then(function (data){
                            console.log("data",data);

                            self.data.units =  data[0];
                            self.data.counties = data[1];
                            self.data.indicators = data[2];

                            self.prepareGeoList();
                        });
            } else {
                return $q.all([
                            //endpoints.indicator.get()
                        ]).then(function (data){
                            self.data.units = units;
                            self.data.counties = counties;
                            //self.data.indicators = data[0];

                            self.prepareGeoList();
                        });
            }

        };


    }]);
