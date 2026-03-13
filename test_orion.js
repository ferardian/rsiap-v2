import axios from 'axios';

const testSearch = async () => {
    try {
        const payload = {
            search: {
                value: 'ferry'
            },
            filters: [
                { type: 'or', field: 'no_rkm_medis', operator: 'like', value: '%ferry%' },
                { type: 'or', field: 'nm_pasien', operator: 'like', value: '%ferry%' },
                { type: 'or', field: 'no_peserta', operator: 'like', value: '%ferry%' },
                { type: 'or', field: 'no_ktp', operator: 'like', value: '%ferry%' },
                { type: 'or', field: 'alamat', operator: 'like', value: '%ferry%' },
                { type: 'or', field: 'namakeluarga', operator: 'like', value: '%ferry%' }
            ],
            limit: 5
        };
        const res = await axios.post('http://127.0.0.1:8000/api/v2/pasien/search', payload, {
            headers: {
                Authorization: "Bearer your_token_here" // we can just test the shape in Vue directly
            }
        });
        console.log("Success");
    } catch(e) {
        console.log(e);
    }
}
// just testing the shape
