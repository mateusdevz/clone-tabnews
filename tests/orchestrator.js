import retry from 'async-retry';

async function waitForAllServices() {
    await waitForWebService();

    async function waitForWebService() {
        return retry(fetchStatusPage, {
            retries: 100,
        });
       
        async function fetchStatusPage() {
            const response = await fetch('http://localhost:3000/api/v1/status');
            const responseBody = await response.json();
        }
    }  
}

export default {
    waitForAllServices,
};