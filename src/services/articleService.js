import api from './api';

const articleService = {
    getAllArticles() {
        return api.get('/article/get');
    },

    createArticle(data) {
        return api.post('/article/store', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    updateArticle(id, data) {
        return api.post(`/article/update/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteArticle(id) {
        return api.post(`/article/delete/${id}`);
    },

    updateStatus(id, status) {
        return api.post(`/article/update/status/${id}`, { status });
    },
};

export default articleService;
