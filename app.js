/*var timings = {
    "1": '00-12',
    "2": '12-17',
    "3": '17-00'
};
*/
/*PENDING - to delay the second dropdown - because it fetches values from the API */
var filteredEvents = [];

$(document).ready(function() {
    var request = {
        token: '7XWLDUXSLHRSZEEDXL7Q'
    };

    var result = $.ajax({
            url: "https://www.eventbriteapi.com/v3/categories/",
            data: request,
            dataType: "json",
            type: "GET",
        })
        .done(function(result) {
            //Populate categories
            console.log(result);
            var categoryDropdown = $('select[name=category]');
            //Add an 'All' option in the beginning
            var option = $('<option/>');
            option.attr({
                'value': 'Any'
            }).text('Any');
            categoryDropdown.append(option);

            $.each(result.categories, function(index, value) {
                //var question = showQuestion(item);
                //$('.results').append(question);
                var option = $('<option/>');
                option.attr({
                    'value': value.id
                }).text(value.name);
                categoryDropdown.append(option);

            });
        })
        .fail(function(jqXHR, error, errorThrown) {
            //Populate errors
            var errorElem = showError(error);
            $('.search-results').append(errorElem);
        });

    //establish a submit handler for the form
    $('form').submit(function(event) {
        event.preventDefault();
        //Clear the results panel
        $('.results').empty();

        //Clear the filtered events object
        filteredEvents = [];

        //console.log('Submit handler called!');
        //Construct the request object
        var eventRequest = {
            'token': '7XWLDUXSLHRSZEEDXL7Q',
            'venue.city': 'New Delhi',
            'venue.country': 'IN',
            'start_date.keyword': 'today',
            categories: $('select[name=category]').val() != 'Any' ? $('select[name=category]').val() : ''
        };
        //fetch events
        var result = $.ajax({
                url: "https://www.eventbriteapi.com/v3/events/search/",
                data: eventRequest,
                dataType: "json",
                type: "GET",
            })
            .done(function(result) {
                console.log('fetched events: ' + result.events.length);

                //Filter events that do not fit the time range
                $.each(result.events, function(index, value) {
                    //var question = showQuestion(item);
                    //$('.results').append(question);
                    if (value.status === 'started') {
                        //Check if the end time falls within the various ranges
                        var eventEndTime = new Date(value.end.utc);

                        var preferredStartHour = $('select[name=freeTime]').val().split('-')[0];
                        var preferredEndHour = $('select[name=freeTime]').val().split('-')[1];
                        var preferredStartTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), preferredStartHour, '00', '00', '00');

                        if (preferredEndHour == '00') {
                            var preferredEndTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), '23', '59', '00', '00');
                        } else {
                            var preferredEndTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), preferredEndHour, '00', '00', '00');
                        }

                        if (eventEndTime >= preferredStartTime && eventEndTime <= preferredEndTime) {
                            filteredEvents.push(value)
                        }
                    } else if (value.status === 'live') {
                        //Check if the start time falls within the various ranges
                        var eventStartTime = new Date(value.start.utc);

                        var preferredStartHour = $('select[name=freeTime]').val().split('-')[0];
                        var preferredEndHour = $('select[name=freeTime]').val().split('-')[1];
                        var preferredStartTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), preferredStartHour, '00', '00', '00');
                        if (preferredEndHour == '00') {
                            var preferredEndTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), '23', '59', '00', '00');
                        } else {
                            var preferredEndTime = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), preferredEndHour, '00', '00', '00');
                        }

                        if (eventStartTime >= preferredStartTime && eventStartTime <= preferredEndTime) {
                            filteredEvents.push(value)
                        }
                    }
                });

                console.log('filtered events: ' + filteredEvents.length);

                if (filteredEvents.length > 0) {
                    //Display the final list
                    $.each(filteredEvents, function(index, value) {
                        var event = showEvent(value);
                        $('.results').append(event);
                    });
                  
                } else {
                    //Display message - Select different filters
                    // clone our empty response template code
                    var noResult = $('.templates .empty').clone();
                    $('.results').append(noResult);


                }

            })
            .fail(function(jqXHR, error, errorThrown) {
                //Populate errors
                var errorElem = showError(error);
                $('.search-results').append(errorElem);
            });


    });
});
var showEvent = function(event) {

    // clone our result template code
    var result = $('.templates .event').clone();

    // Set the event properties in result
    var eventName = result.find('.event-name a');
    eventName.attr('href', event.url);
    eventName.text(event.name.html);

    /*var description = result.find('.event-description');
    description.text(event.description.html);*/

    var eventLogo = result.find('.event-logo img');
    eventLogo.attr('src', event.logo_url);

    var eventTime = result.find('.event-timing');
    //format time
    eventTime.text(event.start.utc + '-' + event.end.utc);

    var eventOrganizer = result.find('.event-organizer');
    eventOrganizer.text(event.organizer.name);

    var eventVenue = result.find('.event-venue');
    eventVenue.text(event.venue.name + ': ' + event.venue.address.address_1 + ', ' + event.venue.address.address_2);

    var eventMarker = result.find('.event-marker a');
    eventMarker.attr('href', "http://maps.google.com/maps?q=" + event.venue.latitude + ',' + event.venue.longitude);
    eventMarker.text('Go');

    var eventPrice = result.find('.event-price');
    var priceClassUL = $('<ul/>');

    $.each(event.ticket_classes, function(index, value) {
        var priceClassLI = $('<li/>');
        if (value.free) {
            priceClassLI.text(value.name + ' - ' + '$0');
        } else {
            priceClassLI.text(value.name + ' - ' + value.cost.display);

        }
        priceClassUL.append(priceClassLI);
    });
    eventPrice.append(priceClassUL);

    return result;
};
// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
/*var showQuestion = function(question) {
    
    // clone our result template code
    var result = $('.templates .question').clone();
    
    // Set the question properties in result
    var questionElem = result.find('.question-text a');
    questionElem.attr('href', question.link);
    questionElem.text(question.title);

    // set the date asked property in result
    var asked = result.find('.asked-date');
    var date = new Date(1000*question.creation_date);
    asked.text(date.toString());

    // set the #views for question property in result
    var viewed = result.find('.viewed');
    viewed.text(question.view_count);

    // set some properties related to asker
    var asker = result.find('.asker');
    asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
                                                    question.owner.display_name +
                                                '</a>' +
                            '</p>' +
                            '<p>Reputation: ' + question.owner.reputation + '</p>'
    );

    return result;
};

// this function takes the user object returned by StackOverflow 
// and creates new result to be appended to DOM
var showAnswerer = function(user) {
    
    // clone our result template code
    var result = $('.templates .topanswerers').clone();
    
    // Set the user properties in result
    var questionElem = result.find('.display-name a');
    questionElem.attr('href', user.user.link);
    questionElem.text(user.user.display_name);

    // set the date asked property in result
    var score = result.find('.score');
    //var date = new Date(1000*question.creation_date);
    score.text(user.score);

    // set the #views for question property in result
    var reputation = result.find('.reputation');
    reputation.text(user.user.reputation);

    // set some properties related to asker
    var profileImage = result.find('.image img');
    profileImage.attr('src',user.user.profile_image);

    return result;
};

// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
    var results = resultNum + ' results for <strong>' + query;
    return results;
};
*/
// takes error string and turns it into displayable DOM element
function showError(error) {
        var errorElem = $('.templates .error').clone();
        var errorText = '<p>' + error + '</p>';
        //CORRECTION? ErrorElem being printed twice
        //errorElem.append(errorText);
        return errorElem;
    }
    /*
    // takes a string of semi-colon separated tags to be searched
    // for on StackOverflow
    var getUnanswered = function(tags) {
        
        // the parameters we need to pass in our request to StackOverflow's API
        var request = {tagged: tags,
                                    site: 'stackoverflow',
                                    order: 'desc',
                                    sort: 'creation'};
        
        var result = $.ajax({
            url: "http://api.stackexchange.com/2.2/questions/unanswered",
            data: request,
            dataType: "jsonp",
            type: "GET",
            })
        .done(function(result){
            var searchResults = showSearchResults(request.tagged, result.items.length);

            $('.search-results').html(searchResults);

            $.each(result.items, function(i, item) {
                var question = showQuestion(item);
                $('.results').append(question);
            });
        })
        .fail(function(jqXHR, error, errorThrown){
            var errorElem = showError(error);
            $('.search-results').append(errorElem);
        });
    };

    // takes a string of semi-colon separated tags to be searched
    // for on StackOverflow
    var getTop30Answerers = function(tags) {
        
        // the parameters we need to pass in our request to StackOverflow's API
        var request = {//tagged: tags,
                                    site: 'stackoverflow'};
                                    //order: 'desc',
                                    //sort: 'creation'};
        
        var result = $.ajax({
            url: "http://api.stackexchange.com/2.2/tags/"+tags+"/top-answerers/month",
            data: request,
            dataType: "jsonp",
            type: "GET",
            })
        .done(function(result){
            var searchResults = showSearchResults(tags, result.items.length);

            $('.search-results').html(searchResults);

            $.each(result.items, function(i, item) {
                var user = showAnswerer(item);
                $('.results').append(user);
            });
        })
        .fail(function(jqXHR, error, errorThrown){
            var errorElem = showError(error);
            $('.search-results').append(errorElem);
        });
    };
    */
