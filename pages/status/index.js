import useSwr from 'swr';

async function fetchApi(key) {
    const response = await fetch(key);
    const responseBody = await response.json();
    console.log(responseBody);
    

    return responseBody;
}

export default function StatusPage() {
    return (
        <>
            <h1>Status</h1>
            <DatabaseInfo />
            <UpdatedAt />
        </>
    )
};

function UpdatedAt() {
    const { isLoading, data } = useSwr("/api/v1/status", fetchApi, {
        refreshInterval: 2000,
    });

    let UpdatedAtText = 'Carregando...';

    if(!isLoading && data) {
        UpdatedAtText = new Date(data.updated_at).toLocaleString('pt-BR');
    }

    return <div>Última atualização: {UpdatedAtText}</div>
}

function DatabaseInfo() {
    const { isLoading, data } = useSwr("/api/v1/status", fetchApi, {
        refreshInterval: 2000,
    });

    let maxConnections = 'Carregando...';
    let openedConnections = 'Carregando...';
    let dbVersion = 'Carregando...';

    if(!isLoading && data) {
        maxConnections = data.dependencies.database.max_connections;
        openedConnections = data.dependencies.database.opened_connections;
        dbVersion = data.dependencies.database.version;
    }

    return (
        <ul>
            <li>
                Banco de dados
                <ul>
                    <li>
                        <span>Conexões máximas: {maxConnections}</span>
                    </li>
                    <li>
                        <span>Conexões abertas: {openedConnections}</span>
                    </li>
                    <li>
                        <span>Versão do banco de dados: {dbVersion}</span>
                    </li>
                </ul>
            </li>
        </ul>
    );
}