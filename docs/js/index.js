// check if cookie with db key and name is present.
    // if not -> load registration
    // else -> show table with all timestamps and deltas

// check if cookie is present show error if not -> give button to register again
    // else get last record for that name and see which direction it was
    // take key and name from cookie and !direction to make call to db
    // default value saves the now() time

// table needs to take 


// fix pause feature
// add date selector
// save gender in db
// show people as buttons to load the second table with only their entries
// add css stylings
// make it responsive for phone ui

// Do those without a chck-out time still get displayed? -> no they cause an exception

// Change the date input for a datetime-local input (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local)

function getCookie(cookie_name) {
    const cookies = document.cookie.split('; ');
    const varCookie = cookies.find(row => row.startsWith(cookie_name + '='));
    let value = "";

    if (varCookie) {
        value = decodeURIComponent(varCookie.split('=')[1]);
        console.log("cookie: " + varCookie);
    } else {
        value = undefined;
        console.log("Cookie nicht gefunden.");
        alert("Der Cookie konnte nicht gefunden werden:\n" + cookie_name)

        // Navigate to another page
        window.location.href = '../html/register_user.html'
    }   
    return value;
}


async function fetchRows(start, end, person) {

    const {data, error} = await supabaseClient
                .from('Time')
                .select('*')
                .order('created_at', { ascending: true} )
                .gte('created_at', start + 'T00:00:00Z')
                .lt('created_at', end + 'T23:59:59Z');

    if (error) {
        throw error; // send this to the catch.
    }
    return data;
}

async function fetchPeople() {
    const { data, error } = await supabaseClient.from('People').select('*');

    if (error) {
        throw error; // send this to the catch.
    }
    return data;
}


const db_key = getCookie("db_key");
const db_id = getCookie("db_id");
const db_name = getCookie("db_username");

// Initialize Supabase
const SUPABASE_URL = 'https://' + db_id + '.supabase.co';
const SUPABASE_ANON_KEY = db_key;
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// temporary
const today_year = new Date().toISOString().split("T")[0];
tmp = "2025-11-20";

// Initialize the start/end date selectors (input tag in the html)
const start_date_in = document.getElementById("startDate");
const end_date_in = document.getElementById("endDate");
start_date_in.value = tmp; // todo temporaray
end_date_in.value = tmp;  // todo temporaray
start_date_in.max = today_year;
end_date_in.max = today_year;


