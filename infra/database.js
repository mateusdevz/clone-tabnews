import { Client } from 'pg';

async function query(queryObject) {
    try {
        const client = new Client({
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT,
            password: process.env.POSTGRES_PASSWORD,
            user: process.env.POSTGRES_USER,
            database: process.env.POSTGRES_DATABASE
        });
        await client.connect();
        const result = await client.query(queryObject);
        await client.end();
    
        return result;
    } catch {
        await client.end();
    }
}

export default {
    query: query
};