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
  console.log(isLoading);
  console.log(data);
  let updateAtText = "Carregando...";
  let maxconnections = "Carregando...";
  let openConnections = "Carregando...";
  let avebleConnections = "Carregando...";
  let serverVersion = "Carregando...";

  if (!isLoading && data) {
    updateAtText = new Date(data.update_at).toLocaleDateString("pt-BR");
    maxconnections = data.max_connections;
    openConnections = data.open_connections;
    avebleConnections = maxconnections - openConnections;
    serverVersion = data.server_version;
  }

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
      <div style={{ marginLeft: "9rem" }}>
        {" "}
        <b>Última atualização:</b> {updateAtText}{" "}
      </div>
      <div style={{ marginLeft: "9rem" }}>
        {" "}
        <b>Maximo de conexões permitidas:</b> {maxconnections}{" "}
      </div>
      <div style={{ marginLeft: "9rem" }}>
        {" "}
        <b>Número e conexões abertas:</b> {openConnections}{" "}
      </div>
      <div style={{ marginLeft: "9rem" }}>
        {" "}
        <b>Número e conexões disponíves:</b> {avebleConnections}{" "}
      </div>
      <div style={{ marginLeft: "9rem" }}>
        {" "}
        <b>Versão do servido: </b>
        {serverVersion}{" "}
      </div>
    </div>
  );
};

export default StatusPage;