async function processAsyncCalls() {
    try{
        document.getElementById("table").querySelector("tbody").innerHTML = "";

        // Get all rows for the selected time frame from db
        const rows = await fetchRows(start_date_in.value, end_date_in.value);
        console.log(rows);

        // Get a list of people that could have checked-in / -out
        const people = await fetchPeople()
        console.log(people);

        // Create an object that has the people names as keys and init value of 0 as value
        // i.e. { John: 0, Jim: 0, ...}
        const time_remainder_by_person = people.reduce( (accumulator, item) => {
            accumulator[item.name] = 0;
            return accumulator;
        }, {} );
        console.log(time_remainder_by_person);
        
        // Has the check_out value of the first row, that is owned by that person -> due to 
        // how rows are fetched that will be the oldest entry:
        //     Shape of breaks object: { People.name: {check_out: timestamp} }
        //     { John: {check_out: "2025-01-01T15:24:01.023Z"}, Jim: {check_out: "..."}, ...}
        let breaks = {};
        for (let name of Object.keys(time_remainder_by_person)) {
            let check_out;
            for (let row of rows) {
                if (row.name === name) {
                    if (check_out) {
                        check_out = row.check_out;
                        break;
                    }
                }
            }
            breaks[name] = {"check_out": check_out};
        }
        console.log(breaks)

        // options for time creation:
        const day_option = { weekday: "short" };
        const date_option = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        };
        const time_option = {
            hour: "2-digit",
            minute: "2-digit",
        };


        for (let row of rows) {

            // Load start and end timestamp (set the end to "-" if the check-out 
            //                               timestamp is still missing)
            // todo Use current time to calculate the differnce, but leave the check-out time as "-" if not present.
            let start_timestamp = new Date(row.created_at);
            let end_timestamp = "-";
            if (row.check_out){
                end_timestamp = new Date(Date.parse(row.check_out));
            }

            //#region Create string for check-in and check-out date column entries (date, day, time)
            const start_day = Intl.DateTimeFormat("de-DE", day_option).format(start_timestamp);
            const start_date = Intl.DateTimeFormat("de-DE", date_option).format(start_timestamp);
            const start_time = Intl.DateTimeFormat("de-DE", time_option).format(start_timestamp);
            // todo if end_timestamp is "-" this code won't work -> catch this case with if clause
            const end_day = Intl.DateTimeFormat("de-DE", day_option).format(end_timestamp);
            const end_date = Intl.DateTimeFormat("de-DE", date_option).format(end_timestamp);
            const end_time = Intl.DateTimeFormat("de-DE", time_option).format(end_timestamp);
            //#endregion

            // const end_day = "---"
            // const end_date = "---"
            // const end_time = "---"

            //#region Calculate time difference between check-in and check-out 
            // convert difference from ms to min and hours
            difference_ms = end_timestamp - start_timestamp;
            difference_min = difference_ms / (1000 * 60);
            difference_h = difference_ms / (1000 * 60 * 60);

            // round to 2 decimal points
            difference_min = Number(difference_min.toFixed(2));
            difference_h = Number(difference_h.toFixed(2));
            //#endregion

            // calculate breaks
            time_remainder_by_person[row.name] += difference_h;

            const punctual = ( time_remainder_by_person[row.name] - 7 ).toFixed(2);

            //#region Insert data in table view
            const tbody = document.getElementById("table").querySelector("tbody");
            const tr = document.createElement("tr");

            tr.innerHTML = `<td>${row.name}</td>
                            <td>${start_date}</td>
                            <td>${start_day}</td>
                            <td>${start_time}</td>
                            <td>${end_date}</td>
                            <td>${end_day}</td>
                            <td>${end_time}</td>
                            <td>${difference_h}</td>
                            <td>${punctual}</td>`;
            tbody.appendChild(tr);
            //#endregion

            
            // // calculate breaks:
            // let break_date_string = breaks[name]["check_out"];
            // if (break_date_string !== "-") {
                
            // }

            const name = row.name;
            let break_date_string = breaks[name]["check_out"];
            break_date = new Date(break_date_string); // if row.check_out is not present, then this will fail
            if (start_timestamp !== break_date && row.check_out && break_date_string !== "-") {
                let pause_ms = start_timestamp - break_date;
                console.log(start_date);
                console.log(break_date);
                breaks[name]["check_out"] = row.check_out;
                console.log(pause_ms);
                console.log(row);
                console.log(breaks[name]);
                breaks[name]["pause"] = pause_ms;
            }
        }
        // }

        // console.log(breaks);
        // const pause_label = document.getElementById("pause");
        // let pause_text = "Pausen: ";
        // for (person of Object.keys(breaks)) {
        //     if (Number.isNaN(breaks[person]["pause"])) {
        //         pause_text += person + ": - ,";
        //     } else {
        //         break_h = Math.floor(breaks[person]["pause"] / (1000 * 60 * 60));
        //         break_min = Math.floor(breaks[person]["pause"] / (1000 * 60));
        //         pause_text += person + ": " + break_h + ":" + break_min + ", ";
        //     }
        // }
        // pause_label.textContent = pause_text;

    } catch (err) {
        console.error('Async-Chain had an error:', err)
    }
}

// Run on page load
(async () => {
  await processAsyncCalls()
})()

const data = [
  {name: "Alice", age: 25},
  {name: "Bob", age: 30}
];
