const div_projectData = document.getElementById("get_project_data");
const div_getName = document.getElementById("get_name");
let request_data;
let supabaseClient;

async function saveDBCookies() {
    // Get input values
    const project_key = document.getElementById("db_key").value;
    const project_id = document.getElementById("db_id").value;

    // Check if values are empty
    if (!project_key) {
        return alert("Bitte gib einen DB Schlüssel ein!");
    }
    if (!project_id) {
        return alert("Bitte gib eine DB ID ein!");
    }

    // Set expiration format: yyyy-mm-ddThh:mm:ssZ
    const expireDate = new Date("2028-12-12T00:00:00Z").toUTCString(); //TODO: make date relative
   
    // Set cookies
    document.cookie = `db_key=${encodeURIComponent(project_key)}; expires=${expireDate}; path=/`;
    document.cookie = `db_id=${encodeURIComponent(project_id)}; expires=${expireDate}; path=/`;

    // Get label to write available names in
    const namesLabel = document.getElementById("names");

    // Get all names
    data = await fetchPeople(project_id, project_key);
    request_data = data.data;
    const request_error = data.error;
    if (request_error) {
        console.log(request_error);
        return alert("Die Daten waren leider nicht korrekt:\n" + JSON.stringify(request_error));
    }

    // filter out the names from request
    names = [];
    for (let i = 0; i < request_data.length; ++i) {
        names[i] = ' ' + request_data[i].name ;
    }
    
    // Set content of label to names list
    namesLabel.textContent = names;

    div_projectData.style.display = "none";
    div_getName.style.display = "block";
}

async function saveNameCookie() {
    // Get input values
    const name_input = document.getElementById("name").value;
    const in_list = document.querySelector('input[name="name_in_list"]:checked')?.value;

    // Check if values are empty
    if (!name_input) {
        return alert("Bitte gib einen Namen ein!");
    }
    if (!in_list) {
        return alert("Ist der Namen aus der Liste gewesen?");
    }

    if (in_list === "new_item") {
        const {data, error} = await supabaseClient.from('People').insert([{name: name_input}]);
        
        if (error) { // TODO: if element is in db but new item selected show warning of duplicate
            console.log(error);
            return alert("Etwas ist schief gelaufen (siehe console.log() für mehr Details).");
        }
    } else if (in_list === "in_list") {
        const {data, error} = await supabaseClient
                                        .from('People')
                                        .select('*')
                                        .eq('name', name_input);
        if (error) {
            console.log(data);
            return alert("Etwas ist schief gelaufen (siehe console.log() für mehr Details).");
        }
        if (data.length === 0) {
            return alert("Name konnte nicht gefunden werden.");
        }
    }

    // Set expiration format: yyyy-mm-ddThh:mm:ssZ
    const expireDate = new Date("2028-12-12T00:00:00Z").toUTCString(); //TODO: make date relative
   
    // Set cookies
    document.cookie = `db_username=${encodeURIComponent(name_input)}; expires=${expireDate}; path=/`;

    document.body.insertAdjacentHTML("beforeend", "<h3>Name (" + name_input + ") erfolgreich gespeichert!<h3>")
    document.body.insertAdjacentHTML("beforeend", "<img src='../assets/yippie.jpeg'>")
}

async function fetchPeople(project_id, db_key) {
    // Initialize Supabase
    const SUPABASE_URL = 'https://' + project_id + '.supabase.co';
    const SUPABASE_ANON_KEY = db_key;

    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabaseClient.from('People').select('*');
    return { data, error };
}