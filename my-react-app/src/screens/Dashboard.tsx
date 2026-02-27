import bgimg from "../assets/Bgfordashboard.png"
import DashboardHeader from "../components/DashboardHeader";

const Dashboard: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <DashboardHeader />

      <div
        className="flex-1 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${bgimg})` }}
      >
      </div>
    </div>
  );
};

export default Dashboard;