import NavBar from "./components/navBar";
import TopBar from "./components/topBar";

export default function Home() {
  return (
    <div className="bg-white h-screen flex flex-row">
      <NavBar />
      <TopBar title="Disponibilidade" />
    </div>
  );
}
