import useSWR from "swr";

const fetchApi = async (key) => {
  const response = await fetch(`${key}`);
  const responseBody = await response.json();
  return responseBody;
};

function StatusPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>Status Page</h1>
      <DataStatus />
    </div>
  );
}

const DataStatus = () => {
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 2000,
  });

  const isDataAvailable = !isLoading && data;

  const updateAtText = isDataAvailable
    ? new Date(data.update_at).toLocaleDateString("pt-BR")
    : "Carregando...";
  const maxconnections = isDataAvailable
    ? data.max_connections
    : "Carregando...";
  const openConnections = isDataAvailable
    ? data.open_connections
    : "Carregando...";
  const avebleConnections = isDataAvailable
    ? maxconnections - openConnections
    : "Carregando...";
  const serverVersion = isDataAvailable ? data.server_version : "Carregando...";

  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        borderRadius: "5px",
        width: "500px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        height: "200px",
      }}
    >
      {[
        ["Última atualização:", updateAtText],
        ["Maximo de conexões permitidas:", maxconnections],
        ["Número e conexões abertas:", openConnections],
        ["Número e conexões disponíves:", avebleConnections],
        ["Versão do servido:", serverVersion],
      ].map(([label, value], index) => (
        <div key={index} style={{ marginLeft: "9rem" }}>
          <b>{label}</b> {value}
        </div>
      ))}
    </div>
  );
};

export default StatusPage;
