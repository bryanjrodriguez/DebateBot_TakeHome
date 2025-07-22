
import Sidebar from "./components/SideBar";
import ChatWindow from "./components/ChatWindow";

export default function Home() {
  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
