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

async function fetchRecentRow(db_name) {
    const {data, error} = await supabaseClient
                .from('Time')
                .select('*')
                .eq('name', db_name)
                .order('created_at', { ascending: false } ) // sort newest first
                .limit(1) // only take the first row;

    if (error) {
        throw error; // send this to the catch.
    }
    return data;
}

async function insertTime(db_name, recent_row) {
    recent_row = recent_row[0]; // this does not change the original -> the parameter is just a copy (not reference)

    let check_out = recent_row.check_out;
    let uniqueID = recent_row.uniqueID;
// needed name,  (later also check_out)
    let data, error;

    if (!check_out) {
        const ts_now_date = new Date();
        ts_now = ts_now_date.toISOString();
        console.log(ts_now);

        ( 
            { data, error } = await supabaseClient
                                .from('Time')
                                .update({check_out: ts_now})
                                .eq('uniqueID', uniqueID)
                                .select()
        );

    } else {
        ( 
            { data, error } = await supabaseClient
                                .from('Time')
                                .insert([{ name: db_name }])
                                .select()
        );
    }

    if (error) {
        throw error; // send this to the catch.
    }
    return data;
}

function create_labelString(recent_row, insert_data) {
    recent_row = recent_row[0];
    insert_data = insert_data[0];

    // Generate time string:
    let time = recent_row.created_at;

    if (insert_data.check_out) {
        time = insert_data.check_out;
    }
    
    const creation_date = new Date(Date.parse(time));
    const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false // use 24-hour format
    };
    const fullDateTime = new Intl.DateTimeFormat('de-DE', options).format(creation_date);

    new Intl.DateTimeFormat('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false // use 24-hour format
    }).format(creation_date) 

    // randomly select a greeting/ farwell:
    let greeting = "";
    let name = recent_row.name;

    // select a random number (math.random returns a float value)
    const max = 14;
    const randomInt = Math.floor(Math.random() * max);

    if (!insert_data.check_out) {
        farewells = [
                        "Guten Morgen ",
                        "Schön, dich zu sehen ",
                        "Willkommen zurück ",
                        "Hii, schön dass du da bist ",
                        "Einen wunderbaren Tag wünsche ich dir ",
                        "Herzlich willkommen ",
                        "Schön, dich wiederzusehen ",
                        "Einen schönen Tag wünsche ich dir ",
                        "Hallo, ich hoffe es geht dir gut ",
                        "Schön, dass du hier bist ",
                        "Guten Tag ",
                        "Ich freue mich, dich zu sehen ",
                        "Hallo, schön dass du vorbeischaust ",
                        "Einen erfolgreichen Tag wünsche ich dir "
                    ];
        greeting = farewells[randomInt];
    } else {
        greetings = [
                        "Bis bald ",
                        "Mach’s gut ",
                        "Auf Wiedersehen ",
                        "Bis später ",
                        "Pass auf dich auf ",
                        "Bis dann ",
                        "Alles Gute ",
                        "Hab einen schönen Tag ",
                        "Schlaf gut ",
                        "Tschüüsss ",
                        "Wir sehen uns ",
                        "Bleib gesund ",
                        "Viel Erfolg ",
                        "Bis Morgen "
                    ];
        greeting = greetings[randomInt];
    }
    greeting += "mein Lieber " + name + "!";

    let labelString = ""; 
    labelString += greeting;
    labelString += "\nDatum: " + fullDateTime;
    labelString += "\nDu hast dich gerade " + (insert_data.check_out ? "Aus-Gecheckt" : "Ein-Gecheckt");
    return labelString;
}

const db_key = getCookie("db_key");
const db_id = getCookie("db_id");
const db_name = getCookie("db_username");

// Initialize Supabase
const SUPABASE_URL = 'https://' + db_id + '.supabase.co';
const SUPABASE_ANON_KEY = db_key;
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let direction = "";
const directions = ["In", "Out"];

async function processAsyncCalls() {
  try {
    // Get direction of last entry
    const recent_row = await fetchRecentRow(db_name);
    console.log('fetched row:', recent_row);

    // insert new data/ time log
    const insert_data = await insertTime(db_name, recent_row);
    console.log('insert_data response:', insert_data);

    const loading_label = document.getElementById("loading");
    const labelString = create_labelString(recent_row, insert_data);
    
    loading_label.style.whiteSpace = "pre-line"; // to make line breaks with \n visibile
    loading_label.textContent = labelString;

    
    // Fetch a random meme
    fetch('https://meme-api.com/gimme')
    .then(res => res.json())
    .then(data => {
        console.log(data.preview); // meme image URL
        // Example: set it to an <img> tag
        document.getElementById('memeImg').src = data.preview[data.preview.length - 1];
    })
    .catch(console.error);
    
  } catch (err) {
    console.error('Async-Chain had an error:', err)
  }
}

// Run on page load
(async () => {
  await processAsyncCalls()
})()