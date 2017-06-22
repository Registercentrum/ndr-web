angular.module('ndrApp')
  .factory('cookieFactory', function () {
    function create(name, value, minutes) {
      var expires = "";
	  
		//sets default cookie expiration
		function minutesUntilMidnight(){
			var mid= new Date(), 
			ts= mid.getTime();
			mid.setHours(24, 0, 0, 0);
			return Math.floor((mid - ts)/60000);
		};
	  
		var dur = minutes || minutesUntilMidnight();
	  
		var date = new Date();
		date.setTime(date.getTime() + (dur * 60 * 1000));
		expires = "; expires=" + date.toUTCString();

		document.cookie = name + "=" + value + expires + "; path=/";
    }

    function read(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for(var i=0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    function erase(name) {
      create(name, "", -1);
    }

    return {
      create: create,
      read: read,
      erase: erase
    };
});