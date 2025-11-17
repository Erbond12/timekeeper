function saveCookie() {
    const value = document.getElementById("DBKey").value;

    if (!value) {
        return alert("Please enter a value!");
    }

    // Set expiration 
    // date: yyyy-mm-ddThh:mm:ssZ
    const expireDate = new Date("2026-10-10T00:00:00Z").toUTCString();
    document.cookie = `DBKey=${encodeURIComponent(value)}; expires=${expireDate}; path=/`;

    alert("Saved!")
}

function getCookie() {
    const cookies = document.cookie.split('; ');
    const dbKeyCookie = cookies.find(row => row.startsWith('DBKey='));
    if (dbKeyCookie) {
        const dbKey = decodeURIComponent(dbKeyCookie.split('=')[1]);
        console.log("DBKey: " + dbKeyCookie);
    } else {
        console.log("DBKey cookie not found.");
    }
}