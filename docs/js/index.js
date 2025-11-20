// check if cookie with db key and name is present.
    // if not -> load registration
    // else -> show table with all timestamps and deltas

// check if cookie is present show error if not -> give button to register again
    // else get last record for that name and see which direction it was
    // take key and name from cookie and !direction to make call to db
    // default value saves the now() time

// table needs to take 

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

async function fetchRows() {
    //temp
    const today = new Date().toISOString().split("T")[0];

    const startDate = today; //"2025-11-18";
    const endDate = today; //"2025-11-18";

    const {data, error} = await supabaseClient
                .from('Time')
                .select('*')
                .order('created_at', { ascending: false} )
                .gte('created_at', startDate + 'T00:00:00Z')
                .lt('created_at', endDate + 'T23:59:59Z');

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

async function processAsyncCalls() {
    try{
        const rows = await fetchRows();
        console.log(rows);

        const people = await fetchPeople()
        console.log(people);

        const name_time_table = people.reduce( (accumulator, item) => {
            accumulator[item.name] = 0;
            return accumulator;
        }, {} );
        
        console.log(name_time_table);

        for (let row of rows) {
            // console.log(row);

            start_date = new Date(row.created_at);
            end_date = new Date(row.check_out);

            // creat more asthetic date for table
            options = {
                weekday: "short",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            };
            start_date_string = start_date.toLocaleDateString("de-DE", options);
            end_date_string = end_date.toLocaleDateString("de-DE", options);

            // console.log(start_date_string);
            // console.log(end_date_string);
            // console.log(start_date);
            // console.log(end_date);

            // convert difference from ms to min and hours
            difference_ms = end_date - start_date;
            difference_min = difference_ms / (1000 * 60);
            difference_h = difference_ms / (1000 * 60 * 60);
            // console.log(difference_ms);

            // round to 2 decimal points
            difference_min = Number(difference_min.toFixed(2));
            difference_h = Number(difference_h.toFixed(2));
            // console.log(difference_min);
            // console.log(difference_h);

            name_time_table[row.name] = difference_h;

            const punctual = difference_h - 7;

            const tbody = document.getElementById("table").querySelector("tbody");
            const tr = document.createElement("tr");

            tr.innerHTML = `<td>${row.name}</td>
                            <td>${start_date_string}</td>
                            <td>${end_date_string}</td>
                            <td>${difference_h}</td>
                            <td>${punctual}</td>`;
            tbody.appendChild(tr);
        }


        // rows.forEach(row => {
        //     const tr = document.createElement("tr");
        //     tr.innerHTML = `<td>${row.name}</td>
        //                     <td>${row.created_at}</td>
        //                     <td>${row.created_at}</td>
        //                     <td>${row.created_at}</td>
        //                     <td>${row.created_at}</td>`;
        //     tbody.appendChild(tr);
        //     //TODO: refactor to save in and out of time log in one row -> retrieve row with in and add out time
        //             // -> no individual rows for in and out -> less disk space waisted
        // });
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
