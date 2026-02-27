import bgDesktop from "../assets/Bgfordashboard.png";
import bgMobile from "../assets/Bgfordashboardmobile.png";
import DashboardHeader from "../components/DashboardHeader";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      <DashboardHeader />

      <div className="flex-1 relative overflow-hidden">

        {/* Desktop Image */}
        <img
          src={bgDesktop}
          alt="Dashboard Background"
          className="hidden md:block absolute inset-0 w-full h-full object-fill scale-100"
        />

        {/* Mobile Image */}
        <img
          src={bgMobile}
          alt="Dashboard Background Mobile"
          className="block md:hidden absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}

      </div>
    </div>
  );
};

export default Dashboard;