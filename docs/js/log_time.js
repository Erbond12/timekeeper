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

async function fetchDirection(db_name) {
    const {data, error} = await supabaseClient
                .from('Time')
                .select('*')
                .eq('name', db_name)
                .order('created_at', { ascending: false }) // sort newest first
                .limit(1) // only take the first row;

    if (error) {
        throw error; // send this to the catch.
    }
    return data;
}

async function insertTime(db_name, db_direction, timestamp) {
    console.log(db_direction)

    payload = {
        created_at: timestamp, 
        direction: db_direction, 
        name: db_name
    }

    const { data, error } = await supabaseClient.from('Time').insert([payload]);
    
    if (error) {
        throw error; // send this to the catch.
    }
    return data;
}

function create_labelString(confirm_data) {
    const creation_date = new Date(confirm_data[0].created_at);
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
    const fullDateTime = new Intl.DateTimeFormat('de-DE', options).format(creation_date) 

    let labelString = ""; 
    labelString += "Guten Morgen mein Lieber " + confirm_data[0].name;
    labelString += "\nDatum: " + fullDateTime;
    labelString += "\nDu hast dich gerade " + (confirm_data[0].direction === "In" ? "Ein-Gecheckt" : "Aus-Gecheckt");
    labelString += "\nBis später!" 
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
    const direction_data = await fetchDirection(db_name);
    console.log('direction_data row:', direction_data);
    //TODO: check if it really the last element loaded

    // set direction for insert (reverse the enum from in to out/ vice versa)
    direction = direction_data[0]?.direction === "In" ? "Out" : "In";

    // create timestamp (ts) for insert
    const ts_now_date = new Date();
    console.log(ts_now_date.toISOString());
    ts_now = ts_now_date.toISOString();
    
    // insert new data/ time log
    const insert_data = await insertTime(db_name, direction, ts_now)
    console.log('insert_data data:', insert_data)

    // check if data was inserted correctly
    const confirm_data = await fetchDirection(db_name)
    console.log('direction_data row:', confirm_data)

    // check if the last element in DB is just inserted one ( or the direction and time is the same)
    saved_direction = confirm_data[0].direction;
    saved_timestamp = new Date(confirm_data[0].created_at).toISOString();
    
    if(direction === saved_direction && ts_now === saved_timestamp) {
        console.log("insert complete")
        
        const loading_label = document.getElementById("loading");
        
        const labelString = create_labelString(confirm_data);
        
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
    } else {
        console.log(".  Insert failed")
    }
    
  } catch (err) {
    console.error('Async-Chain had an error:', err)
  }
}

// Run on page load
(async () => {
  await processAsyncCalls()
})()