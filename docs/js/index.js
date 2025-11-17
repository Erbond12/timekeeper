let db_key = "";
let project_id = "";

function saveCookie() {
    const key = document.getElementById("DBKey").value;
    const id = document.getElementById("DBId").value;

    if (!key) {
        return alert("Please enter a for the DB key!");
    }
    if (!id) {
        return alert("Please enter a for the DB id!");
    }

    // Set expiration 
    // date: yyyy-mm-ddThh:mm:ssZ
    const expireDate = new Date("2026-10-10T00:00:00Z").toUTCString();
    document.cookie = `DBKey=${encodeURIComponent(key)}; expires=${expireDate}; path=/`;
    document.cookie = `DBId=${encodeURIComponent(id)}; expires=${expireDate}; path=/`;

    alert("Saved!")
}


function getCookie() {
    const cookies = document.cookie.split('; ');
    const dbKeyCookie = cookies.find(row => row.startsWith('DBKey='));
    const dbIdCookie = cookies.find(row => row.startsWith('DBId='));

    if (dbKeyCookie && dbIdCookie) {
        db_key = decodeURIComponent(dbKeyCookie.split('=')[1]);
        project_id = decodeURIComponent(dbIdCookie.split('=')[1]);
        console.log("DBKey: " + dbKeyCookie);
        console.log("DBKey: " + dbIdCookie);
    } else {
        console.log("DBKey or DBId cookie not found.");
    }   

}

async function fetchPeople() {
    console.log(db_key);
    console.log(project_id);

    // Initialize Supabase
    const SUPABASE_URL = 'https://' + project_id + '.supabase.co';
    const SUPABASE_ANON_KEY = db_key;

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabaseClient.from('Time').select('*');
    console.log(data, error);
    
}