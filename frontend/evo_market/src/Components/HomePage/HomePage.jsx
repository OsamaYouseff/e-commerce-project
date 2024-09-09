/// Components
import MidHeader from "../GenericComponents/Header/MidHeader";
import BottomHeader from "../GenericComponents/Header/BottomHeader";
import HeroSection from "./HeroSection/HeroSection";
import MainContent from "./MainContent/MainContent";

const HomePage = () => {
    return (
        <>
            <MidHeader />
            <BottomHeader />
            <HeroSection />
            <MainContent />
        </>
    );
};
export default HomePage;
