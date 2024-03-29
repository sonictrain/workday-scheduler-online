// HTML element variables
const currentDayEl = document.getElementById("currentDay");

// Global Day object
let currentDay = {
    day: dayjs().format("dddd"),
    dayNum: Number(dayjs().format("D")),
    month: dayjs().format("MMMM"),
    monthNum: Number(dayjs().format("M")),
    year: Number(dayjs().format("YYYY")),
    hours: Number(dayjs().format("H")),
    minutes: Number(dayjs().format("m")),
    seconds: Number(dayjs().format("s")),
}

let workDay = {
    start: 9,
    end: 18,
}

let checks = {
    day: 0,
    hours: 0,
}

// let eventsObj = []

init();

function init() {

    readLocalStorage('Events');
    createTimeSlots();
}

// Timed function to update date & time every second
setInterval(() => {

    // Update currentDay object
    currentDay = {
        day: dayjs().format("dddd"),
        dayNum: Number(dayjs().format("D")),
        month: dayjs().format("MMMM"),
        monthNum: dayjs().format("M"),
        year: Number(dayjs().format("YYYY")),
        hours: Number(dayjs().format("H")),
        minutes: Number(dayjs().format("m")),
        seconds: Number(dayjs().format("s")),
    }

    // only update the DOM if the day is changed
    if (checks.day !== currentDay.dayNum) {

        // Update sup tag
        ordinalTag();

        // Render date and sup tag  
        $(currentDayEl).text(`${currentDay.day}, ${currentDay.month} ${currentDay.dayNum}`).append($('<sup>').text(sup));

    };

    // refresh DOM (rows) every hour
    if (checks.hours !== currentDay.hours) {

        // Update rows
        createTimeSlots();

    }

    checks = {
        day: currentDay.dayNum,
        hours: currentDay.hours,
    }

}, 1000);

// Create ordinal sup tag
function ordinalTag() {

    switch (Number(currentDay.dayNum)) {
        case (1):
        case (21):
        case (31):
            sup = "st";
            break;
        case (2):
        case (22):
            sup = "nd";
            break;
        case (3):
        case (23):
            sup = "rd";
            break;
        default:
            sup = "th";
            break;
    }

}

// Create and Render Time Slots for the current work day
function createTimeSlots() {

    const agendaContainer = document.querySelector(".container");
    // clear the container everytime the function runs
    $(agendaContainer).empty();

    for (let i = workDay.start; i <= workDay.end; i++) {

        let row = $('<div>').addClass('row');

        // convert i value to AM/PM time and add label to the timeblock div-- eg: convert 9 to 9AM
        let date = new Date(currentDay.year, currentDay.monthNum, currentDay.dayNum, i)
        let timeBlockLabel = dayjs(date).format('h A');
        let timeBlock = $('<div>').addClass('time-block').text(timeBlockLabel);

        // create description div and style accordingly
        let description = $('<input>').addClass('description');

        if (currentDay.hours < i) {
            description.addClass('future');
        } else if (currentDay.hours == i) {
            description.addClass('present');
        } else {
            description.addClass('past');
        }

        let eventAtTime = eventsObj.find((x) => x.time === timeBlockLabel);

        if (eventAtTime) {
            description.val(eventAtTime.event);
        };

        // create saveBtn
        let saveBtn = $('<div>').addClass('saveBtn');
        let saveIcon = $('<i>').addClass('fas fa-save');
        saveBtn.append(saveIcon);

        // create trashBtn
        let trashBtn = $('<div>').addClass('trashBtn');
        let trashIcon = $('<i>').addClass('fas fa-trash');
        trashBtn.append(trashIcon);

        saveIcon.on('click', (e) => {
            eventAtTime = eventsObj.find((x) => x.time === timeBlockLabel);

            // do nothing if input field is blank
            if (description.val()) {
                if (eventAtTime?.event) {
                    // if an event is already saved in eventsObj then update it
                    if (eventAtTime.event !== description.val()) {
                        eventsObj.find((x) => x.time === timeBlockLabel).event = description.val();

                    }
        
                } else {
                    // otherwise push it
                    eventsObj.push(
                        {
                            time: $(e.target).parent().siblings('.time-block').text(),
                            event: $(e.target).parent().siblings('.description').val()
                        }
                    )
                }

                // update Local Storage obj and eventAtTime for future comparison
                eventAtTime = eventsObj.find((x) => x.time === timeBlockLabel);
                saveEvent('Events', eventsObj);

            }
        });

        trashIcon.on('click', () => {
            eventAtTime = eventsObj.find((x) => x.time === timeBlockLabel);

            if (eventAtTime) {
                
                eventsObj = eventsObj.filter( (o) => {
                    return o.time !== timeBlockLabel;
                  });

                description.val('');

                saveEvent('Events', eventsObj);

            }
        })

        // append all the elements inside row, and append row inside container
        $(agendaContainer)
            .append(row);

        $(row)
            .append(timeBlock)
            .append(description)
            .append(saveBtn)
            .append(trashBtn);
    }
}

function saveEvent(name, obj) {
    localStorage.setItem(name, JSON.stringify(obj));
}

function readLocalStorage(name) {
    eventsObj = JSON.parse(localStorage.getItem(name)) || [];
}
