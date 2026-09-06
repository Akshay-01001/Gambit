import Footer from './Footer';
import Hero from './Hero';
import './Home.css';
import Navbar from './Navbar';

export const Home = () => {
    return (
        <div className="h-screen w-screen overflow-y-auto home-container">
            <Navbar />
            <Hero />
            <Footer />
        </div>
    )
}
