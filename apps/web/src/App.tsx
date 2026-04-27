import { Button, Card } from "@repo/ui";
import { capitalize, formatDate } from "@repo/utils";

function App() {
  const today = formatDate(new Date());
  const title = capitalize("projeto pef3208");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
      }}
    >
      <Card title={title} className="max-w-md w-full">
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
          Bem-vindo ao monorepo de aplicações web do PEF3208.
        </p>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
          Data de hoje: <strong>{today}</strong>
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="primary" onClick={() => alert("Olá!")}>
            Primário
          </Button>
          <Button variant="secondary" onClick={() => alert("Secundário!")}>
            Secundário
          </Button>
          <Button variant="danger" onClick={() => alert("Perigo!")}>
            Perigo
          </Button>
        </div>
      </Card>
    </main>
  );
}

export default App;
