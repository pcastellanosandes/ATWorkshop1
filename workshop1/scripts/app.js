(function () {
    'use strict';

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedTimetables: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container')
    };

    //Use IndexedDB to save data 
    localforage.config({
        driver: localforage.IndexedDB,
        name: 'Taller1-localStorage'
    });

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById('butRefresh').addEventListener('click', function () {
        // Refresh all of the metro stations
        app.updateSchedules();
    });

    document.getElementById('butAdd').addEventListener('click', function () {
        // Open/show the add new station dialog
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', function () {


        var select = document.getElementById('selectTimetableToAdd');
        var selected = select.options[select.selectedIndex];
        var key = selected.value;
        var label = selected.textContent;
        if (!app.selectedTimetables) {
            app.selectedTimetables = [];
        }
        app.getSchedule(key, label);
        app.selectedTimetables.push({ key: key, label: label });
        app.saveSelectedTimeTables();
        app.toggleAddDialog(false);
    });

    document.getElementById('butAddCancel').addEventListener('click', function () {
        // Close the add new station dialog
        app.toggleAddDialog(false);
    });


    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    // Toggles the visibility of the add new station dialog.
    app.toggleAddDialog = function (visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    // Updates a timestation card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.

    app.updateTimetableCard = function (data) {
        var key = data.key;
        var dataLastUpdated = new Date(data.created);
        var schedules = data.schedules;
        var card = app.visibleCards[key];

        if (!card) {
            var label = data.label.split(', ');
            var title = label[0];
            var subtitle = label[1];
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.label').textContent = title;
            card.querySelector('.subtitle').textContent = subtitle;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[key] = card;
        }
        card.querySelector('.card-last-updated').textContent = data.created;

        var scheduleUIs = card.querySelectorAll('.schedule');
        for(var i = 0; i<4; i++) {
            var schedule = schedules[i];
            var scheduleUI = scheduleUIs[i];
            if(schedule && scheduleUI) {
                scheduleUI.querySelector('.message').textContent = schedule.message;
            }
        }

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/
    app.getSchedule = function (key, label) {
        var url = 'https://api-ratp.pierre-grimaud.fr/v3/schedules/' + key;

        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    var result = {};
                    result.key = key;
                    result.label = label;
                    result.created = response._metadata.date;
                    result.schedules = response.result.schedules;
                    app.updateTimetableCard(result);
                }
            } else {
                // Return the initial weather forecast since no data is available.
                app.updateTimetableCard(initialStationTimetable);
            }
        };
        request.open('GET', url);
        request.send();
    };

    // Iterate all of the cards and attempt to get the latest timetable data
    app.updateSchedules = function () {
        var keys = Object.keys(app.visibleCards);
        keys.forEach(function (key) {
            app.getSchedule(key);
        });
    };

    /*
     * Fake timetable data that is presented when the user first uses the app,
     * or when the user has not saved any stations. See startup code for more
     * discussion.
     */
    var initialStationTimetable = {

        key: 'metros/1/bastille/A',
        label: 'Bastille, Direction La Défense',
        created: '2017-07-18T17:08:42+02:00',
        schedules: [
            {
                message: '0 mn'
            },
            {
                message: '2 mn'
            },
            {
                message: '5 mn'
            }
        ]
    };

    // Save list time tables
    app.saveSelectedTimeTables = function () {
        app.selectedTimetables.forEach(function (timeTable) {
            localforage.setItem(timeTable.key, timeTable.label).then(function (value) {
                console.log(timeTable.key +" saved successfully");
            }).catch(function(err) {
                console.log(timeTable.key +" can't be saved");
            });
            console.log("test");
        });
    };

    localforage.length().then(function(numberOfKeys) {
        if(numberOfKeys>0){
            localforage.iterate(function(value, key, iterationNumber) {
                app.getSchedule(key, value);
            });
        }else{
            app.getSchedule(initialStationTimetable.key, initialStationTimetable.label);
            app.selectedTimetables = [{ key: initialStationTimetable.key, label: initialStationTimetable.label }];
            app.saveSelectedTimeTables();
        }

    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });



    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
                 .register('./service-worker.js')
                 .then(function() { console.log('Service Worker Registered'); });
      }
  
   
})();