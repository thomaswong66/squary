const catalogFetch =
    function (){
        return fetch('http://localhost:4000/list-catalog', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .catch(err => {
            alert('Network error: ' + err);
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorInfo => Promise.reject(errorInfo));
            }else {
                return response.text();
            }
        })
        .then(data => {
            return JSON.parse(data);
        })
    }

export default catalogFetch;