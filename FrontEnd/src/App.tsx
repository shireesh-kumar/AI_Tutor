import Home from './Home/home';
import Footer from './Footer/footer';
import Header from './Header/header';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header />
      <main className="flex-grow">
        <Home />
      </main>
      <Footer />
    </div>
  );
};
export default App;

