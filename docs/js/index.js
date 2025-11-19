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

async function fetchDirection() {
    const startDate = "2025-11-18";
    const endDate = "2025-11-18";
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

const db_key = getCookie("db_key");
const db_id = getCookie("db_id");
const db_name = getCookie("db_username");

// Initialize Supabase
const SUPABASE_URL = 'https://' + db_id + '.supabase.co';
const SUPABASE_ANON_KEY = db_key;
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function processAsyncCalls() {
    try{
        const rows = await fetchDirection();
        console.log(rows);

        const tbody = document.getElementById("table").querySelector("tbody");

        rows.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${row.name}</td>
                            <td>${row.created_at}</td>
                            <td>${row.created_at}</td>
                            <td>${row.created_at}</td>
                            <td>${row.created_at}</td>`;
            tbody.appendChild(tr);
            //TODO: refactor to save in and out of time log in one row -> retrieve row with in and add out time
                    // -> no individual rows for in and out -> less disk space waisted
        });
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
